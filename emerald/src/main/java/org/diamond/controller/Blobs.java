package org.diamond.controller;

import com.google.common.cache.*;
import java.awt.Rectangle;
import mediautil.image.jpeg.LLJTran;
import mediautil.image.jpeg.LLJTranException;
import org.apache.commons.io.FileUtils;
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
public class Blobs {
    private static long seed = System.currentTimeMillis();

    private static final Logger LOGGER = LoggerFactory.getLogger(Blobs.class);

    private static synchronized File makeTmpFile() {
        return new File(System.getProperty("java.io.tmpdir")
                + File.separator
                + "img_cache" + (++seed) + ".tmp");
    }

    @Autowired
    private DataSource dataSource;

    private static final Set<String> KNOWN_IMAGE_FORMATS = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList("image/jpeg", "image/png")));

    /**
     * Return blob from internal storage. Perform server-side JPEG rotation&cropping if additional parameters are
     * provided.
     *
     * Server-side caching is supported. That means it stores transformed fragment in a temp file for some time.
     *
     * TODO: - Support PNG
     * TODO: - Support Client-side caching as well (Cache-Control/ETag/HTTP 304)
     *
     * @param uuid primary key in the blob storage
     * @param rot rotation NONE, CW90-CW270, CCW90-CCCW270
     * @param x crop rect x
     * @param y crop rect y
     * @param width crop rect width
     * @param height crop rect height
     * @return response entity as binary stream
     */
    @GetMapping(value = "/{uuid}")
    public ResponseEntity<AbstractResource> get(@PathVariable UUID uuid,
                                                @RequestParam(value="rot", required=false) Rotation rot,
                                                @RequestParam(value="x", required=false) Integer x,
                                                @RequestParam(value="y", required=false) Integer y,
                                                @RequestParam(value="width", required=false) Integer width,
                                                @RequestParam(value="height", required=false) Integer height)
    {
        ResponseEntity<AbstractResource> retVal;
        try {
            BlobCacheKey key = new BlobCacheKey();
            key.uuid = uuid;
            key.rotation = rot;
            key.x = x;
            key.y = y;
            key.width = width;
            key.height = height;
            IContent content = cachedImages.get(key);
            retVal = ResponseEntity.ok().contentLength(content.getLength())
                        .contentType(MediaType.parseMediaType(content.getMimeType())).body(content.getData());
        } catch (Exception e) {
            LOGGER.error("getContent", e);
            retVal = ResponseEntity.notFound().build();
        }
        return retVal;
    }

    private final CacheLoader<BlobCacheKey, CachedContent> loader = new CacheLoader<BlobCacheKey, CachedContent> () {
        public CachedContent load(BlobCacheKey key) throws Exception {
            IContent content;
            try (Connection conn = dataSource.getConnection()) {
                conn.setAutoCommit(false);
                content = retrieveContent(conn, key.uuid);
            }
            content = applyTransformations(content, key);
            File tmp = makeTmpFile();
            FileUtils.copyInputStreamToFile(content.getData().getInputStream(), tmp);
            return new CachedContent(tmp, content.getLength(), content.getMimeType());
        }
    };

    private final RemovalListener<BlobCacheKey, CachedContent> removalListener = removal -> {
        try {
            File file = removal.getValue().tmpFile;
            if (!file.delete()) {
                LOGGER.warn("Can't remove temporary file :" + file.getName());
            }
        } catch (Exception e) {
            LOGGER.error("Cache removal listener", e);
        }
    };

    // TODO: Take cache size from project configuration
    private final LoadingCache<BlobCacheKey, CachedContent> cachedImages = CacheBuilder.newBuilder()
            .maximumSize(100).removalListener(removalListener).build(loader);

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

    private IContent applyTransformations(final IContent content, BlobCacheKey key) throws IOException, LLJTranException {
        boolean nullTransform = (key.rotation == null || key.rotation == Rotation.NONE)
                && (key.x == null) && (key.y == null) && (key.width == null) && (key.height == null);
        if (!nullTransform) {
            final String mimeType = content.getMimeType();
            if (!KNOWN_IMAGE_FORMATS.contains(mimeType)) {
                throw new RuntimeException("Rotate isn't applicable for mime type " + mimeType);
            }
            final Pair<AbstractResource, Long> transformed;
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (InputStream is = content.getData().getInputStream()) {
                if ("image/jpeg".equals(mimeType)) {
                    transformJpeg(is, baos, key);
                } else if ("image/png".equals(mimeType)) {
                    transformPng(is, baos, key);
                } else {
                    throw new RuntimeException("Rotate isn't applicable for mime type " + mimeType);
                }
            } finally {
                baos.close();
            }
            byte[] byteArray = baos.toByteArray();
            transformed = Pair.of(new ByteArrayResource(byteArray), (long) byteArray.length);
            return new IContent() {
                @Override
                public String getMimeType() {
                    return mimeType;
                }

                @Override
                public long getLength() {
                    return transformed.getRight();
                }

                @Override
                public AbstractResource getData() {
                    return transformed.getLeft();
                }
            };
        } else {
            return content;
        }
    }

    private static void transformJpeg(InputStream is, OutputStream os, BlobCacheKey key) throws LLJTranException, IOException {
        LLJTran jpegTransform = null;
        try {
            jpegTransform = new LLJTran(is);
            jpegTransform.read(LLJTran.READ_ALL, true);
            int tsf;
            if (key.rotation != null && key.rotation != Rotation.NONE) {
                switch (key.rotation) {
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
            }
            if (key.x != null || key.y != null || key.width != null || key.height != null) {
                Rectangle cropArea = new Rectangle();
                cropArea.x = key.x != null ? key.x : 0;
                cropArea.y = key.y != null ? key.y : 0;
                cropArea.width = key.width != null ? key.width : 0;
                cropArea.height = key.height != null ? key.height : 0;
                jpegTransform.transform(LLJTran.CROP, LLJTran.OPT_DEFAULTS, cropArea);
            }
            jpegTransform.save(os, LLJTran.OPT_WRITE_ALL);
        } finally {
            if (jpegTransform != null) { try { jpegTransform.freeMemory(); } catch (Exception e0) { } }
        }
    }

    private static void transformPng(InputStream is, OutputStream os, BlobCacheKey key) {
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


    private static class BlobCacheKey {
        UUID uuid;

        Rotation rotation;

        Integer x;

        Integer y;

        Integer width;

        Integer height;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;

            BlobCacheKey that = (BlobCacheKey) o;

            if (uuid != null ? !uuid.equals(that.uuid) : that.uuid != null) return false;
            if (rotation != that.rotation) return false;
            if (x != null ? !x.equals(that.x) : that.x != null) return false;
            if (y != null ? !y.equals(that.y) : that.y != null) return false;
            if (width != null ? !width.equals(that.width) : that.width != null) return false;
            return height != null ? height.equals(that.height) : that.height == null;
        }

        @Override
        public int hashCode() {
            int result = uuid != null ? uuid.hashCode() : 0;
            result = 31 * result + (rotation != null ? rotation.hashCode() : 0);
            result = 31 * result + (x != null ? x.hashCode() : 0);
            result = 31 * result + (y != null ? y.hashCode() : 0);
            result = 31 * result + (width != null ? width.hashCode() : 0);
            result = 31 * result + (height != null ? height.hashCode() : 0);
            return result;
        }
    }

    private static class CachedContent implements IContent {
        final File tmpFile;

        final long length;

        final String mimeType;

        CachedContent(File tmpFile, long length, String mimeType) {
            this.tmpFile = tmpFile;
            this.length = length;
            this.mimeType = mimeType;
        }

        @Override
        public AbstractResource getData() {
            InputStreamResource retVal;
            try {
                retVal = new InputStreamResource(new FileInputStream(tmpFile));
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            return retVal;
        }

        @Override
        public String getMimeType() {
            return mimeType;
        }

        @Override
        public long getLength() {
            return length;
        }
    }
}
