package com.condominio.monitoring_service.repository;

import com.condominio.monitoring_service.model.Violation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViolationRepository extends JpaRepository<Violation, Long> {
    List<Violation> findByStatus(String status);
    List<Violation> findTop10ByOrderByTimestampDesc();
    List<Violation> findAllByOrderByTimestampDesc();
    List<Violation> findByResidentUsernameOrderByTimestampDesc(String residentUsername);
}
