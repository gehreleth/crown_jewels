package org.diamond.controller;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.gson.*;
import mediautil.image.jpeg.LLJTran;
import mediautil.image.jpeg.LLJTranException;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.http.HttpStatus;
import org.diamond.aquamarine.IAquamarineService;
import org.diamond.aquamarine.IContent;
import org.diamond.aquamarine.IContentInfo;
import org.diamond.aquamarine.SubmitOperationResult;
import org.diamond.persistence.srcimages.IStorageNodeRepository;
import org.diamond.persistence.srcimages.entities.Rotation;
import org.diamond.persistence.srcimages.entities.StorageNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.AbstractResource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;

import java.util.*;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@Controller
@RequestMapping("/storage")
public class AquamarineJunction {
    private static final Logger LOGGER = LoggerFactory.getLogger(AquamarineJunction.class);

    @Autowired
    private IAquamarineService aquamarineService;

    @Autowired
    private IStorageNodeRepository storageNodeRepository;

    private static long jobIdSeed = 0L;

    private final Cache<Long, Future<SubmitOperationResult> > pendingJobs =
            CacheBuilder.newBuilder().expireAfterAccess(5, TimeUnit.MINUTES).build();

    private static synchronized long genJobId() {
        return ++jobIdSeed;
    }

    private Long trackPendingUploadJob(Future<SubmitOperationResult> job) {
        Long retVal = genJobId();
        pendingJobs.put(retVal, job);
        return retVal;
    }

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

