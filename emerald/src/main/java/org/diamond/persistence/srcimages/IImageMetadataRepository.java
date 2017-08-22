package org.diamond.persistence.srcimages;

import org.diamond.persistence.srcimages.entities.ImageMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "image-metadata")
public interface IImageMetadataRepository extends JpaRepository<ImageMetadata, Long> {
}
