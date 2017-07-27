package org.diamond.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:aquamarine.properties")
public class AquamarineConfiguration {
    @Value("${aquamarine.endpoint}")
    private String poolName;
}
