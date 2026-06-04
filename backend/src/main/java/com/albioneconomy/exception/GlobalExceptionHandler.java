package com.albioneconomy.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Instant;
import java.util.Map;

/**
 * Manejo centralizado de errores — devuelve JSON limpio en vez de stacktraces de Spring.
 * Aplica a los dos endpoints activos: GET /recipe y GET /prices
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Parámetro obligatorio ausente.
     * Ej: GET /recipe sin ?id= → 400 Bad Request
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParam(
            MissingServletRequestParameterException ex) {
        return error(HttpStatus.BAD_REQUEST,
                "Missing required parameter: " + ex.getParameterName());
    }

    /**
     * Error de la API externa de Albion (gameinfo o albion-online-data).
     * Ej: gameinfo devuelve 404 para un ítem que no existe.
     */
    @ExceptionHandler(WebClientResponseException.class)
    public ResponseEntity<Map<String, Object>> handleWebClientError(
            WebClientResponseException ex) {
        return error(HttpStatus.BAD_GATEWAY,
                "External API error: " + ex.getStatusCode() + " " + ex.getMessage());
    }

    /**
     * Cualquier otro error inesperado → 500 Internal Server Error
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected error: " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of(
                "status",    status.value(),
                "error",     status.getReasonPhrase(),
                "message",   message,
                "timestamp", Instant.now().toString()
        ));
    }
}