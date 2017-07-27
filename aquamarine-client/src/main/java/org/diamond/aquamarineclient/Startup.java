package org.diamond.aquamarineclient;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.*;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.Args;
import org.diamond.aquamarineclient.impl.AquamarineImpl;

import java.io.*;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

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
        Aquamarine aquamarine = new AquamarineImpl(args[1]);
        int retVal = 0;
        Iterable<UUID> uuids = aquamarine.listContents();
        for (UUID uuid: uuids) {
            System.out.println(uuid.toString());
        }
        return retVal;
    }

    private static int performGetRequest(String[] args) throws IOException {
        Aquamarine aquamarine = new AquamarineImpl(args[1]);
        int retVal = 0;
        try (Blob blob = aquamarine.retrieveBlob(UUID.fromString(args[2]))) {
            InputStream is = blob.getContentStream();
            try (OutputStream os = new FileOutputStream(args[3])) {
                byte buf[] = new byte[2048];
                int s;
                while ((s = is.read(buf, 0, 2048)) > 0) {
                    os.write(buf, 0, s);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return retVal;
    }

    private static int performPutRequest(String[] args) throws IOException {
        Aquamarine aquamarine = new AquamarineImpl(args[1]);
        File file = new File(args[2]);
        if (!file.exists()) {
            System.err.println("File " + file + "not found");
            return 1;
        }
        String mimeType = Files.probeContentType(file.toPath());
        long length = file.length();
        try (InputStream inputStream = new FileInputStream(file)) {
            UUID blob = aquamarine.createBlob(mimeType, inputStream, length);
            System.out.println("New blob " + blob.toString() + " created");
        }
        return 0;
    }

    // --alter endpoint id file
    private static int performAlterRequest(String[] args) throws IOException {
        Aquamarine aquamarine = new AquamarineImpl(args[1]);
        UUID id = UUID.fromString(args[2]);
        File file = new File(args[3]);
        if (!file.exists()) {
            System.err.println("File " + file + " not found");
            return 1;
        }
        String mimeType = Files.probeContentType(file.toPath());
        long length = file.length();
        try (InputStream inputStream = new FileInputStream(file)) {
            aquamarine.updateBlob(id, mimeType, inputStream, length);
            System.out.println("The blob " + id.toString() + " has been altered");
        }
        return 0;
    }

    // --delete endpoint id
    private static int performDeleteRequest(String[] args) throws IOException {
        Aquamarine aquamarine = new AquamarineImpl(args[1]);
        UUID id = UUID.fromString(args[2]);
        aquamarine.removeBlob(id);
        return 0;
    }
}
