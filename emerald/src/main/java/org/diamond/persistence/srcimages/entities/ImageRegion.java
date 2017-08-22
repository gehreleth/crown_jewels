package org.diamond.persistence.srcimages.entities;

import javax.persistence.*;

@SuppressWarnings("serial")
@Entity
@Table(name = "image_region")
public class ImageRegion {
    @Id
    @Column(name = "id")
    @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="image_metadata")
    private ImageMetadata imageMetadata;

    @Column(name = "text")
    private String text;

    @Column(name = "left_bound")
    private int left;

    @Column(name = "top_bound")
    private int top;

    @Column(name = "right_bound")
    private int right;

    @Column(name = "bottom_bound")
    private int bottom;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ImageMetadata getImageMetadata() {
        return imageMetadata;
    }

    public void setImageMetadata(ImageMetadata imageMetadata) {
        this.imageMetadata = imageMetadata;
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
