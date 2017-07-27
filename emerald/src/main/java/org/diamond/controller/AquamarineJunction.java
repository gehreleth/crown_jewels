package org.diamond.controller;

import org.diamond.aquamarineclient.Aquamarine;
import org.diamond.aquamarineclient.Blob;
import org.diamond.aquamarineclient.BlobISAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.UUID;

@Controller
public class AquamarineJunction {
    @Autowired
    Aquamarine aquamarine;

    @RequestMapping(value = "/img/{aquamarineId}", method = RequestMethod.GET)
    public ResponseEntity<InputStreamResource> img(@PathVariable String aquamarineId) {
        try {
            Blob blob = aquamarine.retrieveBlob(UUID.fromString(aquamarineId));
            return ResponseEntity.ok().contentLength(blob.getLength())
                    .contentType(MediaType.parseMediaType(blob.getMimeType()))
                    .body(new InputStreamResource(new BlobISAdapter(blob)));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
