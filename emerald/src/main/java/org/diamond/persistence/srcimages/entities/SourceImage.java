package org.diamond.persistence.srcimages.entities;

import javax.persistence.*;
import java.util.UUID;

@SuppressWarnings("serial")
@Entity
@Table(name = "SOURCE_IMAGE")
public class SourceImage implements java.io.Serializable  {
    @Id
    @Column(name = "SRC_IMG_NO")
    @GeneratedValue
    private Long id;

    @ManyToOne(cascade = CascadeType.ALL)
    private SourceImageCollection sourceImageCollection;

    @Column(name = "ORIGINAL_NAME")
    private String originalName;

    @Column(name = "AQUAMARINE_ID")
    private UUID aquamarineId;

    public SourceImage(SourceImageCollection sourceImageCollection, String originalName, UUID aquamarineId) {
        this.sourceImageCollection = sourceImageCollection;
        this.originalName = originalName;
        this.aquamarineId = aquamarineId;
    }

    public Long getId() {
        return id;
    }

    public SourceImageCollection getSourceImageCollection() {
        return sourceImageCollection;
    }

    public String getOriginalName() {
        return originalName;
    }

    public UUID getAquamarineId() {
        return aquamarineId;
    }
}
