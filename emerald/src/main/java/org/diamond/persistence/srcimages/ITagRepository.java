package org.diamond.persistence.srcimages;

import org.diamond.persistence.srcimages.entities.Tag;
import org.diamond.persistence.srcimages.entities.tag_projections.IBrief;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import javax.persistence.QueryHint;
import java.util.List;

@RepositoryRestResource(path = "tag", excerptProjection = IBrief.class)
public interface ITagRepository extends JpaRepository<Tag, Long>  {
    @Query("FROM Tag t WHERE LOWER(t.name) LIKE CONCAT('%',LOWER(:name_pattern),'%')")
    List<Tag> findByNamePattern(@Param("name_pattern") String namePattern);

    @Query("FROM Tag t WHERE LOWER(t.name) = LOWER(:name)")
    @QueryHints(@QueryHint(name = "JDBC_MAX_ROWS", value = "1"))
    Tag findOneByName(@Param("name") String name);
}
