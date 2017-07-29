package org.diamond.controller;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import org.diamond.aquamarine.IAquamarineService;
import org.diamond.aquamarine.IContent;
import org.diamond.aquamarine.SubmitOperationResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@Controller
public class AquamarineJunction {
    @Autowired
    private IAquamarineService aquamarineService;

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

    @GetMapping(value = "/aquamarineJobStatus/{jobId}")
    public ResponseEntity<String> jobStatus(@PathVariable Long jobId) {
        ResponseEntity<String> retVal = null;
        Future<SubmitOperationResult> future = pendingJobs.getIfPresent(jobId);
        if (future != null ) {
            try {
                Gson gson = new Gson();
                JsonElement jsonElement;
                if (future.isDone()) {
                    SubmitOperationResult submitOperationResult = future.get();
                    jsonElement = gson.toJsonTree(new Object[]{"COMPLETE",
                            submitOperationResult.getMessage(),
                            submitOperationResult.getResult(),
                            new Date(submitOperationResult.getTimestamp().toEpochMilli())});
                } else {
                    jsonElement = gson.toJsonTree(new Object[]{"PENDING"});
                }
                String result = jsonElement.toString();
                retVal = ResponseEntity.ok()
                            .contentLength(result.length())
                            .contentType(MediaType.APPLICATION_JSON_UTF8)
                            .body(result);
            } catch (ExecutionException | InterruptedException e) {
                throw new RuntimeException(e);
            }
        } else {
            retVal = ResponseEntity.notFound().build();
        }
        return retVal;
    }

    @PostMapping("/handleFile")
    public String handleFile(@RequestParam("file") CommonsMultipartFile file, RedirectAttributes redirectAttributes) {
        File tmp = null;
        try {
            tmp = new File(System.getProperty("java.io.tmpdir")
                    + File.separator
                    + "file" + System.currentTimeMillis() + ".tmp");
            file.transferTo(tmp);
            Long jobId = trackPendingUploadJob(aquamarineService.submitNewCollection(file.getOriginalFilename(), tmp));
            redirectAttributes.addAttribute("aquamarineJob", jobId);
            tmp = null;
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            if (tmp != null) { try { tmp.delete(); } catch (Exception e) { } }
        }
        return "redirect:/";
    }
}
