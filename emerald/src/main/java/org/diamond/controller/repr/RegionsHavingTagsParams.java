package org.diamond.controller.repr;

public class RegionsHavingTagsParams {
    private String imageMetadata;
    private String[] tags;

    public String getImageMetadata() {
        return imageMetadata;
    }

    public void setImageMetadata(String imageMetadata) {
        this.imageMetadata = imageMetadata;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }
}
