package org.diamond.persistence.srcimages.entities.tag_projections;

import org.diamond.persistence.srcimages.entities.Tag;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "full", types = Tag.class)
public interface IFull {
    String getName();
    String getDescription();
}
