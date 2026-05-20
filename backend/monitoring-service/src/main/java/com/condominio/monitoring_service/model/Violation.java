package com.condominio.monitoring_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "violations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Violation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // e.g. PET_RESTRICTED_AREA, UNAUTHORIZED_VEHICLE
    
    private String description;

    private String residentUsername;

    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    private String cameraId;

    private String imageEvidenceUrl;

    private String status; // PENDING, REVIEWED, RESOLVED

    private LocalDateTime timestamp;
}
