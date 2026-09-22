package com.reservas.backend.appointment.dto;

import com.reservas.backend.appointment.Appointment;

import java.math.BigDecimal;
import java.time.Instant;

/** Debe calzar con el tipo Appointment del frontend (frontend/src/types/appointment.ts). */
public record AppointmentResponse(
        String id,
        String serviceId,
        String serviceName,
        String providerId,
        String providerName,
        String clientId,
        String clientName,
        String clientEmail,
        String clientPhone,
        String date,
        String time,
        Integer durationMinutes,
        BigDecimal price,
        String status,
        String imageUrl,
        String notes,
        Instant createdAt
) {
    public static AppointmentResponse from(Appointment a) {
        return new AppointmentResponse(
                a.getId().toString(),
                a.getServiceId().toString(),
                a.getServiceName(),
                a.getProviderId().toString(),
                a.getProviderName(),
                a.getClientId().toString(),
                a.getClientName(),
                a.getClientEmail(),
                a.getClientPhone(),
                a.getDate(),
                a.getTime(),
                a.getDurationMinutes(),
                a.getPrice(),
                a.getStatus().name(),
                a.getImageUrl(),
                a.getNotes(),
                a.getCreatedAt()
        );
    }
}
