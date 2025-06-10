package postari.iot_backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AuthService authService;

    public DeviceService(AuthService authService) {
        this.authService = authService;
    }

    @Value("${thingsboard.api.url}")
    private String thingsboardApiUrl;

    private HttpHeaders createHeaders(String jwt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Authorization", "Bearer " + jwt);
        return headers;
    }

    public JsonNode getDevices(String jwt) {
        // Prvo dohvatimo korisnika
        JsonNode userNode = authService.getCurrentUser(jwt);
        System.out.println(userNode);
        if (jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);
        }
        // Dohvati rolu
        String authority = userNode.get("authority").asText();
        System.out.println("Uloga korisnika: " + authority);

        // Sad napravi poziv za dohvat uređaja
        String url;
        if ("CUSTOMER_USER".equals(authority)) {
            String customerId = userNode.get("customerId").get("id").asText();
            url = thingsboardApiUrl + "/customer/" + customerId + "/devices?page=0&pageSize=100";
        } else if ("TENANT_ADMIN".equals(authority)) {
            url = thingsboardApiUrl + "/tenant/devices?page=0&pageSize=100";
        } else {
            throw new RuntimeException("Nepodržana rola korisnika: " + authority);
        }

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(jwt));
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        return parseJson(response.getBody());
    }

    public JsonNode getLatestTelemetry(String jwt, String deviceId) {
        if (jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);
        }
        String url = thingsboardApiUrl + "/plugins/telemetry/DEVICE/" + deviceId + "/values/timeseries";
        System.out.println(url);
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(jwt));
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        System.out.println(response.getBody());
        return parseJson(response.getBody());
    }

    public JsonNode getTelemetryHistory(String jwt, String deviceId, long startTs, long endTs, long limit) {
        if (jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);
        }
        String url = thingsboardApiUrl + "/plugins/telemetry/DEVICE/" + deviceId +
                "/values/timeseries?keys=posta&startTs=" + startTs + "&endTs=" + endTs + "&limit=" + limit;
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(jwt));
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        return parseJson(response.getBody());
    }

    public JsonNode getDeviceNotifications(String jwt, String deviceId) {
        //String url = thingsboardApiUrl + "/alarm/DEVICE/" + deviceId + "?alarmType=RULE_NODE_ALARM&pageSize=10&page=1";
        //String url = thingsboardApiUrl + "/alarm?limit=20&sortProperty=startTs&sortOrder=DESC";
        String url = thingsboardApiUrl + "/notifications?pageSize=1000&page=0&sort=createdTime,desc&originatorEntityType=DEVICE&originatorId=" + deviceId;
        //System.out.println("jwt: " + jwt);
        if (jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);
        }
        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(jwt));
        //ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        System.out.println(response.getBody());

        JsonNode allNotifications = parseJson(response.getBody());
        ArrayNode dataArray = (ArrayNode) allNotifications.get("data");

        ObjectNode latestNotification = null;
        for (JsonNode notif : dataArray) {
            String originatorType = notif.path("info").path("msgOriginator").path("entityType").asText();
            String originatorId = notif.path("info").path("msgOriginator").path("id").asText();
            if ("DEVICE".equals(originatorType) && deviceId.equals(originatorId)) {
                if (latestNotification == null ||
                        notif.path("createdTime").asLong() > latestNotification.path("createdTime").asLong()) {
                    latestNotification = (ObjectNode) notif;
                }
            }
        }

        ObjectMapper mapper = new ObjectMapper();
        ObjectNode result = mapper.createObjectNode();
        ArrayNode resultData = mapper.createArrayNode();
        if (latestNotification != null) {
            resultData.add(latestNotification);
        }
        result.set("data", resultData);

        return result;
    }

    public void openDoor(String jwt, String deviceId) {
        String url = thingsboardApiUrl + "/plugins/telemetry/DEVICE/" + deviceId + "/SHARED_SCOPE";
        if (jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);
        }

        String payload = String.format("{\"otkljucaj\": %b}", true);
        HttpEntity<String> entity = new HttpEntity<>(payload, createHeaders(jwt));
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
    }

    private JsonNode parseJson(String jsonString) {
        try {
            return objectMapper.readTree(jsonString);
        } catch (Exception e) {
            throw new RuntimeException("Greška kod parsiranja JSON-a", e);
        }
    }


}
