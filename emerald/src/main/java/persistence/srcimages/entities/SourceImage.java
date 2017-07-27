package persistence.srcimages.entities;

import javax.persistence.*;
import java.sql.Blob;
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

    @Column(name = "AQUAMARINE_ID")
    private UUID aquamarineId;

    public SourceImage(SourceImageCollection sourceImageCollection, UUID aquamarineId) {
        this.sourceImageCollection = sourceImageCollection;
        this.aquamarineId = aquamarineId;
    }

    public Long getId() {
        return id;
    }

    public SourceImageCollection getSourceImageCollection() {
        return sourceImageCollection;
    }

    public UUID getAquamarineId() {
        return aquamarineId;
    }
}
