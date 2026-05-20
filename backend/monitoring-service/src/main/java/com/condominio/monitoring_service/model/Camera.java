package com.condominio.monitoring_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cameras")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Camera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String cameraId; // e.g. CAM_01_MAIN_GATE

    private String location;

    private String status; // ONLINE, OFFLINE

    private String rtspUrl; // For future real integration
}
