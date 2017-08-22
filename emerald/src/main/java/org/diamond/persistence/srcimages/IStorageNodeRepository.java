package org.diamond.persistence.srcimages;

import org.diamond.persistence.srcimages.entities.StorageNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(path = "storage-node")
public interface IStorageNodeRepository  extends JpaRepository<StorageNode, Long> {
    @Query("FROM StorageNode sn WHERE sn.parent is null order by sn.uploadTs ASC")
    List<StorageNode> findAllRootNodes();

    @Query("FROM StorageNode sn WHERE sn.text LIKE lower(?1) AND sn.parent is null")
    List<StorageNode> findAllRootNodesWithTextPattern(String textPattern);
}
