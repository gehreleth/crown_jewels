package org.diamond.controller.repr;

import org.diamond.persistence.srcimages.entities.NodeType;

import java.util.UUID;

public class NodeJsonRepr {
    private Long id;
    private NodeType type;
    private String text;
    private NodeJsonRepr[] children;
    private UUID aquamarineId;
    private Long contentLength;
    private String mimeType;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public NodeType getType() {
        return type;
    }

    public void setType(NodeType type) {
        this.type = type;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public NodeJsonRepr[] getChildren() {
        return children;
    }

    public void setChildren(NodeJsonRepr[] children) {
        this.children = children;
    }

    public UUID getAquamarineId() {
        return aquamarineId;
    }

    public void setAquamarineId(UUID aquamarineId) {
        this.aquamarineId = aquamarineId;
    }

    public Long getContentLength() {
        return contentLength;
    }

    public void setContentLength(Long contentLength) {
        this.contentLength = contentLength;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }
}