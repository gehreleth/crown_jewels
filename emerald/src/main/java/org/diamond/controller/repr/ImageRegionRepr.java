package org.diamond.controller.repr;

import org.diamond.persistence.srcimages.entities.ImageRegionStatus;
import org.springframework.hateoas.ResourceSupport;

public class ImageRegionRepr extends ResourceSupport {
    private String text;

    private double x;

    private double y;

    private double width;

    private double height;

    private ImageRegionStatus status = ImageRegionStatus.Default;

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
}
