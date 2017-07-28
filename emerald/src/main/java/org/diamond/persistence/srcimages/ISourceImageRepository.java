package org.diamond.persistence.srcimages;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.diamond.persistence.srcimages.entities.SourceImage;

@Repository
public interface ISourceImageRepository extends JpaRepository<SourceImage, Long>  {
}
