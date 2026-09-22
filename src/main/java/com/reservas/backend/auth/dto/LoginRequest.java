package com.reservas.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Correo electrónico inválido") @Email(message = "Correo electrónico inválido") String email,
        @NotBlank(message = "La contraseña es obligatoria") String password
) {}
