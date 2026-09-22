package com.reservas.backend.auth.dto;

/** Debe calzar con AuthResponse del frontend: { token, user }. */
public record AuthResponse(String token, UserResponse user) {}
