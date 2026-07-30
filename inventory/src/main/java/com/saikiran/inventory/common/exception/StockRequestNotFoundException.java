package com.saikiran.inventory.common.exception;

public class StockRequestNotFoundException extends RuntimeException {
    public StockRequestNotFoundException(String message) {
        super(message);
    }
}
