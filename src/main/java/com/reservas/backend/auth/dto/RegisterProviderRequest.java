package com.reservas.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterProviderRequest(
        @NotBlank(message = "El nombre es obligatorio") @Size(min = 2, message = "El nombre es obligatorio") String name,
        @NotBlank @Email(message = "Correo electrónico inválido") String email,
        @NotBlank @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres") String password,
        @NotBlank(message = "El nombre del negocio es obligatorio") @Size(min = 2, message = "El nombre del negocio es obligatorio") String businessName,
        String phone,
        String businessCategory,
        String address,
        String city,
        String documentNumber
) {}
