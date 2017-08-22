package org.diamond.persistence.srcimages;

import org.diamond.persistence.srcimages.entities.Region;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IRegionRepository extends JpaRepository<Region, Long> {
}
