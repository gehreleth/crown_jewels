package org.diamond.persistence.srcimages.entities;

import javax.persistence.*;
import java.util.List;

@SuppressWarnings("serial")
@Entity
@Table(name = "image_metadata")
public class ImageMetadata {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "storage_node_id", unique = true)
    private StorageNode storageNode;

    @Column(name = "rotation")
    private Rotation rotation;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "imageMetadata")
    private List<ImageRegion> regions;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public StorageNode getStorageNode() {
        return storageNode;
    }

    public void setStorageNode(StorageNode storageNode) {
        this.storageNode = storageNode;
    }

    public Rotation getRotation() {
        return rotation;
    }

    public void setRotation(Rotation rotation) {
        this.rotation = rotation;
    }

    public List<ImageRegion> getRegions() {
        return regions;
    }

    public void setRegions(List<ImageRegion> imageRegions) {
        this.regions = imageRegions;
    }
}
