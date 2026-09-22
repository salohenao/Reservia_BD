package com.reservas.backend.auth;

import com.reservas.backend.auth.dto.*;
import com.reservas.backend.common.exceptions.ConflictException;
import com.reservas.backend.common.exceptions.UnauthorizedException;
import com.reservas.backend.security.JwtService;
import com.reservas.backend.user.User;
import com.reservas.backend.user.UserRepository;
import com.reservas.backend.user.UserRole;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Rutas usadas por frontend/src/services/authService.ts:
 *   POST /auth/login
 *   POST /auth/register/client
 *   POST /auth/register/provider
 * (con context-path /api, quedan expuestas en /api/auth/...)
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        User user = userRepository.findByEmail(req.email().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Correo o contraseña incorrectos"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Correo o contraseña incorrectos");
        }

        return ResponseEntity.ok(buildAuthResponse(user));
    }

    @PostMapping("/register/client")
    public ResponseEntity<AuthResponse> registerClient(@Valid @RequestBody RegisterClientRequest req) {
        assertEmailAvailable(req.email());

        User user = new User();
        user.setName(req.name().trim());
        user.setEmail(req.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setRole(UserRole.CLIENT);
        user.setPhone(blankToNull(req.phone()));
        user.setCity(req.city() != null && !req.city().isBlank() ? req.city().trim() : "Medellín");
        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(buildAuthResponse(user));
    }

    @PostMapping("/register/provider")
    public ResponseEntity<AuthResponse> registerProvider(@Valid @RequestBody RegisterProviderRequest req) {
        assertEmailAvailable(req.email());

        User user = new User();
        user.setName(req.name().trim());
        user.setEmail(req.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setRole(UserRole.PROVIDER);
        user.setBusinessName(req.businessName().trim());
        user.setPhone(blankToNull(req.phone()));
        user.setBusinessCategory(req.businessCategory() != null && !req.businessCategory().isBlank() ? req.businessCategory().trim() : "SALUD");
        user.setAddress(blankToNull(req.address()));
        user.setCity(req.city() != null && !req.city().isBlank() ? req.city().trim() : "Medellín");
        user.setDocumentNumber(blankToNull(req.documentNumber()));
        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(buildAuthResponse(user));
    }

    private void assertEmailAvailable(String email) {
        if (userRepository.existsByEmail(email.trim().toLowerCase())) {
            throw new ConflictException("Ya existe una cuenta registrada con este correo electrónico.");
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getRole());
        return new AuthResponse(token, UserResponse.from(user));
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
