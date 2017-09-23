package org.diamond.persistence.srcimages.entities.tag_projections;

import org.diamond.persistence.srcimages.entities.Tag;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "name_only", types = Tag.class)
public interface INameOnly {
    String getTag();
}
