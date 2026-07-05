package com.saikiran.inventory.common.exception;

import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleBusinessNotFound(
            BusinessNotFoundException ex) {

        ErrorResponse error =
                new ErrorResponse(
                        ex.getMessage(),
                        404,
                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>>  handleValidationException(
            MethodArgumentNotValidException ex
    ) {


        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
          .getFieldErrors()
          .forEach(error ->
                  errors.put(
                          error.getField(),
                          error.getDefaultMessage()
                  )
          );

        return ResponseEntity
                .badRequest()
                .body(errors);
    }
}