    private static final Set<String> KNOWN_IMAGE_FORMATS = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList("image/jpeg", "image/png")));

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

    @GetMapping(value = "/populate-root")
    public ResponseEntity<String> populateRoot() {
        ResponseEntity<String> retVal;
        try {
            JsonElement je = collectNodes(storageNodeRepository.findAllRootNodes());
            retVal = ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body(je.toString());
        } catch (Exception e) {
            LOGGER.error("populateRoot", e);
            retVal = ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).contentType(MediaType.TEXT_PLAIN).body(e.getMessage());
        }
        return retVal;
    }

    @GetMapping(value = "/populate-children/{parentId}")
    @Transactional(readOnly = true)
    public ResponseEntity<String> populateChildren(@PathVariable Long parentId) {
        ResponseEntity<String> retVal;
        try {
            JsonElement je = collectNodes(storageNodeRepository.findOne(parentId).getChildren());
            retVal = ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body(je.toString());
        } catch (Exception e) {
            LOGGER.error("populateChildren", e);
            retVal = ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).contentType(MediaType.TEXT_PLAIN).body(e.getMessage());
        }
        return retVal;
    }

    @GetMapping(value = "/populate-branch/{terminalNodeId}")
    @Transactional(readOnly = true)
    public ResponseEntity<String> populateBranch(@PathVariable Long terminalNodeId) {
        ResponseEntity<String> retVal;
        try {
            ArrayList<StorageNode> branch = new ArrayList<>();
            StorageNode node = storageNodeRepository.findOne(terminalNodeId);
            while (node != null) {
                branch.add(node);
                node = node.getParent();
            }
            Collections.reverse(branch); // Order : from root to leaf
            JsonElement jse = mergeEachBranchNodeWithSiblings(branch);
            retVal = ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body(jse.toString());
        } catch (Exception e) {
            LOGGER.error("populateBranch", e);
            retVal = ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).contentType(MediaType.TEXT_PLAIN).body(e.getMessage());
        }
        return retVal;
    }

    private JsonElement mergeEachBranchNodeWithSiblings(Collection<StorageNode> branch) {
        return mergeEachBranchNodeWithSiblings0(branch.iterator());
    }

    private JsonElement mergeEachBranchNodeWithSiblings0(Iterator<StorageNode> branchItr) {
        JsonElement retVal = JsonNull.INSTANCE;
        if (branchItr.hasNext()) {
           StorageNode sn = branchItr.next();
           JsonObject branchNode = convertNodeToJson(sn);
           JsonElement nextBranchNode = mergeEachBranchNodeWithSiblings0(branchItr);
           if (!nextBranchNode.isJsonNull()) {
               JsonArray nextBranchNodeSiblings = collectNodes(sn.getChildren());
               Long nextBranchNodeId = getIdField(nextBranchNode);
               for (int i = 0; i < nextBranchNodeSiblings.size(); ++i) {
                   Long id = getIdField(nextBranchNodeSiblings.get(i));
                   if (nextBranchNodeId.equals(id)) {
                       nextBranchNodeSiblings.set(i, nextBranchNode);
                       break;
                   }
               }
               branchNode.add("children", nextBranchNodeSiblings);
           }
           retVal = branchNode;
        }
        return retVal;
    }

    private static Long getIdField(JsonElement jse) {
        Long retVal = null;
        try {
            JsonObject oo = jse.isJsonObject() ? jse.getAsJsonObject() : null;
            if (oo != null) {
                JsonElement eeid = oo.has("id") ? oo.get("id") : null;
                retVal = eeid != null ? eeid.getAsLong() : null;
            }
        } catch (Exception e) {
            LOGGER.error("Bad typecast", e);
        }
        return retVal;
    }

    private JsonArray collectNodes(Collection<StorageNode> arg) {
        final JsonArray retVal = new JsonArray();
        arg.stream().map(this::convertNodeToJson).forEach(retVal::add);
        return retVal;
    }

    private JsonObject convertNodeToJson(StorageNode storageNode) {
        JsonObject jso;
        try {
            UUID aquamarineId = storageNode.getAquamarineId();
            Long contentLength = null;
            String mimeType = null;
            String aquamarineIdStr = null;
            if (aquamarineId != null) {
                aquamarineIdStr = aquamarineId.toString();
                IContentInfo contentInfo = aquamarineService.retrieveContentInfo(aquamarineId);
                contentLength = contentInfo.getLength();
                mimeType = contentInfo.getMimeType();
            }
            jso = new JsonObject();
            jso.addProperty("id", storageNode.getId());
            jso.addProperty("type", storageNode.getNodeType().toString());
            jso.addProperty("text", storageNode.getText());
            jso.add("children", JsonNull.INSTANCE);
            jso.addProperty("aquamarineId", aquamarineIdStr);
            jso.addProperty("contentLength", contentLength);
            jso.addProperty("mimeType", mimeType);
        } catch (Exception e1) {
            throw new RuntimeException(e1);
        }
        return jso;
    }

    @GetMapping(value = "/submit-status/{submitId}")
    public ResponseEntity<String> jobStatus(@PathVariable Long submitId)  {
        ResponseEntity<String> entity;
        Future<SubmitOperationResult> future = pendingJobs.getIfPresent(submitId);
        try {
            if (future != null) {
                JsonObject jsobj = new JsonObject();
                jsobj.addProperty("status", "PENDING");
                jsobj.add("message", JsonNull.INSTANCE);
                jsobj.add("timestamp", JsonNull.INSTANCE);
                if (future.isDone()) {
                    SubmitOperationResult submitOperationResult = future.get();
                    jsobj.addProperty("status", submitOperationResult.getResult().toString());
                    jsobj.addProperty("message", submitOperationResult.getMessage());
                    jsobj.addProperty("timestamp", submitOperationResult.getTimestamp().toEpochMilli());
                }
                entity = ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body(jsobj.toString());
            } else {
                entity = ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            LOGGER.error("jobStatus", e);
            entity = ResponseEntity.badRequest().build();
        }
        return entity;
    }

    @PostMapping("/submit-content")
    public ResponseEntity<String> handleFile(@RequestParam("file") CommonsMultipartFile file) {
        File tmp = null;
        ResponseEntity<String> retVal;
        try {
            tmp = new File(System.getProperty("java.io.tmpdir")
                    + File.separator
                    + "file" + System.currentTimeMillis() + ".tmp");
            file.transferTo(tmp);
            Long jobId = trackPendingUploadJob(aquamarineService.submitNewCollection(file.getOriginalFilename(), tmp));
            JsonObject jsobj = new JsonObject();
            jsobj.addProperty("success", Boolean.TRUE);
            jsobj.addProperty("trackingId", jobId);
            String str = jsobj.toString();
            retVal = ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body(str);
            tmp = null; // If everything is ok, this temporary file is in async worker's possession now
        } catch (IOException e) {
            LOGGER.error("handleFile", e);
            retVal = ResponseEntity.badRequest().build();
        } finally {
            if (tmp != null) { try { tmp.delete(); } catch (Exception e) { } }
        }
        return retVal;
    }
}
