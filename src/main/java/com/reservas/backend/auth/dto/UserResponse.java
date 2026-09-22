package com.reservas.backend.auth.dto;

import com.reservas.backend.user.User;

import java.time.Instant;

/**
 * Debe calzar con el tipo User del frontend (frontend/src/types/auth.ts).
 */
public record UserResponse(
        String id,
        String name,
        String email,
        String role,
        String phone,
        String avatarUrl,
        String businessName,
        String businessCategory,
        String address,
        String city,
        String documentNumber,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId().toString(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getBusinessName(),
                user.getBusinessCategory(),
                user.getAddress(),
                user.getCity(),
                user.getDocumentNumber(),
                user.getCreatedAt()
        );
    }
}
