package org.diamond.controller;

import mediautil.image.jpeg.LLJTran;
import mediautil.image.jpeg.LLJTranException;
import org.apache.commons.lang3.tuple.Pair;
import org.diamond.aquamarine.IContent;
import org.diamond.persistence.srcimages.entities.Rotation;
import org.postgresql.largeobject.LargeObject;
import org.postgresql.largeobject.LargeObjectManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.AbstractResource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.sql.DataSource;
import java.io.*;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Controller
@RequestMapping("/blobs")
public class AquamarineProxy {
    private static final Logger LOGGER = LoggerFactory.getLogger(AquamarineProxy.class);

    @Autowired
    private DataSource dataSource;

    private static final Set<String> KNOWN_IMAGE_FORMATS = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList("image/jpeg", "image/png")));

    @GetMapping(value = "/{aquamarineId}")
    public ResponseEntity<AbstractResource> get(@PathVariable UUID aquamarineId,
                                                @RequestParam(value="rot", required=false) Rotation rot)
    {
        if (rot == null)
            rot = Rotation.NONE;
        ResponseEntity<AbstractResource> retVal;
        try {
            IContent content;
            try (Connection conn = dataSource.getConnection()) {
                conn.setAutoCommit(false);
                content = retrieveContent(conn, aquamarineId);
            }
            AbstractResource resource;
            long length;
            if (rot == Rotation.NONE) {
                resource = content.getData();
                length = content.getLength();
            } else {
                Pair<AbstractResource, Long> rotatedContent = performRotation(content, rot);
                resource = rotatedContent.getLeft();
                length = rotatedContent.getRight();
            }
            retVal = ResponseEntity.ok()
                    .contentLength(length)
                    .contentType(MediaType.parseMediaType(content.getMimeType()))
                    .body(resource);
        } catch (Exception e) {
            LOGGER.error("getContent", e);
            retVal = ResponseEntity.notFound().build();
        }
        return retVal;
    }

    private IContent retrieveContent(Connection conn, UUID uuid) throws SQLException, IOException {
        IContent retVal;
        try (PreparedStatement stmt = conn.prepareStatement(
                "select mime_type, get_lo_size(content) as content_length, content" +
                        " from blob_storage where guid = ?"))
        {
            stmt.setString(1, uuid.toString());
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    final String contentType = rs.getString("mime_type");
                    final long contentLength = rs.getLong("content_length");
                    long oid = rs.getLong("content");
                    final ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    sendLobContent(conn, oid, baos);
                    retVal = new IContent() {
                        @Override
                        public AbstractResource getData() {
                            return new InputStreamResource(new ByteArrayInputStream(baos.toByteArray()));
                        }

                        @Override
                        public String getMimeType() {
                            return contentType;
                        }

                        @Override
                        public long getLength() {
                            return contentLength;
                        }
                    };
                } else {
                    throw new FileNotFoundException("File not found:" + uuid.toString());
                }
            }
        }
        return retVal;
    }


    private static Pair<AbstractResource, Long> performRotation(IContent content, Rotation rot) throws IOException, LLJTranException {
        final String mimeType = content.getMimeType();
        if (!KNOWN_IMAGE_FORMATS.contains(mimeType))
            throw new RuntimeException("Rotate isn't applicable for mime type " + mimeType);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (InputStream is = content.getData().getInputStream()) {
            if ("image/jpeg".equals(mimeType)) {
                rotateJpeg(is, baos, rot);
            } else if ("image/png".equals(mimeType)) {
                rotatePng(is, baos, rot);
            } else {
                throw new RuntimeException("Rotate isn't applicable for mime type " + mimeType);
            }
        } finally {
            baos.close();
        }
        byte[] byteArray = baos.toByteArray();
        return Pair.of(new ByteArrayResource(byteArray), (long) byteArray.length);
    }

    private static void rotateJpeg(InputStream is, OutputStream os, Rotation rot) throws LLJTranException, IOException {
        LLJTran jpegTransform = null;
        try {
            jpegTransform = new LLJTran(is);
            jpegTransform.read(LLJTran.READ_ALL, true);
            int tsf;
            switch (rot) {
                case CW90:
                    tsf = LLJTran.ROT_90;
                    break;
                case CW180:
                    tsf = LLJTran.ROT_180;
                    break;
                case CW270:
                    tsf = LLJTran.ROT_270;
                    break;
                case CCW90:
                    tsf = LLJTran.ROT_270;
                    break;
                case CCW180:
                    tsf = LLJTran.ROT_180;
                    break;
                case CCW270:
                    tsf = LLJTran.ROT_90;
                    break;
                default:
                    tsf = LLJTran.ROT_90;
            }
            jpegTransform.transform(tsf);
            jpegTransform.save(os, LLJTran.OPT_WRITE_ALL);
        } finally {
            if (jpegTransform != null) { try { jpegTransform.freeMemory(); } catch (Exception e0) { } }
        }
    }

    private static void rotatePng(InputStream is, OutputStream os, Rotation rot) {
        throw new RuntimeException("PNG rotation not implemented");
    }

    private static final int LOB_BUFF_SIZE = 65536;

    private static long createLob(Connection conn, InputStream inputStream) throws SQLException, IOException {
        LargeObject obj = null;
        long oid;
        try {
            LargeObjectManager lobj = ((org.postgresql.PGConnection) conn).getLargeObjectAPI();
            oid = lobj.createLO(LargeObjectManager.READ | LargeObjectManager.WRITE);
            obj = lobj.open(oid, LargeObjectManager.WRITE);
            byte buf[] = new byte[LOB_BUFF_SIZE];
            int s;
            while ((s = inputStream.read(buf, 0, LOB_BUFF_SIZE)) > 0) {
                obj.write(buf, 0, s);
            }
        } finally {
            if (obj != null) try { obj.close(); } catch (Exception e) { }
        }
        return oid;
    }

    private static void sendLobContent(Connection conn, long oid, OutputStream outputStream) throws SQLException, IOException {
        org.postgresql.PGConnection nativeConn = conn.unwrap(org.postgresql.PGConnection.class);
        LargeObject obj = null;
        try {
            LargeObjectManager lobj = nativeConn.getLargeObjectAPI();
            obj = lobj.open(oid, LargeObjectManager.READ);
            byte buf[] = new byte[LOB_BUFF_SIZE];
            int s;
            while ((s = obj.read(buf, 0, LOB_BUFF_SIZE)) > 0) {
                outputStream.write(buf, 0, s);
            }
        } finally {
            if (obj != null) try { obj.close(); } catch (Exception e) { }
        }
    }
}
