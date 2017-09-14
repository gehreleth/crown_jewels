package org.diamond.controller;

import com.google.gson.*;
import org.diamond.persistence.srcimages.IImageMetadataRepository;
import org.diamond.persistence.srcimages.IRegionRepository;
import org.diamond.persistence.srcimages.entities.ImageMetadata;
import org.diamond.persistence.srcimages.entities.ImageRegion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.ArrayList;
import java.util.Iterator;

@RestController
@RequestMapping(value = "/put-metadata-regions")
public class ImgRegionEditorSave {
    private static final Logger LOGGER = LoggerFactory.getLogger(ImgRegionEditorSave.class);

    private final Gson gson = new Gson();

    @Autowired
    private IRegionRepository regionRepository;

    @Autowired
    private IImageMetadataRepository imageMetadataRepository;

    @PutMapping("/{imageMetadataId}")
    @Transactional
    public ResponseEntity<String> save(@PathVariable("imageMetadataId") Long imageMetadataId,
                                       RequestEntity<String> requestEntity)
    {
        ResponseEntity<String> retVal;
        try {
            JsonObject reqRoot = gson.fromJson(requestEntity.getBody(), JsonObject.class);

            JsonObject embedded = reqRoot.getAsJsonObject("_embedded");
            if (embedded == null)
                throw new RuntimeException("Malformed request");

            JsonArray imageRegions = embedded.getAsJsonArray("imageRegions");
            if (imageRegions == null)
                throw new RuntimeException("Malformed request");

            ArrayList<Region> parsedRegions = parseRegions(imageRegions);

            ImageMetadata imageMetadata = imageMetadataRepository.findOne(imageMetadataId);
            if (imageMetadata == null)
                throw new RuntimeException("Malformed request");

            ArrayList<ImageRegion> pool = new ArrayList<>();
            pool.addAll(imageMetadata.getRegions());
            while (pool.size() > parsedRegions.size()) {
                ImageRegion shrink = pool.remove(pool.size() - 1);
                regionRepository.delete(shrink.getId());
            }

            while (pool.size() < parsedRegions.size()) {
                pool.add(new ImageRegion());
            }

            URI url = requestEntity.getUrl();
            String ourServer = url.toString();                                               // XXX: I haven't found better approach
            ourServer = ourServer.substring(0, ourServer.length() - url.getPath().length()); // Hateoas helper methods throws cryptic assertions
            JsonArray rspRegions = new JsonArray();
            for (int i = 0; i < parsedRegions.size(); ++i) {
                ImageRegion q = pool.get(i);
                Region w = parsedRegions.get(i);
                q.setImageMetadata(imageMetadata);
                q.setText(w.text);
                q.setX(w.x);
                q.setY(w.y);
                q.setWidth(w.width);
                q.setHeight(w.height);
                q = regionRepository.save(q);
                String link = ourServer + "/emerald/rest-jpa/img-region/" + q.getId();        // XXX: I haven't found better approach
                rspRegions.add(rwl(q, link));
            }
            regionRepository.flush();
            JsonObject rspRoot = new JsonObject();
            JsonObject rspImageRegions = new JsonObject();
            rspImageRegions.add("imageRegions", rspRegions);
            rspRoot.add("_embedded", rspImageRegions);
            JsonObject rspRel = new JsonObject();
            rspRel.addProperty("href", ourServer + "/emerald/rest-jpa/image-metadata/" + imageMetadataId);
            JsonObject rspLinks = new JsonObject();
            rspLinks.add("imageMetadata", rspRel);
            rspRoot.add("_links", rspLinks);
            retVal = ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body(gson.toJson(rspRoot));
        } catch (Exception e) {
            LOGGER.error("save", e);
            retVal = ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON_UTF8).body("{}");
        }
        return retVal;
    }

    private JsonObject rwl(ImageRegion ir, String link) {
        JsonObject retVal = new JsonObject();
        retVal.addProperty("text", ir.getText());
        retVal.addProperty("x", ir.getX());
        retVal.addProperty("y", ir.getY());
        retVal.addProperty("width", ir.getWidth());
        retVal.addProperty("height", ir.getHeight());

        JsonObject rel = new JsonObject();
        rel.addProperty("href", link);
        JsonObject links = new JsonObject();
        links.add("self", rel);
        retVal.add("_links", links);
        return retVal;
    }

    private ArrayList<Region> parseRegions(JsonArray arg) {
        ArrayList<Region> retVal = new ArrayList<>();
        for (Iterator<JsonElement> itr = arg.iterator(); itr.hasNext();) {
            JsonObject obj = itr.next().getAsJsonObject();
            Region region = new Region();
            JsonElement element = obj.get("text");
            if (element != null && !element.isJsonNull()) {
                region.text = element.getAsString();
            }
            element = obj.get("x");
            if (element != null && !element.isJsonNull()) {
                region.x = element.getAsDouble();
            } else {
                throw new RuntimeException("Lacking mandatory parameter: X");
            }
            element = obj.get("y");
            if (element != null && !element.isJsonNull()) {
                region.y = element.getAsDouble();
            } else {
                throw new RuntimeException("Lacking mandatory parameter: Y");
            }
            element = obj.get("width");
            if (element != null && !element.isJsonNull()) {
                region.width = element.getAsDouble();
            } else {
                throw new RuntimeException("Lacking mandatory parameter: Width");
            }
            element = obj.get("height");
            if (element != null && !element.isJsonNull()) {
                region.height = element.getAsDouble();
            } else {
                throw new RuntimeException("Lacking mandatory parameter: Height");
            }
            retVal.add(region);
        }
        return retVal;
    }

    private static class Region {
        String text;
        double x;
        double y;
        double width;
        double height;
    }
}
