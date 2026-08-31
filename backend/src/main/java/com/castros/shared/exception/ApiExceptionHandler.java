package com.castros.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ApiException.class)
    ResponseEntity<ProblemDetailResponse> api(ApiException ex) { return response(ex.getStatus(), ex.getCode(), ex.getMessage(), Map.of()); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ProblemDetailResponse> validation(MethodArgumentNotValidException ex) {
        Map<String,Object> details = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e -> details.put(e.getField(), e.getDefaultMessage()));
        return response(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Request validation failed.", details);
    }
    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ProblemDetailResponse> constraint(ConstraintViolationException ex) { return response(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Request validation failed.", Map.of()); }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ProblemDetailResponse> integrity(DataIntegrityViolationException ex) { return response(HttpStatus.CONFLICT, "DUPLICATE_RESOURCE", "The requested resource conflicts with existing data.", Map.of()); }
    @ExceptionHandler(Exception.class)
    ResponseEntity<ProblemDetailResponse> other(Exception ex) { return response(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "An unexpected error occurred.", Map.of()); }
    private ResponseEntity<ProblemDetailResponse> response(HttpStatus status, String code, String message, Map<String,Object> details) {
        return ResponseEntity.status(status).body(new ProblemDetailResponse(code, message, status.value(), OffsetDateTime.now(), details));
    }
}
