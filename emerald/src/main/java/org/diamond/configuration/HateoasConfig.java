package org.diamond.configuration;

import org.diamond.controller.ImgRegionEditorSave;
import org.diamond.persistence.srcimages.entities.ImageMetadata;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceProcessor;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.*;


@Configuration
public class HateoasConfig {
    @Bean
    public ResourceProcessor<Resource<ImageMetadata>> personProcessor() {
        return new ResourceProcessor<Resource<ImageMetadata>>() {
            @Override
            public Resource<ImageMetadata> process(Resource<ImageMetadata> resource) {
                resource.add(linkTo(methodOn(ImgRegionEditorSave.class).save(resource.getContent().getId(), null)).withRel("put-regions"));
                return resource;
            }
        };
    }
}
