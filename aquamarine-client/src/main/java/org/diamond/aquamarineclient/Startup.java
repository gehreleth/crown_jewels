package org.diamond.aquamarineclient;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.*;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.Args;

import java.io.*;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class Startup {
    public static final Set<String> KNOWN_COMMANDS;
    static {
        HashSet<String> knownCommands = new HashSet<>();
        knownCommands.add("--list");
        knownCommands.add("--get");
        knownCommands.add("--put");
        knownCommands.add("--alter");
        knownCommands.add("--delete");
        KNOWN_COMMANDS = Collections.unmodifiableSet(knownCommands);
    }

    public static void main(String[] args) throws IOException {
        if (args.length < 1 || !KNOWN_COMMANDS.contains(args[0])) {
            System.err.println("Usage aquamarineclient --list endpoint | --get endpoint id [output_file]\n"
                    +"\t | --put endpoint [input_file] | --alter endpoint id file\n"
                    +"\t | --delete endpoint id\n");
            System.exit(1);
        } else {
            int retCode;
            if ("--list".equals(args[0])) {
                retCode = performListRequest(args);
            } else if ("--get".equals(args[0])) {
                retCode = performGetRequest(args);
            } else if ("--put".equals(args[0])) {
                retCode = performPutRequest(args);
            } else if ("--alter".equals(args[0])) {
                retCode = performAlterRequest(args);
            } else if ("--delete".equals(args[0])) {
                retCode = performDeleteRequest(args);
            } else {
                throw new RuntimeException("Shouldn't be here");
            }
            System.exit(retCode);
        }
    }

    private static int performListRequest(String[] args) throws IOException {
        String endpoint = args[1];
        CloseableHttpClient httpclient = HttpClients.createDefault();
        CloseableHttpResponse response = null;
        int retVal = 0;
        try {
            HttpGet httpget = new HttpGet(endpoint);
            response = httpclient.execute(httpget);
            int statusCode = response.getStatusLine().getStatusCode();
            if (statusCode == 200) {
                HttpEntity entity = response.getEntity();
                printEntityContent(entity);
            } else {
                System.err.print("Server returned error status: " + String.valueOf(statusCode)
                        + " " + response.getStatusLine().getReasonPhrase());
                retVal = 2;
            }
        } finally {
            if (response != null) { try {response.close();} catch (Exception e) { }}
        }
        return retVal;
    }

    private static void printEntityContent(HttpEntity entity) throws IOException {
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new InputStreamReader(entity.getContent()));
            String line;
            while (true) {
                line = reader.readLine();
                if (line == null)
                    break;
                System.out.println(line);
            }
        } finally {
            if (reader != null) { try {reader.close();} catch (Exception e) { } }
        }
    }

    private static int performGetRequest(String[] args) {
        int retVal = 0;
        return retVal;
    }

    private static int performPutRequest(String[] args) throws IOException {
        String endpoint = args[1] + "/";
        CloseableHttpClient httpclient = HttpClients.createDefault();
        CloseableHttpResponse response = null;
        InputStream is = null;
        int retVal = 0;
        try {
            outer:
            do {
                File file = new File(args[2]);
                if (!file.exists()) {
                    System.err.print("Can't find input file: " + args[2]);
                    retVal = 1;
                    break outer;
                }
                ContentType contentType = ContentType.create(Files.probeContentType(file.toPath()));
                long length = file.length();
                is = new FileInputStream(file);
                InputStreamEntity inputEntity = new InputStreamEntity(is, length, contentType);
                HttpPut httpPut = new HttpPut(endpoint);
                httpPut.setEntity(inputEntity);
                response = httpclient.execute(httpPut);
                int statusCode = response.getStatusLine().getStatusCode();
                if (statusCode == 200) {
                    HttpEntity entity = response.getEntity();
                    printEntityContent(entity);
                } else {
                    System.err.print("Server returned error status: " + String.valueOf(statusCode)
                            + " " + response.getStatusLine().getReasonPhrase());
                }
            } while (false);
        } finally {
            if (is != null) { try { is.close();} catch (Exception e) { } }
            if (response != null) { try {response.close();} catch (Exception e) { }}
        }
        return retVal;
    }

    private static int performAlterRequest(String[] args) throws IOException {
        String endpoint = args[1];
        CloseableHttpClient httpclient = HttpClients.createDefault();
        CloseableHttpResponse response = null;
        InputStream is = null;
        int retVal = 0;
        try {
            outer:
            do {
                File file = new File(args[2]);
                if (!file.exists()) {
                    System.err.print("Can't find input file: " + args[2]);
                    retVal = 1;
                    break outer;
                }
                ContentType contentType = ContentType.create(Files.probeContentType(file.toPath()));
                long length = file.length();
                is = new FileInputStream(file);
                InputStreamEntity inputEntity = new InputStreamEntity(is, length, contentType);
                HttpPost httpPost = new HttpPost(endpoint);
                httpPost.setEntity(inputEntity);
                response = httpclient.execute(httpPost);
                int statusCode = response.getStatusLine().getStatusCode();
                if (statusCode == 200) {
                    HttpEntity entity = response.getEntity();
                    printEntityContent(entity);
                } else {
                    System.err.print("Server returned error status: " + String.valueOf(statusCode)
                            + " " + response.getStatusLine().getReasonPhrase());
                }
            } while (false);
        } finally {
            if (is != null) { try { is.close();} catch (Exception e) { } }
            if (response != null) { try {response.close();} catch (Exception e) { }}
        }
        return retVal;
    }

    private static int performDeleteRequest(String[] args) throws IOException {
        String endpoint = args[1];
        CloseableHttpClient httpclient = HttpClients.createDefault();
        CloseableHttpResponse response = null;
        int retVal = 0;
        try {
            HttpDelete httpDelete = new HttpDelete(endpoint);
            response = httpclient.execute(httpDelete);
            int statusCode = response.getStatusLine().getStatusCode();
            if (statusCode == 200) {
                HttpEntity entity = response.getEntity();
                printEntityContent(entity);
            } else {
                System.err.print("Server returned error status: " + String.valueOf(statusCode)
                        + " " + response.getStatusLine().getReasonPhrase());
                retVal = 2;
            }
        } finally {
            if (response != null) { try {response.close();} catch (Exception e) { }}
        }
        return retVal;
    }
}
