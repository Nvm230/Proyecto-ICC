package com.condominio.monitoring_service.controller;

import com.condominio.monitoring_service.model.Violation;
import com.condominio.monitoring_service.repository.ViolationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;

import java.util.List;

@RestController
@RequestMapping("/api/monitor")
@RequiredArgsConstructor
public class ViolationController {

    private final ViolationRepository violationRepository;

    @GetMapping("/violations")
    public ResponseEntity<List<Violation>> getRecentViolations() {
        return ResponseEntity.ok(violationRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping("/violations/user/{username}")
    public ResponseEntity<List<Violation>> getUserViolations(@PathVariable String username) {
        return ResponseEntity.ok(violationRepository.findByResidentUsernameOrderByTimestampDesc(username));
    }

    @PostMapping("/violations")
    public ResponseEntity<Violation> createViolation(@RequestBody Violation violation) {
        violation.setTimestamp(LocalDateTime.now());
        if (violation.getStatus() == null) {
            violation.setStatus("PENDING");
        }
        return ResponseEntity.ok(violationRepository.save(violation));
    }

    @PatchMapping("/violations/{id}/resolve")
    public ResponseEntity<Violation> resolveViolation(@PathVariable Long id) {
        return violationRepository.findById(id)
                .map(v -> {
                    v.setStatus("RESOLVED");
                    return ResponseEntity.ok(violationRepository.save(v));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/violations/{id}/false-positive")
    public ResponseEntity<Violation> falsePositiveViolation(@PathVariable Long id) {
        return violationRepository.findById(id)
                .map(v -> {
                    v.setStatus("FALSE_POSITIVE");
                    return ResponseEntity.ok(violationRepository.save(v));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/violations/{id}/fine")
    public ResponseEntity<Violation> fineViolation(@PathVariable Long id, @RequestBody Violation requestBody) {
        return violationRepository.findById(id)
                .map(v -> {
                    v.setResidentUsername(requestBody.getResidentUsername());
                    if (requestBody.getDescription() != null && !requestBody.getDescription().isEmpty()) {
                        v.setDescription(requestBody.getDescription());
                    }
                    v.setStatus("FINED");
                    return ResponseEntity.ok(violationRepository.save(v));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
