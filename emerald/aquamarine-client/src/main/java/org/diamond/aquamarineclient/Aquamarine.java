package org.diamond.aquamarineclient;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

public interface Aquamarine {
    Iterable<UUID> listContents() throws IOException;
    UUID createBlob(String mimeType, InputStream inputStream, long length) throws IOException;
    ContentDesc retrieveContentDesc(UUID id) throws IOException;
    Blob retrieveBlob(UUID id) throws IOException;
    void updateBlob(UUID id, String mimeType, InputStream inputStream, long length) throws IOException;
    void removeBlob(UUID id) throws IOException;
}
