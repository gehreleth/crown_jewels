package org.diamond.controller;

import org.diamond.aquamarineclient.Aquamarine;
import org.diamond.aquamarineclient.Blob;
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
        ResponseEntity<InputStreamResource> retVal;
        Blob blob = null;
        try {
            blob = aquamarine.retrieveBlob(UUID.fromString(aquamarineId));
            retVal = ResponseEntity.ok().contentLength(blob.getLength())
                        .contentType(MediaType.parseMediaType(blob.getMimeType()))
                        .body(new InputStreamResource(blob.getContentStream()));
            blob = null;
        } catch (Exception e) {
            retVal = ResponseEntity.notFound().build();
        } finally {
            if (blob != null) try { blob.close(); } catch (Exception e) { }
        }
        return retVal;
    }
}
