package org.diamond.persistence.srcimages;

import org.diamond.persistence.srcimages.entities.ImageRegion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "img-region")
public interface IRegionRepository extends JpaRepository<ImageRegion, Long> {
}
