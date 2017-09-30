package org.diamond.components;

import org.diamond.controller.ImageRegionSubsets;
import org.diamond.persistence.srcimages.entities.im_projections.IRegionSubsets;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceProcessor;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.methodOn;

@Component
public class RegionSubsetsProc implements ResourceProcessor<Resource<IRegionSubsets>> {

    @Override
    public Resource<IRegionSubsets> process(Resource<IRegionSubsets> resource) {
        Link link = linkTo(methodOn(ImageRegionSubsets.class)
                .regionsHavingTags(resource.getContent().getId(), null))
                .withRel("regionsHavingTags");
        resource.add(link);
        return resource;
    }
}
