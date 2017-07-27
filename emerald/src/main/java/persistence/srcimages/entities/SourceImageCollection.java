package persistence.srcimages.entities;

import javax.persistence.*;
import java.time.Instant;
import java.util.Set;

import static javax.persistence.CascadeType.ALL;

@SuppressWarnings("serial")
@Entity
@Table(name = "SOURCE_IMAGE_COLLECTION")
public class SourceImageCollection implements java.io.Serializable  {
    @Id
    @GeneratedValue
    @Column(name = "SIC_NO")
    private Long id;

    @Column(name = "FILE_NAME")
    private String fileName;

    @Column(name = "UPLOAD_TS")
    private Instant uploadTs;

    @OneToMany(cascade=ALL, mappedBy="sourceImageCollection")
    private Set<SourceImage> sourceImages;

    public SourceImageCollection(String fileName) {
        this.fileName = fileName;
        this.uploadTs = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Instant getUploadTs() {
        return uploadTs;
    }
}
