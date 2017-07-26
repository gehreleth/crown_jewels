package org.diamond.aquamarine;

import org.postgresql.largeobject.LargeObject;
import org.postgresql.largeobject.LargeObjectManager;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.sql.*;
import java.util.Properties;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Servlet extends HttpServlet {
    private static final Pattern UUID_RE = Pattern.compile("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");
    private static final Class JDBC_DRIVER;
    private static final String jdbcConnString;
    private static final String user;
    private static final String password;
    static {
        InputStream is = null;
        try {
            JDBC_DRIVER = Class.forName("org.postgresql.Driver");
            ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
            is = classLoader.getResourceAsStream("pgsql.properties");
            Properties props = new Properties();
            props.load(is);
            jdbcConnString = props.getProperty("jdbcConnString");
            user = props.getProperty("user");
            password = props.getProperty("password");
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (is != null) {try {is.close();} catch (Exception e) { } }
        }
    }

    private static Connection getConnection() throws SQLException {
        Connection conn = DriverManager.getConnection(jdbcConnString, user, password);
        conn.setAutoCommit(false);
        return conn;
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Connection conn = null;
        try {
            conn = getConnection();
            doGetWithDbConnection(request, response, conn);
        } catch (SQLException e) {
            throw new ServletException(e);
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception e) { } }
        }
    }

    private void doGetWithDbConnection(HttpServletRequest request, HttpServletResponse response, Connection conn) throws IOException, SQLException {
        String path = request.getServletPath();
        if ("/".equals(path)) {
            returnList(response, conn);
        } else {
            returnContent(path, response, conn);
        }
    }

    private void returnList(HttpServletResponse response, Connection conn) throws SQLException, IOException {
        Statement stmt = null;
        try {
            stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("select guid from blob_storage");
            response.setStatus(200);
            response.setContentType("text/plain");
            PrintWriter writer = response.getWriter();
            while (rs.next()) {
                writer.println(rs.getString("guid"));
            }
        } finally {
            if (stmt != null) { try { stmt.close(); } catch (Exception e)  {} }
        }
    }

    private void returnContent(String path, HttpServletResponse response, Connection conn) throws SQLException, IOException {
        PreparedStatement stmt = null;
        try {
            outer:
            do {
                if (!path.startsWith("/")) {
                    sendStatus(response, 400, "Bad request");
                    break outer;
                }
                path = path.substring(1);
                Matcher m = UUID_RE.matcher(path);
                if (!m.matches()) {
                    sendStatus(response, 400, "Bad request");
                    break outer;
                }
                stmt = conn.prepareStatement("select mime_type, get_lo_size(content) as content_length,"
                        + " content from blob_storage where guid = ?");
                stmt.setString(1, path);
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    String contentType = rs.getString("mime_type");
                    long contentLength = rs.getLong("content_length");
                    long oid = rs.getLong("content");
                    response.setStatus(200);
                    response.setContentType(contentType);
                    response.setContentLength((int) contentLength);
                    sendLobContent(conn, oid, response.getOutputStream());
                } else {
                    sendStatus(response, 404, "Content not found");
                }
            } while (false);
        } finally {
            if (stmt != null) { try { stmt.close(); } catch (Exception e)  {} }
        }
    }

    private void sendStatus(HttpServletResponse response, int errorCode, String message) throws IOException {
        response.setStatus(errorCode);
        response.setContentType("text/plain");
        response.getWriter().println(message);
    }

    @Override
    public void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Connection conn = null;
        try {
            conn = getConnection();
            doPutWithDbConnection(request, response, conn);
        } catch (SQLException e) {
            throw new ServletException(e);
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception e) { } }
        }
    }

    private void doPutWithDbConnection(HttpServletRequest request, HttpServletResponse response, Connection conn)
            throws ServletException
    {
        PreparedStatement stmt = null;
        try {
            stmt = conn.prepareStatement("insert into blob_storage(guid, mime_type, content) values(?,?,?)");
            String guid = UUID.randomUUID().toString();
            String contentType = request.getContentType();
            long oid = createLob(conn, request.getInputStream());
            stmt.setString(1, guid);
            stmt.setString(2, contentType);
            stmt.setLong(3, oid);
            stmt.executeUpdate();
            response.setStatus(200);
            response.setContentType("text/plain");
            PrintWriter writer = response.getWriter();
            writer.println(guid);
            conn.commit();
        } catch (Exception e) {
            try { conn.rollback(); } catch (Exception e0)  { }
            throw new ServletException(e);
        } finally {
            if (stmt != null) { try { stmt.close(); } catch (Exception e)  {} }
        }
    }


    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        Connection conn = null;
        try {
            conn = getConnection();
            doPostWithDbConnection(request, response, conn);
        } catch (SQLException e) {
            throw new ServletException(e);
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception e) { } }
        }
    }

    private void doPostWithDbConnection(HttpServletRequest request, HttpServletResponse response, Connection conn)
            throws ServletException
    {
        PreparedStatement stmt = null;
        try {
            outer:
            do {
                String path = request.getServletPath();
                if (!path.startsWith("/")) {
                    sendStatus(response, 400, "Bad request");
                    break outer;
                }
                path = path.substring(1);
                Matcher m = UUID_RE.matcher(path);
                if (!m.matches()) {
                    sendStatus(response, 400, "Bad request");
                    break outer;
                }
                String contentType = request.getContentType();
                long oid = createLob(conn, request.getInputStream());
                stmt = conn.prepareStatement("update blob_storage set mime_type=?, content=? where guid = ?");
                stmt.setString(1, contentType);
                stmt.setLong(2, oid);
                stmt.setString(3, path);
                stmt.executeUpdate();
                if (stmt.executeUpdate() != 0) {
                    sendStatus(response, 200, "Record " + path + " has been updated");
                } else {
                    sendStatus(response, 404, "Content not found");
                }
                conn.commit();
            } while (false);
        } catch (Exception e) {
            try { conn.rollback(); } catch (Exception e0)  { }
            throw new ServletException(e);
        } finally {
            if (stmt != null) { try { stmt.close(); } catch (Exception e)  {} }
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        Connection conn = null;
        try {
            conn = getConnection();
            doDeleteWithDbConnection(request, response, conn);
        } catch (SQLException e) {
            throw new ServletException(e);
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception e) { } }
        }
    }

    private void doDeleteWithDbConnection(HttpServletRequest request, HttpServletResponse response, Connection conn)
            throws ServletException
    {
        PreparedStatement stmt = null;
        String path = request.getServletPath();
        try {
            outer:
            do {
                if (!path.startsWith("/")) {
                    sendStatus(response, 400, "Bad request");
                    break outer;
                }
                path = path.substring(1);
                Matcher m = UUID_RE.matcher(path);
                if (!m.matches()) {
                    sendStatus(response, 400, "Bad request");
                    break outer;
                }
                stmt = conn.prepareStatement("delete from blob_storage where guid = ?");
                stmt.setString(1, path);
                stmt.executeUpdate();
                if (stmt.executeUpdate() != 0) {
                    sendStatus(response, 200, "Record " + path + " has been deleted");
                } else {
                    sendStatus(response, 404, "Content not found");
                }
                conn.commit();
            } while (false);
        } catch (Exception e) {
            try { conn.rollback(); } catch (Exception e0)  { }
            throw new ServletException(e);
        } finally {
            if (stmt != null) { try { stmt.close(); } catch (Exception e)  {} }
        }
    }

    private static long createLob(Connection conn, InputStream inputStream) throws SQLException, IOException {
        LargeObject obj = null;
        long oid;
        try {
            LargeObjectManager lobj = ((org.postgresql.PGConnection) conn).getLargeObjectAPI();
            oid = lobj.createLO(LargeObjectManager.READ | LargeObjectManager.WRITE);
            obj = lobj.open(oid, LargeObjectManager.WRITE);
            byte buf[] = new byte[2048];
            int s = 0;
            while ((s = inputStream.read(buf, 0, 2048)) > 0) {
                obj.write(buf, 0, s);
            }
        } finally {
            if (obj != null) try { obj.close(); } catch (Exception e) { }
        }
        return oid;
    }

    private static void sendLobContent(Connection conn, long oid, OutputStream outputStream) throws SQLException, IOException {
        LargeObject obj = null;
        try {
            LargeObjectManager lobj = ((org.postgresql.PGConnection)conn).getLargeObjectAPI();
            obj = lobj.open(oid, LargeObjectManager.READ);
            byte buf[] = new byte[2048];
            int s = 0;
            while ((s = obj.read(buf, 0, 2048)) > 0) {
                outputStream.write(buf, 0, s);
            }
        } finally {
            if (obj != null) try { obj.close(); } catch (Exception e) { }
        }
    }
}
