package org.diamond.persistence.srcimages;

import org.diamond.persistence.srcimages.entities.StorageNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface IStorageNodeRepository  extends JpaRepository<StorageNode, Long> {
    @Query("FROM StorageNode sn WHERE sn.parent is null order by sn.uploadTs ASC")
    List<StorageNode> findAllRootNodes();
    List<StorageNode> findAllByParentOrderByTextAsc(StorageNode parent);
}
