package com.condominio.monitoring_service.service;

import com.condominio.monitoring_service.model.Violation;
import com.condominio.monitoring_service.repository.ViolationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventProcessorService {

    private final ViolationRepository violationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void processMqttMessage(Message<String> message) {
        String payload = message.getPayload();
        String topic = (String) message.getHeaders().get("mqtt_receivedTopic");
        log.info("Received MQTT event on topic: {}. Payload: {}", topic, payload);

        try {
            JsonNode rootNode = objectMapper.readTree(payload);
            
            // Only save if it's a simulated vision event for now
            if (topic.equals("condominio/vision/events")) {
                Violation violation = Violation.builder()
                        .type(rootNode.get("type").asText())
                        .severity(rootNode.get("severity").asText())
                        .cameraId(rootNode.get("camera_id").asText())
                        .status("PENDING")
                        .timestamp(LocalDateTime.now())
                        .build();

                violation = violationRepository.save(violation);
                log.info("Saved new violation to DB: {}", violation.getId());

                // Broadcast via WebSocket
                messagingTemplate.convertAndSend("/topic/alerts", violation);
            } else if (topic.equals("condominio/sensors/events")) {
                // We can also create violations or just alerts for sensors
                if ("TRIGGERED".equals(rootNode.get("status").asText())) {
                    Violation violation = Violation.builder()
                            .type("SENSOR_TRIGGERED")
                            .severity("HIGH")
                            .cameraId(rootNode.get("sensor_id").asText()) // Using sensor_id in cameraId for simplicity
                            .status("PENDING")
                            .timestamp(LocalDateTime.now())
                            .build();

                    violation = violationRepository.save(violation);
                    messagingTemplate.convertAndSend("/topic/alerts", violation);
                }
            }

        } catch (Exception e) {
            log.error("Error processing MQTT message", e);
        }
    }
}
