package org.diamond.controller;

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
import java.util.HashMap;
import java.util.UUID;
import java.util.concurrent.Future;

@Controller
public class AquamarineJunction {
    @Autowired
    private IAquamarineService aquamarineService;

    private final HashMap<UUID, Future<SubmitOperationResult> > pendingJobs = new HashMap<>();

    private UUID trackPendingUploadJob(Future<SubmitOperationResult> job) {
        UUID uuid;
        synchronized (pendingJobs) {
            uuid = UUID.randomUUID();
            pendingJobs.put(uuid, job);
        }
        return uuid;
    }

    @RequestMapping(value = "/img/{aquamarineId}", method = RequestMethod.GET)
    public ResponseEntity<InputStreamResource> img(@PathVariable String aquamarineId) {
        ResponseEntity<InputStreamResource> retVal;
        try {
            IContent content = aquamarineService.retrieveContent(UUID.fromString(aquamarineId));
            retVal = ResponseEntity.ok()
                        .contentLength(content.getLength())
                        .contentType(MediaType.parseMediaType(content.getMimeType()))
                        .body(content.getData());
        } catch (Exception e) {
            retVal = ResponseEntity.notFound().build();
        }
        return retVal;
    }

    @PostMapping("/handleFile")
    public String handleFileUpload(@RequestParam("file") CommonsMultipartFile file, RedirectAttributes redirectAttributes) {
        File tmp = null;
        try {
            tmp = new File(System.getProperty("java.io.tmpdir")
                    + File.separator
                    + "file" + System.currentTimeMillis() + ".tmp");
            file.transferTo(tmp);
            UUID jobId = trackPendingUploadJob(aquamarineService.submitNewCollection(file.getOriginalFilename(), tmp));
            redirectAttributes.addAttribute("pendingUploadJob", jobId);
            tmp = null;
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            if (tmp != null) { try { tmp.delete(); } catch (Exception e) { } }
        }
        return "redirect:/";
    }

    public void processImageCollection(CommonsMultipartFile file) {
    }
}
