package org.diamond.persistence.srcimages.entities;

import javax.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@SuppressWarnings("serial")
@Entity
@Table(name = "storage_node")
public class StorageNode {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="parent_id")
    private StorageNode parent;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="parent")
    @OrderBy("text")
    private List<StorageNode> children;

    @Column(name = "node_type")
    private NodeType nodeType;

    @Column(name = "text")
    private String text;

    @Column(name = "aquamarine_id")
    private UUID aquamarineId;

    @Column(name = "upload_ts")
    private Instant uploadTs;

    @OneToOne(fetch = FetchType.LAZY, mappedBy="storageNode")
    private ImageMetadata imageMetadata;

    public StorageNode() { }

    public static StorageNode makeNewZip(String text, Instant uploadTs) {
        StorageNode retVal = new StorageNode();
        retVal.setNodeType(NodeType.Zip);
        retVal.setText(text);
        retVal.setParent(null);
        retVal.setUploadTs(uploadTs);
        return retVal;
    }

    public static StorageNode makeNewDirectory(StorageNode parent, String text) {
        StorageNode retVal = new StorageNode();
        retVal.setNodeType(NodeType.Folder);
        retVal.setText(text);
        retVal.setParent(parent);
        retVal.setUploadTs(null);
        return retVal;
    }

    public static StorageNode makeNewImage(StorageNode parent, String text, UUID aquamarineId) {
        StorageNode retVal = new StorageNode();
        retVal.setNodeType(NodeType.Image);
        retVal.setText(text);
        retVal.setParent(parent);
        retVal.setUploadTs(null);
        retVal.setAquamarineId(aquamarineId);
        return retVal;
    }

    public static StorageNode makeNewOther(StorageNode parent, String text, UUID aquamarineId) {
        StorageNode retVal = new StorageNode();
        retVal.setNodeType(NodeType.Other);
        retVal.setText(text);
        retVal.setParent(parent);
        retVal.setUploadTs(null);
        retVal.setAquamarineId(aquamarineId);
        return retVal;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public StorageNode getParent() {
        return parent;
    }

    public void setParent(StorageNode parent) {
        this.parent = parent;
    }

    public List<StorageNode> getChildren() {
        return children;
    }

    public void setChildren(List<StorageNode> children) {
        this.children = children;
    }

    public NodeType getNodeType() {
        return nodeType;
    }

    public void setNodeType(NodeType nodeType) {
        this.nodeType = nodeType;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public UUID getAquamarineId() {
        return aquamarineId;
    }

    public void setAquamarineId(UUID aquamarineId) {
        this.aquamarineId = aquamarineId;
    }

    public Instant getUploadTs() {
        return uploadTs;
    }

    public void setUploadTs(Instant uploadTs) {
        this.uploadTs = uploadTs;
    }

    public ImageMetadata getImageMetadata() {
        return imageMetadata;
    }

    public void setImageMetadata(ImageMetadata imageMetadata) {
        this.imageMetadata = imageMetadata;
    }
}
