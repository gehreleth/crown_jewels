package org.diamond.persistence.srcimages;

import org.diamond.persistence.srcimages.entities.ImageRegion;
import org.diamond.persistence.srcimages.entities.ir_projections.IBrief;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Set;

@RepositoryRestResource(path = "img-region", excerptProjection = IBrief.class)
public interface IRegionRepository extends JpaRepository<ImageRegion, Long> {
    @Query("FROM ImageRegion r0" +
            " WHERE EXISTS (SELECT 1 FROM ImageRegion r JOIN r.tags t WHERE r.id = r0.id AND t.name IN(?1))" +
            " ORDER BY r0.y, r0.x")
    List<ImageRegion> findRegionsWithTag(@Param("tag") Set<String> tags);

    @Query("FROM ImageRegion r0" +
            " WHERE r0.imageMetadata.id = ?1" +
            " AND EXISTS (SELECT 1 FROM ImageRegion r JOIN r.tags t WHERE r.id = r0.id AND t.name IN(?2))" +
            " ORDER BY r0.y, r0.x")
    List<ImageRegion> findRegionsByMetaWithTag(@Param("image-metadata-id") Long imageMetadataId, @Param("tag") Set<String> tags);
}
