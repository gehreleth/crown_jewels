package org.diamond.persistence.srcimages;

import org.diamond.persistence.srcimages.entities.ImageMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "image-metadata")
public interface IImageMetadataRepository extends JpaRepository<ImageMetadata, Long> {
    @Query("FROM ImageMetadata AS im WHERE im.storageNode.id = ?1")
    ImageMetadata findOneByStorageNodeId(@Param("storage_node_id") Long storageNodeId);
}
