package org.diamond.persistence.srcimages;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.diamond.persistence.srcimages.entities.SourceImageCollection;

@Repository
public interface ISourceImageCollectionRepository extends JpaRepository<SourceImageCollection, Long> {
    SourceImageCollection findOneByFileName(String fileName);
}
