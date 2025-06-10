package postari.iot_backend.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import postari.iot_backend.service.DeviceService;
import com.fasterxml.jackson.databind.JsonNode;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    // 1️⃣ Dohvati sve uređaje za korisnika
    @GetMapping
    public ResponseEntity<JsonNode> getAllDevices(@RequestHeader("Authorization") String jwt) throws JsonProcessingException {
        JsonNode devices = deviceService.getDevices(jwt);
        System.out.println(devices);
        return ResponseEntity.ok(devices);
    }

    // 2️⃣ Dohvati latest telemetry za uređaj
    @GetMapping("/{deviceId}/telemetry/latest")
    public ResponseEntity<JsonNode> getLatestTelemetry(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String deviceId) {
        System.out.println("tu sam");
        JsonNode telemetry = deviceService.getLatestTelemetry(jwt, deviceId);
        return ResponseEntity.ok(telemetry);
    }

    // 3️⃣ Dohvati povijest/statistiku za uređaj
    @GetMapping("/{deviceId}/telemetry/history")
    public ResponseEntity<JsonNode> getTelemetryHistory(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String deviceId,
            @RequestParam long startTs,
            @RequestParam long endTs,
            @RequestParam long limit) {
        JsonNode history = deviceService.getTelemetryHistory(jwt, deviceId, startTs, endTs, limit);
        return ResponseEntity.ok(history);
    }

    // 4️⃣ Dohvati obavijesti (alarms) za uređaj
    @GetMapping("/{deviceId}/notifications")
    public ResponseEntity<JsonNode> getDeviceNotifications(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String deviceId) {
        JsonNode alarms = deviceService.getDeviceNotifications(jwt, deviceId);
        return ResponseEntity.ok(alarms);
    }

    @PostMapping("/{deviceId}/opendoor")
    public ResponseEntity<String> openDoor(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String deviceId) {
        deviceService.openDoor(jwt, deviceId);
        return ResponseEntity.ok("Vrata su otključana");
    }
}
