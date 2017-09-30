package org.diamond.persistence.srcimages.entities.im_projections;

import org.diamond.persistence.srcimages.entities.ImageRegion;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "region_subsets", types = ImageRegion.class)
public interface IRegionSubsets {
    Long getId();
}
