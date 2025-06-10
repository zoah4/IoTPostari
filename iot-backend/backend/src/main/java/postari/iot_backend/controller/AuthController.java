package postari.iot_backend.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import postari.iot_backend.dto.LoginRequest;
import postari.iot_backend.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String jwt = authService.login(request.getUsername(), request.getPassword());
            return ResponseEntity.ok(Map.of("token", jwt));
        } catch (RuntimeException e) {
            String message = e.getMessage() != null ? e.getMessage() : "Greška pri autentikaciji.";
            // Ako želiš detaljnije, možeš analizirati poruku da vidiš je li 401 (Unauthorized) ili 500 (Internal Server Error)
            if (message.toLowerCase().contains("neuspješna prijava") || message.toLowerCase().contains("unauthorized")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", message));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", message));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            String jwt = authorizationHeader.replace("Bearer ", "");
            authService.logout(jwt);
            return ResponseEntity.ok(Map.of("message", "Odjava uspješna."));
        } catch (RuntimeException e) {
            String message = e.getMessage() != null ? e.getMessage() : "Greška pri odjavi.";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", message));
        }
    }

    @GetMapping("/userinfo")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            String jwt = authorizationHeader.replace("Bearer ", "");
            JsonNode userInfo = authService.getCurrentUser(jwt);
            return ResponseEntity.ok(userInfo);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Greška pri dohvaćanju korisnika: " + e.getMessage()));
        }
    }
}
