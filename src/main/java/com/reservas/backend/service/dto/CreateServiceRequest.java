package com.reservas.backend.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;

public record CreateServiceRequest(
        @NotBlank(message = "El nombre del servicio es obligatorio") String name,
        String description,
        @NotBlank(message = "Debes seleccionar una categoría") String category,
        @NotNull @Positive(message = "La duración debe ser mayor a 0") Integer durationMinutes,
        @NotNull @PositiveOrZero(message = "El costo no puede ser negativo") BigDecimal price,
        String imageUrl,
        List<String> tags,
        String nextAvailableTime
) {}
