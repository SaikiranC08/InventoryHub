package com.saikiran.inventory.common.exception;

public class MissingRequiredIdentifierException extends RuntimeException {
    public MissingRequiredIdentifierException(String message) {
        super(message);
    }
}
