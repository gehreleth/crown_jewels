package org.diamond.aquamarineclient;

import java.io.Closeable;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

public interface Blob extends ContentDesc, Closeable {
    InputStream getContentStream() throws IOException;
}
