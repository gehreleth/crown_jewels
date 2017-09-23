package org.diamond.persistence.srcimages.entities.ir_projections;

import org.diamond.persistence.srcimages.entities.ImageRegion;
import org.diamond.persistence.srcimages.entities.ImageRegionStatus;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "brief", types = ImageRegion.class)
public interface IBrief {
    double getX();
    double getY();
    double getWidth();
    double getHeight();
    String getText();
    ImageRegionStatus getStatus();
}
