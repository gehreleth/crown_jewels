package org.diamond.controller;

import org.diamond.controller.repr.ImageRegionRepr;
import org.diamond.controller.repr.RegionsHavingTagsParams;
import org.diamond.persistence.srcimages.IRegionRepository;
import org.diamond.persistence.srcimages.entities.ImageRegion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.EntityLinks;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/image-region-subsets")
public class ImageRegionSubsets {
    @Autowired
    private IRegionRepository regionRepository;

    @Autowired
    private EntityLinks entityLinks;

    @PostMapping(value = "/regions-having-tags")
    @Transactional(readOnly = true)
    public List<ImageRegionRepr> regionsHavingTags(@RequestParam(value = "imageMetadataId", required = false) Long imageMetadataId,
                                                   @RequestBody RegionsHavingTagsParams params)
    {
        List<ImageRegionRepr> retVal;
        try {
            String[] tags = params != null ? params.getTags() : null;
            if (tags != null) {
                HashSet<String> tagsSet = new HashSet<>();
                tagsSet.addAll(Arrays.asList(tags));
                List<ImageRegion> resultSet;
                if (imageMetadataId != null) {
                    resultSet = regionRepository.findRegionsByMetaWithTag(imageMetadataId, tagsSet);
                } else {
                    resultSet = regionRepository.findRegionsWithTag(tagsSet);
                }
                retVal = resultSet.stream().map(this::toRepr).collect(Collectors.toList());
            } else {
                retVal = null;
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return retVal;
    }

    private ImageRegionRepr toRepr(ImageRegion arg) {
        ImageRegionRepr retVal = new ImageRegionRepr();
        retVal.setText(arg.getText());
        retVal.setX(arg.getX());
        retVal.setY(arg.getY());
        retVal.setWidth(arg.getWidth());
        retVal.setHeight(arg.getHeight());
        retVal.setStatus(arg.getStatus());
        retVal.add(entityLinks.linkToSingleResource(ImageRegion.class, arg.getId()).withSelfRel());
        return retVal;
    }
}
