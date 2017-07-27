package persistence.srcimages;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import persistence.srcimages.entities.SourceImage;

@Repository
public interface SourceImageRepository extends JpaRepository<SourceImage, Long>  {
}
