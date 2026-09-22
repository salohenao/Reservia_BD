package com.reservas.backend.appointment.dto;

import jakarta.validation.constraints.NotBlank;

public record RescheduleRequest(
        @NotBlank(message = "La fecha es obligatoria") String date,
        @NotBlank(message = "La hora es obligatoria") String time
) {}
