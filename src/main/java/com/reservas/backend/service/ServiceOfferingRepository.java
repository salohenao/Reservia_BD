package com.reservas.backend.service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering, UUID> {

    List<ServiceOffering> findByProvider_IdOrderByCreatedAtDesc(UUID providerId);

    @Query("""
            SELECT s FROM ServiceOffering s JOIN s.provider p
            WHERE s.active = true
              AND (:category IS NULL OR s.category = :category)
              AND (:search IS NULL
                   OR LOWER(s.name) LIKE :search
                   OR LOWER(s.description) LIKE :search
                   OR LOWER(p.name) LIKE :search
                   OR LOWER(p.businessName) LIKE :search)
            ORDER BY s.createdAt DESC
            """)
    List<ServiceOffering> findActiveFiltered(@Param("category") String category, @Param("search") String search);
}
