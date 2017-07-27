package org.diamond.aquamarineclient;

import java.io.IOException;
import java.io.InputStream;

public class BlobISAdapter extends InputStream {
    private final Blob blob;
    private final InputStream underlyingStream;

    public BlobISAdapter(Blob blob) throws IOException {
        this.blob = blob;
        this.underlyingStream = blob.getContentStream();
    }

    @Override
    public int read() throws IOException {
        return this.underlyingStream.read();
    }

    @Override
    public int read(byte[] b) throws IOException {
        return this.underlyingStream.read(b);
    }

    @Override
    public int read(byte[] b, int off, int len) throws IOException {
        return this.underlyingStream.read(b, off, len);
    }

    @Override
    public long skip(long n) throws IOException {
        return this.underlyingStream.skip(n);
    }

    @Override
    public int available() throws IOException {
        return this.underlyingStream.available();
    }

    @Override
    public synchronized void mark(int readlimit) {
        this.underlyingStream.mark(readlimit);
    }

    @Override
    public synchronized void reset() throws IOException {
        this.underlyingStream.reset();
    }

    @Override
    public boolean markSupported() {
        return this.underlyingStream.markSupported();
    }

    @Override
    public void close() throws IOException {
        try {
            blob.close();
        } catch (Exception e) {
            throw new IOException(e);
        }
    }
}
