package com.reservas.backend.user;

/**
 * Se serializa en mayusculas (CLIENT / PROVIDER) para calzar exactamente con
 * el tipo UserRole del frontend (frontend/src/types/auth.ts).
 */
public enum UserRole {
    CLIENT,
    PROVIDER
}
