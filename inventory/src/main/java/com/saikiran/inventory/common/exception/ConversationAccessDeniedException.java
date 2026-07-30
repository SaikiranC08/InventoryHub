package com.saikiran.inventory.common.exception;

public class ConversationAccessDeniedException extends RuntimeException {
    public ConversationAccessDeniedException(String message) {
        super(message);
    }
}
