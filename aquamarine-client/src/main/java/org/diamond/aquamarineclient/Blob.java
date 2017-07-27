package org.diamond.aquamarineclient;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

public interface Blob extends AutoCloseable {
    UUID getUUID();
    String getMimeType();
    long getLength();
    InputStream getContentStream() throws IOException;
}
