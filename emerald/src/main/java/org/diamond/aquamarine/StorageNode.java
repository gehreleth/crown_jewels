package org.diamond.aquamarine;

import java.util.UUID;

public class StorageNode {
    private Long id;

    private Long parentId;

    private String name;

    private UUID aquamarineBlobId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UUID getAquamarineBlobId() {
        return aquamarineBlobId;
    }

    public void setAquamarineId(UUID aquamarineBlobId) {
        this.aquamarineBlobId = aquamarineBlobId;
    }
}
