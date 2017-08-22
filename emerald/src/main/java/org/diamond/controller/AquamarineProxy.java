package org.diamond.controller;

import com.google.gson.JsonObject;
import mediautil.image.jpeg.LLJTran;
import mediautil.image.jpeg.LLJTranException;
import org.apache.commons.lang3.tuple.Pair;
import org.diamond.aquamarine.IAquamarineService;
import org.diamond.aquamarine.IContent;
import org.diamond.aquamarine.IContentInfo;
import org.diamond.persistence.srcimages.IContentMetadataRepository;
import org.diamond.persistence.srcimages.IRegionRepository;
import org.diamond.persistence.srcimages.entities.Rotation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.AbstractResource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.*;

@Controller
@RequestMapping("/region-editor")
public class SrcImageRegionEditor {
    private static final Logger LOGGER = LoggerFactory.getLogger(SrcImageRegionEditor.class);

    @Autowired
    private IContentMetadataRepository contentMetadataRepository;

    @Autowired
    private IRegionRepository regionRepository;

    @Autowired
    private IAquamarineService aquamarineService;

    private static final Set<String> KNOWN_IMAGE_FORMATS = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList("image/jpeg", "image/png")));

    @GetMapping(value = "/get-content-info/{aquamarineId}")
    public ResponseEntity<String> getContentInfo(@PathVariable UUID aquamarineId) {
        ResponseEntity<String> retVal;
        try {
            IContentInfo contentInfo = aquamarineService.retrieveContentInfo(aquamarineId);
            JsonObject jso = new JsonObject();
            jso.addProperty("mimeType", contentInfo.getMimeType());
            jso.addProperty("length", contentInfo.getLength());
            retVal = ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body(jso.toString());
        } catch (Exception e) {
            LOGGER.error("getContentInfo", e);
            retVal = ResponseEntity.notFound().build();
        }
        return retVal;
    }

    @GetMapping(value = "/get-content/{aquamarineId}")
    public ResponseEntity<AbstractResource> getContent(@PathVariable UUID aquamarineId,
                                                       @RequestParam(value="rot", required=false) Rotation rot)
    {
        if (rot == null)
            rot = Rotation.NONE;
        ResponseEntity<AbstractResource> retVal;
        try {
            IContent content = aquamarineService.retrieveContent(aquamarineId);
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
        LLJTran jpegTransform = new LLJTran(is);
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
    }

    private static void rotatePng(InputStream is, OutputStream os, Rotation rot) {
        throw new RuntimeException("PNG rotation not implemented");
    }
}
