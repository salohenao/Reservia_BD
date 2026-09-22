package com.reservas.backend.service.dto;

import com.reservas.backend.service.ServiceOffering;
import com.reservas.backend.user.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Debe calzar con el tipo Service del frontend (frontend/src/types/service.ts). */
public record ServiceResponse(
        String id,
        String name,
        String description,
        Integer durationMinutes,
        BigDecimal price,
        String category,
        String providerId,
        String providerName,
        String providerLocation,
        String imageUrl,
        Double rating,
        Integer reviewsCount,
        List<String> tags,
        String nextAvailableTime,
        boolean isActive,
        Instant createdAt
) {
    public static ServiceResponse from(ServiceOffering s) {
        User provider = s.getProvider();
        String providerName = (provider.getBusinessName() != null && !provider.getBusinessName().isBlank())
                ? provider.getBusinessName()
                : provider.getName();

        return new ServiceResponse(
                s.getId().toString(),
                s.getName(),
                s.getDescription(),
                s.getDurationMinutes(),
                s.getPrice(),
                s.getCategory(),
                provider.getId().toString(),
                providerName,
                provider.getCity(),
                s.getImageUrl(),
                s.getRating(),
                s.getReviewsCount(),
                s.getTags(),
                s.getNextAvailableTime(),
                s.isActive(),
                s.getCreatedAt()
        );
    }
}
