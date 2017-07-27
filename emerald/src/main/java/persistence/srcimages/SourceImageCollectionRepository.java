package persistence.srcimages;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import persistence.srcimages.entities.SourceImageCollection;

@Repository
public interface SourceImageCollectionRepository extends JpaRepository<SourceImageCollection, Long> {
    SourceImageCollection findOneByFileName(String fileName);
}
