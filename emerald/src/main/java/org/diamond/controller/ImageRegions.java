package org.diamond.controller;

import org.diamond.controller.repr.RegionsHavingTagsParams;
import org.springframework.hateoas.Link;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collection;

@RestController
@RequestMapping("/image-regions")
public class ImageRegions {
    @PostMapping(value = "/regions-having-tags")
    @Transactional(readOnly = true)
    public Collection<Link> regionsHavingTags(@RequestBody RegionsHavingTagsParams params) {
        Collection<Link> retVal = new ArrayList<>();
        try {
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return retVal;
    }
}
