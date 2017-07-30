package org.diamond.persistence.srcimages;

import org.diamond.persistence.srcimages.entities.SourceImageCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.diamond.persistence.srcimages.entities.SourceImage;

import java.util.List;

@Repository
public interface ISourceImageRepository extends JpaRepository<SourceImage, Long>  {
    List<SourceImage> findAllBySourceImageCollection(SourceImageCollection sourceImageCollection);
}
