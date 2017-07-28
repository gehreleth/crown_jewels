package org.diamond.configuration;

import org.diamond.aquamarine.IAquamarineService;
import org.diamond.aquamarine.impl.AquamarineServiceImpl;
import org.diamond.aquamarineclient.Aquamarine;
import org.diamond.aquamarineclient.impl.AquamarineImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:aquamarine.properties")
public class AquamarineConfiguration {
    @Value("${aquamarine.endpoint}")
    private String endpoint;

    @Bean
    Aquamarine aquamarine() {
        return new AquamarineImpl(endpoint);
    }
}
