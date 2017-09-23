package org.diamond.persistence.srcimages.entities;

import javax.persistence.*;
import java.util.List;

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

    @Column(name = "x")
    private double x;

    @Column(name = "y")
    private double y;

    @Column(name = "width")
    private double width;

    @Column(name = "status", nullable = false)
    private ImageRegionStatus status = ImageRegionStatus.HighUncertainty;

    @Column(name = "height")
    private double height;

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "tag_region",
               joinColumns = { @JoinColumn(name = "region_id", nullable = false, updatable = false) },
               inverseJoinColumns = { @JoinColumn(name = "tag_id", nullable = false, updatable = false) })
    private List<Tag> tags;

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

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

    public double getWidth() {
        return width;
    }

    public void setWidth(double width) {
        this.width = width;
    }

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public ImageRegionStatus getStatus() {
        return status;
    }

    public void setStatus(ImageRegionStatus status) {
        this.status = status;
    }

    public List<Tag> getTags() {
        return this.tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }
}
