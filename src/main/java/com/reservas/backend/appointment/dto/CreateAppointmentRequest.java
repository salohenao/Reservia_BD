package com.reservas.backend.appointment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateAppointmentRequest(
        @NotNull(message = "El servicio es obligatorio") UUID serviceId,
        @NotBlank(message = "La fecha es obligatoria") String date,
        @NotBlank(message = "La hora es obligatoria") String time,
        String notes
) {}
