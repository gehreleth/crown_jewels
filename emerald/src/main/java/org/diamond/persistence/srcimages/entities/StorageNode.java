package org.diamond.persistence.srcimages.entities;

import javax.persistence.*;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@SuppressWarnings("serial")
@Entity
@Table(name = "storage_node")
public class StorageNode {
    @Id
    @Column(name = "id")
    @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, cascade={CascadeType.ALL})
    @JoinColumn(name="parent_id")
    private StorageNode parent;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="parent")
    private Set<StorageNode> children;

    @Column(name = "node_type")
    private NodeType nodeType;

    @Column(name = "text")
    private String text;

    @Column(name = "aquamarine_id")
    private UUID aquamarineId;

    @Column(name = "upload_ts")
    private Instant uploadTs;

    public Long getId() {
        return id;
    }

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

    public static StorageNode makeNewImage(StorageNode parent, String text, UUID quamarineId) {
        StorageNode retVal = new StorageNode();
        retVal.setNodeType(NodeType.Image);
        retVal.setText(text);
        retVal.setParent(parent);
        retVal.setUploadTs(null);
        retVal.setAquamarineId(quamarineId);
        return retVal;
    }

    public static StorageNode makeNewOther(StorageNode parent, String text, UUID quamarineId) {
        StorageNode retVal = new StorageNode();
        retVal.setNodeType(NodeType.Other);
        retVal.setText(text);
        retVal.setParent(parent);
        retVal.setUploadTs(null);
        retVal.setAquamarineId(quamarineId);
        return retVal;
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

    public Set<StorageNode> getChildren() {
        return children;
    }

    public void setChildren(Set<StorageNode> children) {
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
}
