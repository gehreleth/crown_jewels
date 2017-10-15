package org.diamond.persistence.srcimages.entities.im_projections;

import org.diamond.persistence.srcimages.entities.ImageMetadata;
import org.diamond.persistence.srcimages.entities.Rotation;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "brief", types = ImageMetadata.class)
public interface IBrief {
    Rotation getRotation();
}
