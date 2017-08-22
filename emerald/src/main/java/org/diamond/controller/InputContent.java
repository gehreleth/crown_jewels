package org.diamond.controller;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import org.diamond.aquamarine.IAquamarineService;
import org.diamond.aquamarine.SubmitOperationResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@Controller
@RequestMapping("/input-content")
public class InputContent {
    private static final Logger LOGGER = LoggerFactory.getLogger(InputContent.class);

    private static long jobIdSeed = 0L;

    private final Cache<Long, Future<SubmitOperationResult> > pendingJobs =
            CacheBuilder.newBuilder().expireAfterAccess(5, TimeUnit.MINUTES).build();

    private static synchronized long genJobId() {
        return ++jobIdSeed;
    }

    @Autowired
    private IAquamarineService aquamarineService;

    private Long trackPendingUploadJob(Future<SubmitOperationResult> job) {
        Long retVal = genJobId();
        pendingJobs.put(retVal, job);
        return retVal;
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
