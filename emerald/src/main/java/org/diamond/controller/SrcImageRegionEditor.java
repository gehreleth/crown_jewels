package org.diamond.controller;

import org.diamond.persistence.srcimages.IContentMetadataRepository;
import org.diamond.persistence.srcimages.IRegionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/region-editor")
public class SrcImageRegionEditor {
    @Autowired
    private IContentMetadataRepository contentMetadataRepository;

    @Autowired
    private IRegionRepository regionRepository;

    @GetMapping(value = "/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body("test test test");
    }
}
