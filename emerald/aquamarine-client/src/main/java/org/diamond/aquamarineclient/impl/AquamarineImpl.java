package org.diamond.aquamarineclient.impl;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.client.HttpResponseException;
import org.apache.http.client.methods.*;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.protocol.HTTP;
import org.diamond.aquamarineclient.Aquamarine;
import org.diamond.aquamarineclient.Blob;
import org.diamond.aquamarineclient.ContentDesc;

import java.io.*;
import java.util.ArrayList;
import java.util.UUID;

import static java.lang.Long.parseLong;

public class AquamarineImpl implements Aquamarine {
    private final String endpoint;

    public AquamarineImpl(String endpoint) {
        this.endpoint = endpoint;
    }

    @Override
    public Iterable<UUID> listContents() throws IOException {
        Iterable<UUID> retVal;
        try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
            HttpGet httpget = new HttpGet(endpoint);
            try (CloseableHttpResponse response = httpclient.execute(httpget)) {
                int statusCode = response.getStatusLine().getStatusCode();
                if (statusCode == 200) {
                    HttpEntity entity = response.getEntity();
                    retVal = collectBlobList(entity);
                } else {
                    throw new HttpResponseException(statusCode, "Http error");
                }
            }
        }
        return retVal;
    }

    private ArrayList<UUID> collectBlobList(HttpEntity entity) throws IOException {
        ArrayList<UUID> retVal = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(entity.getContent()))) {
            String line;
            while (true) {
                line = reader.readLine();
                if (line == null)
                    break;
                retVal.add(UUID.fromString(line));
            }
        }
        return retVal;
    }

    @Override
    public UUID createBlob(String mimeType, InputStream inputStream, long length) throws IOException {
        UUID retVal;
        try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
            ContentType contentType = ContentType.create(mimeType);
            InputStreamEntity inputEntity = new InputStreamEntity(inputStream, length, contentType);
            HttpPut httpPut = new HttpPut(endpoint + '/');
            httpPut.setEntity(inputEntity);
            try (CloseableHttpResponse response = httpclient.execute(httpPut)) {
                int statusCode = response.getStatusLine().getStatusCode();
                if (statusCode == 200) {
                    HttpEntity entity = response.getEntity();
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(entity.getContent()))) {
                        retVal = UUID.fromString(reader.readLine());
                    }
                } else {
                    throw new HttpResponseException(statusCode, "Http error");
                }
            }
        }
        return retVal;
    }

    @Override
    public Blob retrieveBlob(UUID id) throws IOException {
        return new BlobImpl(endpoint, id);
    }

    @Override
    public ContentDesc retrieveContentDesc(final UUID id) throws IOException {
        ContentDesc retVal;
        try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
            HttpHead httpHead = new HttpHead(endpoint + '/' + id.toString());
            try (CloseableHttpResponse response = httpclient.execute(httpHead)) {
                int statusCode = response.getStatusLine().getStatusCode();
                if (statusCode != 200) {
                    throw new HttpResponseException(statusCode, "Http error");
                }
                final String mimeType = response.getFirstHeader(HTTP.CONTENT_TYPE).getValue();
                final long length = Long.parseLong(response.getFirstHeader(HTTP.CONTENT_LEN).getValue());
                retVal = new ContentDesc() {
                    @Override
                    public UUID getUUID() {
                        return id;
                    }

                    @Override
                    public String getMimeType() {
                        return mimeType;
                    }

                    @Override
                    public long getLength() {
                        return length;
                    }
                };
            }
        }
        return retVal;
    }

    @Override
    public void updateBlob(UUID id, String mimeType, InputStream inputStream, long length) throws IOException {
        try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(endpoint + '/' + id.toString());
            InputStreamEntity inputEntity = new InputStreamEntity(inputStream, length, ContentType.create(mimeType));
            httpPost.setEntity(inputEntity);
            try (CloseableHttpResponse response = httpclient.execute(httpPost)) {
                int statusCode = response.getStatusLine().getStatusCode();
                if (statusCode != 200) {
                    throw new HttpResponseException(statusCode, "Http error");
                }
            }
        }
    }

    @Override
    public void removeBlob(UUID id) throws IOException {
        try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
            HttpDelete httpDelete = new HttpDelete(endpoint + '/' + id.toString());
            try (CloseableHttpResponse response = httpclient.execute(httpDelete)) {
                int statusCode = response.getStatusLine().getStatusCode();
                if (statusCode != 200) {
                    throw new HttpResponseException(statusCode, "Http error");
                }
            }
        }
    }

    private static class BlobImpl implements Blob {
        private final CloseableHttpClient httpclient;
        private final CloseableHttpResponse response;
        private final InputStream inputStream;
        private InputStream wrappedStream = null;
        private final String mimeType;
        private final long contentLength;
        private final UUID id;

        BlobImpl(String endpoint, UUID id) throws IOException {
            httpclient =  HttpClients.createDefault();
            this.id = id;
            HttpGet httpget = new HttpGet(endpoint + '/' + id.toString());
            response = httpclient.execute(httpget);
            int statusCode = response.getStatusLine().getStatusCode();
            if (statusCode == 200) {
                HttpEntity entity = response.getEntity();
                this.mimeType = entity.getContentType().getValue();
                this.contentLength = entity.getContentLength();
                this.inputStream = entity.getContent();
            } else {
                throw new HttpResponseException(statusCode, "Http error");
            }
        }

        @Override
        public UUID getUUID() {
            return id;
        }

        @Override
        public String getMimeType() {
            return mimeType;
        }

        @Override
        public long getLength() {
            return contentLength;
        }

        @Override
        public InputStream getContentStream() throws IOException {
            if (wrappedStream == null) {
                wrappedStream = new BlobISAdapter(this, inputStream);
            }
            return wrappedStream;
        }

        @Override
        public void close() throws IOException {
            if (inputStream != null) { try {inputStream.close(); } catch (Exception e) { } }
            if (response != null) { try {response.close();} catch (Exception e) { } }
            if (httpclient != null) { try {httpclient.close();} catch (Exception e) { } }
        }
    }

    private static class BlobISAdapter extends InputStream {
        private final Blob blob;
        private final InputStream underlyingStream;

        public BlobISAdapter(Blob blob, InputStream underlyingStream) throws IOException {
            this.blob = blob;
            this.underlyingStream = underlyingStream;
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
}
