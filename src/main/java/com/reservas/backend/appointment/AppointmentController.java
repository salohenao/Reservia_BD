package com.reservas.backend.appointment;

import com.reservas.backend.appointment.dto.AppointmentResponse;
import com.reservas.backend.appointment.dto.CreateAppointmentRequest;
import com.reservas.backend.appointment.dto.RescheduleRequest;
import com.reservas.backend.common.exceptions.NotFoundException;
import com.reservas.backend.security.AuthUtils;
import com.reservas.backend.service.ServiceOffering;
import com.reservas.backend.service.ServiceOfferingRepository;
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
 * Rutas usadas por frontend/src/services/appointmentService.ts. Todas requieren
 * Authorization: Bearer <token> (ver SecurityConfig, que exige auth en /appointments/**).
 */
@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final ServiceOfferingRepository serviceRepository;
    private final UserRepository userRepository;

    public AppointmentController(
            AppointmentRepository appointmentRepository,
            ServiceOfferingRepository serviceRepository,
            UserRepository userRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/client/{clientId}")
    public List<AppointmentResponse> byClient(@PathVariable UUID clientId, Authentication auth) {
        AuthUtils.requireSelf(auth, clientId, "No puedes ver las citas de otro usuario");
        return appointmentRepository.findByClientIdOrderByCreatedAtDesc(clientId)
                .stream().map(AppointmentResponse::from).toList();
    }

    @GetMapping("/provider/{providerId}")
    public List<AppointmentResponse> byProvider(@PathVariable UUID providerId, Authentication auth) {
        AuthUtils.requireSelf(auth, providerId, "No puedes ver las citas de otro proveedor");
        return appointmentRepository.findByProviderIdOrderByCreatedAtDesc(providerId)
                .stream().map(AppointmentResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> create(@Valid @RequestBody CreateAppointmentRequest req, Authentication auth) {
        UUID clientId = AuthUtils.currentUserId(auth);

        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        ServiceOffering service = serviceRepository.findById(req.serviceId())
                .orElseThrow(() -> new NotFoundException("Servicio no encontrado"));
        User provider = service.getProvider();

        Appointment appointment = new Appointment();
        appointment.setServiceId(service.getId());
        appointment.setServiceName(service.getName());
        appointment.setProviderId(provider.getId());
        appointment.setProviderName(
                provider.getBusinessName() != null && !provider.getBusinessName().isBlank()
                        ? provider.getBusinessName()
                        : provider.getName()
        );
        appointment.setClientId(client.getId());
        appointment.setClientName(client.getName());
        appointment.setClientEmail(client.getEmail());
        appointment.setClientPhone(client.getPhone());
        appointment.setDate(req.date());
        appointment.setTime(req.time());
        appointment.setDurationMinutes(service.getDurationMinutes());
        appointment.setPrice(service.getPrice());
        appointment.setImageUrl(service.getImageUrl());
        appointment.setNotes(req.notes());
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        appointmentRepository.save(appointment);

        return ResponseEntity.status(HttpStatus.CREATED).body(AppointmentResponse.from(appointment));
    }

    @PutMapping("/{id}")
    public AppointmentResponse reschedule(@PathVariable UUID id, @Valid @RequestBody RescheduleRequest req, Authentication auth) {
        Appointment appointment = findAndAuthorize(id, auth);
        appointment.setDate(req.date());
        appointment.setTime(req.time());
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(appointment);
        return AppointmentResponse.from(appointment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable UUID id, Authentication auth) {
        Appointment appointment = findAndAuthorize(id, auth);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
        return ResponseEntity.noContent().build();
    }

    private Appointment findAndAuthorize(UUID id, Authentication auth) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cita no encontrada"));

        UUID currentUserId = AuthUtils.currentUserId(auth);
        boolean isParty = currentUserId.equals(appointment.getClientId())
                || currentUserId.equals(appointment.getProviderId());

        if (!isParty) {
            throw new com.reservas.backend.common.exceptions.ForbiddenException(
                    "No tienes permiso sobre esta cita");
        }
        return appointment;
    }
}
