package org.diamond.persistence.srcimages.entities;

import javax.persistence.*;

@SuppressWarnings("serial")
@Entity
@Table(name = "content_region")
public class Region {
    @Id
    @Column(name = "id")
    @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="content_metadata")
    private ContentMetadata contentMetadata;

    @Column(name = "text")
    private String text;

    @Column(name = "left_edge")
    private int left;

    @Column(name = "top_edge")
    private int top;

    @Column(name = "right_edge")
    private int right;

    @Column(name = "bottom_edge")
    private int bottom;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ContentMetadata getContentMetadata() {
        return contentMetadata;
    }

    public void setContentMetadata(ContentMetadata contentMetadata) {
        this.contentMetadata = contentMetadata;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public int getLeft() {
        return left;
    }

    public void setLeft(int left) {
        this.left = left;
    }

    public int getTop() {
        return top;
    }

    public void setTop(int top) {
        this.top = top;
    }

    public int getRight() {
        return right;
    }

    public void setRight(int right) {
        this.right = right;
    }

    public int getBottom() {
        return bottom;
    }

    public void setBottom(int bottom) {
        this.bottom = bottom;
    }
}
