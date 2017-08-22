package org.diamond.persistence.srcimages;

import org.diamond.persistence.srcimages.entities.ContentMetadata;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IContentMetadataRepository extends JpaRepository<ContentMetadata, Long> {
}
