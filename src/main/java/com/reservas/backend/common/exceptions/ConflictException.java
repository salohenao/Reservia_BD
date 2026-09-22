package com.reservas.backend.common.exceptions;

public class ConflictException extends RuntimeException {
    public ConflictException(String message) { super(message); }
}
