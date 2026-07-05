package com.saikiran.inventory.common.exception;

public class BusinessNotFoundException extends RuntimeException {

    public BusinessNotFoundException(String message) {
        super(message);
    }
}