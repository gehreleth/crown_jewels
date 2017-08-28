package org.diamond.persistence.srcimages.entities;

import javax.persistence.*;

@SuppressWarnings("serial")
@Entity
@Table(name = "image_region")
public class ImageRegion {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="image_metadata")
    private ImageMetadata imageMetadata;

    @Column(name = "text")
    private String text;

    @Column(name = "left_bound")
    private double left;

    @Column(name = "top_bound")
    private double top;

    @Column(name = "right_bound")
    private double right;

    @Column(name = "bottom_bound")
    private double bottom;

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

    public double getLeft() {
        return left;
    }

    public void setLeft(double left) {
        this.left = left;
    }

    public double getTop() {
        return top;
    }

    public void setTop(double top) {
        this.top = top;
    }

    public double getRight() {
        return right;
    }

    public void setRight(double right) {
        this.right = right;
    }

    public double getBottom() {
        return bottom;
    }

    public void setBottom(double bottom) {
        this.bottom = bottom;
    }
}
