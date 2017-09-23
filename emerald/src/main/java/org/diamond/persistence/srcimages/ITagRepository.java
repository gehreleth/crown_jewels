package org.diamond.persistence.srcimages;

import org.diamond.persistence.srcimages.entities.StorageNode;
import org.diamond.persistence.srcimages.entities.Tag;
import org.diamond.persistence.srcimages.entities.tag_projections.INameOnly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(path = "tag", excerptProjection = INameOnly.class)
public interface ITagRepository extends JpaRepository<Tag, Long>  {
    @Query("FROM Tag t WHERE t.name LIKE lower(?1)")
    List<StorageNode> findByNamePattern(String textPattern);
}
