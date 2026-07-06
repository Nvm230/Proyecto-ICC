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
    private final com.condominio.monitoring_service.config.MqttGateway mqttGateway;

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void processMqttMessage(Message<String> message) {
        String payload = message.getPayload();
        String topic = (String) message.getHeaders().get("mqtt_receivedTopic");
        log.info("Received MQTT event on topic: {}. Payload: {}", topic, payload);

        try {
            JsonNode rootNode = objectMapper.readTree(payload);
            
            if (topic.equals("condominio/sensors/events")) {
                if ("TRIGGERED".equals(rootNode.get("status").asText())) {
                    Violation violation = Violation.builder()
                            .type("SENSOR_TRIGGERED")
                            .severity("HIGH")
                            .cameraId(rootNode.get("sensor_id").asText())
                            .status("PENDING")
                            .timestamp(LocalDateTime.now())
                            .residentUsername("residente1")
                            .build();

                    violation = violationRepository.save(violation);
                    messagingTemplate.convertAndSend("/topic/alerts", violation);
                    
                    log.info("Activando alarma remota en el ESP32 por 1 segundo");
                    mqttGateway.sendToMqtt("ON", "condominio/sensors/alarm");
                    
                    new Thread(() -> {
                        try {
                            Thread.sleep(1000);
                            mqttGateway.sendToMqtt("OFF", "condominio/sensors/alarm");
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                    }).start();
                }
            }

        } catch (Exception e) {
            log.error("Error processing MQTT message", e);
        }
    }
}
