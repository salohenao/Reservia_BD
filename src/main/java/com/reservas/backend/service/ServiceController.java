package com.reservas.backend.service;

import com.reservas.backend.common.exceptions.NotFoundException;
import com.reservas.backend.service.dto.CreateServiceRequest;
import com.reservas.backend.service.dto.ServiceResponse;
import com.reservas.backend.security.AuthUtils;
import com.reservas.backend.user.User;
import com.reservas.backend.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Rutas usadas por frontend/src/services/serviceService.ts:
 *   GET  /services?category=&search=      (publico)
 *   GET  /services/provider/{providerId}  (publico; el dashboard del proveedor lo consume)
 *   POST /services                         (requiere token de un PROVIDER)
 */
@RestController
@RequestMapping("/services")
public class ServiceController {

    private final ServiceOfferingRepository serviceRepository;
    private final UserRepository userRepository;

    public ServiceController(ServiceOfferingRepository serviceRepository, UserRepository userRepository) {
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<ServiceResponse> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        String normalizedCategory = (category == null || category.isBlank() || category.equalsIgnoreCase("ALL") || category.equalsIgnoreCase("TODAS"))
                ? null
                : category;
        String normalizedSearch = (search == null || search.isBlank())
                ? null
                : "%" + search.trim().toLowerCase() + "%";

        return serviceRepository.findActiveFiltered(normalizedCategory, normalizedSearch)
                .stream().map(ServiceResponse::from).toList();
    }

    @GetMapping("/provider/{providerId}")
    public List<ServiceResponse> byProvider(@PathVariable UUID providerId) {
        return serviceRepository.findByProvider_IdOrderByCreatedAtDesc(providerId)
                .stream().map(ServiceResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<ServiceResponse> create(@Valid @RequestBody CreateServiceRequest req, Authentication auth) {
        AuthUtils.requireRole(auth, "PROVIDER", "Solo un proveedor puede registrar servicios");
        UUID providerId = AuthUtils.currentUserId(auth);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new NotFoundException("Proveedor no encontrado"));

        ServiceOffering service = new ServiceOffering();
        service.setName(req.name().trim());
        service.setDescription(req.description() != null && !req.description().isBlank()
                ? req.description().trim()
                : "Servicio profesional certificado.");
        service.setCategory(req.category());
        service.setDurationMinutes(req.durationMinutes());
        service.setPrice(req.price());
        service.setImageUrl(req.imageUrl());
        service.setTags(req.tags() != null ? req.tags() : List.of());
        service.setNextAvailableTime(req.nextAvailableTime());
        service.setProvider(provider);
        service.setActive(true);

        serviceRepository.save(service);

        return ResponseEntity.status(HttpStatus.CREATED).body(ServiceResponse.from(service));
    }
}
