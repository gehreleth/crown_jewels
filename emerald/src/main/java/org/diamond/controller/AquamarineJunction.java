package org.diamond.controller;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.gson.*;
import org.diamond.aquamarine.IAquamarineService;
import org.diamond.aquamarine.IContent;
import org.diamond.aquamarine.SubmitOperationResult;
import org.diamond.persistence.srcimages.IStorageNodeRepository;
import org.diamond.persistence.srcimages.entities.StorageNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import java.io.File;
import java.io.IOException;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@Controller
@RequestMapping("/storage")
public class AquamarineJunction {
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

    @GetMapping(value = "/img/{aquamarineId}")
    public ResponseEntity<InputStreamResource> img(@PathVariable UUID aquamarineId) {
        ResponseEntity<InputStreamResource> retVal;
        try {
            IContent content = aquamarineService.retrieveContent(aquamarineId);
            retVal = ResponseEntity.ok()
                        .contentLength(content.getLength())
                        .contentType(MediaType.parseMediaType(content.getMimeType()))
                        .body(content.getData());
        } catch (Exception e) {
            retVal = ResponseEntity.notFound().build();
        }
        return retVal;
    }

    @GetMapping(value = "/browse")
    public ResponseEntity<String> browse() {
        JsonElement je = collectNodes(storageNodeRepository.findAllRootNodes());
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body(je.toString());
    }

    @GetMapping(value = "/browse/{parentId}")
    public ResponseEntity<String> browse(@PathVariable Long parentId) {
        StorageNode parent = storageNodeRepository.findOne(parentId);
        JsonElement je = collectNodes(storageNodeRepository.findAllChildrenByParentId(parentId));
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body(je.toString());
    }

    private static JsonElement collectNodes(List<StorageNode> arg) {
        final JsonArray retVal = new JsonArray();
        arg.stream().map((StorageNode storageNode) -> {
                    JsonObject e = new JsonObject();
                    e.addProperty("id", storageNode.getId());
                    e.addProperty("type", storageNode.getNodeType().toString());
                    e.addProperty("text", storageNode.getText());
                    UUID aquamarineId = storageNode.getAquamarineId();
                    e.addProperty("aquamarineId", aquamarineId != null ? aquamarineId.toString() : null);
                    return e;
                }).forEach(retVal::add);
        return retVal;
    }

    @GetMapping(value = "/submit-status/{submitId}")
    public ResponseEntity<String> jobStatus(@PathVariable Long submitId) throws ExecutionException, InterruptedException {
        ResponseEntity<String> entity;
        Future<SubmitOperationResult> future = pendingJobs.getIfPresent(submitId);
        if (future != null) {
            JsonObject jsobj = new JsonObject();
            jsobj.addProperty("status","PENDING");
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
        return entity;
    }

    @PostMapping("/submit-content")
    public ResponseEntity<String> handleFile(@RequestParam("file") CommonsMultipartFile file) throws IOException {
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
        } finally {
            if (tmp != null) { try { tmp.delete(); } catch (Exception e) { } }
        }
        return retVal;
    }
}
