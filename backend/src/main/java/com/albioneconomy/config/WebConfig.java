package com.albioneconomy.config;

// Este archivo estaba usando clases de Spring WebFlux (reactive) mezcladas con
// Spring MVC, lo que causaba conflictos y errores 403. La configuración CORS
// está ahora centralizada únicamente en CorsConfig.java.
// Se mantiene el archivo vacío para no romper referencias existentes.

import org.springframework.context.annotation.Configuration;

@Configuration
public class WebConfig {
    // Vacío intencionalmente. Ver CorsConfig.java.
}