package com.saikiran.inventory.common.exception;

public class InvalidBusinessOperationException extends RuntimeException {
    public InvalidBusinessOperationException(String message) {
        super(message);
    }
}
