package postari.iot_backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AuthService {
    private final String thingsboardApiUrl;

    public AuthService(@Value("${thingsboard.api.url}") String thingsboardApiUrl) {
        this.thingsboardApiUrl = thingsboardApiUrl;
    }

    private final ObjectMapper objectMapper = new ObjectMapper();
    RestTemplate restTemplate = new RestTemplate();

    public String login(String username, String password) {
        String url = thingsboardApiUrl + "/auth/login";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "username", username,
                    "password", password
            ));

            HttpEntity<String> request = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode responseBody = objectMapper.readTree(response.getBody());
                if (responseBody.has("token")) {
                    return responseBody.get("token").asText();
                } else {
                    throw new RuntimeException("Token nije pronađen u odgovoru.");
                }
            } else {
                throw new RuntimeException("Prijava nije uspjela. Status: " + response.getStatusCode());
            }
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Neuspješna prijava: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new RuntimeException("Greška tijekom prijave: " + e.getMessage(), e);
        }
    }

    public void logout(String jwt) {
        String url = thingsboardApiUrl + "/auth/logout";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(jwt);

        HttpEntity<String> request = new HttpEntity<>(null, headers);
        ResponseEntity<Void> response = restTemplate.exchange(url, HttpMethod.POST, request, Void.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Greška prilikom odjave.");
        }
    }

    public JsonNode getCurrentUser(String jwt) {
        String url = thingsboardApiUrl + "/auth/user";

        if (jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(jwt);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
        return parseJson(response.getBody());
    }

    private JsonNode parseJson(String jsonString) {
        try {
            return objectMapper.readTree(jsonString);
        } catch (Exception e) {
            throw new RuntimeException("Greška kod parsiranja JSON-a", e);
        }
    }
}
