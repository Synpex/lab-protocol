package com.mci.integrative_project.directory_server.security;

import static org.junit.jupiter.api.Assertions.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "directory.api-keys=team-a:test-only-team-a-key-00000000000000000000,team-b:test-only-team-b-key-00000000000000000000" })
class DirectoryApiKeyHttpTests {
    private static final String KEY_A = "test-only-team-a-key-00000000000000000000";
    private static final String KEY_B = "test-only-team-b-key-00000000000000000000";
    private static final String REGISTER = "{\"name\":\"Arena\",\"host\":\"localhost\",\"port\":9000,\"maxPlayers\":4}";
    private static final String HEARTBEAT = "{\"status\":\"RUNNING\",\"currentPlayers\":2,\"maxPlayers\":4}";
    private final HttpClient client = HttpClient.newHttpClient();

    @Value("${local.server.port}")
    private int port;

    @Test
    void discoveryRemainsPublicAndDoesNotExposeCredentialsOrOwnership() throws Exception {
        register(KEY_A);
        HttpResponse<String> response = call("GET", "/api/servers", null, null);
        assertEquals(200, response.statusCode());
        assertFalse(response.body().contains(KEY_A));
        assertFalse(response.body().contains("ownerTeam"));
        assertEquals(200, call("GET", "/api/servers?status=LOBBY", "invalid", null).statusCode());
    }

    @Test
    void rejectsMissingAndInvalidKeysForEveryWriteBeforeReadingTheBody() throws Exception {
        for (String key : new String[] { null, "invalid" }) {
            assertUnauthorized(call("POST", "/api/servers", key, "not JSON"));
            assertUnauthorized(call("PUT", "/api/servers/srv-missing/heartbeat", key, HEARTBEAT));
            assertUnauthorized(call("DELETE", "/api/servers/srv-missing", key, null));
        }
    }

    @Test
    void rejectsDuplicateApiKeyHeaders() throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri("/api/servers"))
                .header("Content-Type", "application/json")
                .header("X-API-Key", KEY_A).header("X-API-Key", KEY_B)
                .POST(HttpRequest.BodyPublishers.ofString(REGISTER)).build();
        assertUnauthorized(client.send(request, HttpResponse.BodyHandlers.ofString()));
    }

    @Test
    void ownerCanRegisterHeartbeatAndUnregister() throws Exception {
        String id = register(KEY_A);
        HttpResponse<String> heartbeat = call("PUT", "/api/servers/" + id + "/heartbeat", KEY_A, HEARTBEAT);
        assertEquals(200, heartbeat.statusCode());
        assertEquals("{\"acknowledged\":true}", heartbeat.body());
        HttpResponse<String> deleted = call("DELETE", "/api/servers/" + id, KEY_A, null);
        assertEquals(204, deleted.statusCode());
        assertEquals("", deleted.body());
        assertEquals(404, call("DELETE", "/api/servers/" + id, KEY_A, null).statusCode());
    }

    @Test
    void anotherTeamCannotUpdateOrDeleteAndOwnerRetainsAccess() throws Exception {
        String id = register(KEY_A);
        for (String method : new String[] { "PUT", "DELETE" }) {
            String path = "/api/servers/" + id + (method.equals("PUT") ? "/heartbeat" : "");
            HttpResponse<String> denied = call(method, path, KEY_B, method.equals("PUT") ? HEARTBEAT : null);
            assertEquals(403, denied.statusCode());
            assertEquals("{\"error\":\"SERVER_ACCESS_DENIED\"}", denied.body());
        }
        HttpResponse<String> unknownServers = call("GET", "/api/servers?status=UNKNOWN", null, null);
        assertTrue(unknownServers.body().contains(id), "Foreign heartbeat must not mutate the status");
        assertEquals(200, call("PUT", "/api/servers/" + id + "/heartbeat", KEY_A, HEARTBEAT).statusCode());
        assertEquals(204, call("DELETE", "/api/servers/" + id, KEY_A, null).statusCode());
        String idB = register(KEY_B);
        assertEquals(200, call("PUT", "/api/servers/" + idB + "/heartbeat", KEY_B, HEARTBEAT).statusCode());
        assertEquals(403, call("DELETE", "/api/servers/" + idB, KEY_A, null).statusCode());
    }

    @Test
    void validKeyPreservesValidationAndNotFoundErrors() throws Exception {
        assertEquals(400, call("POST", "/api/servers", KEY_A, "{}").statusCode());
        assertEquals(400, call("POST", "/api/servers", KEY_A, "not JSON").statusCode());
        String path = "/api/servers/srv-" + UUID.randomUUID();
        assertEquals(404, call("PUT", path + "/heartbeat", KEY_A, HEARTBEAT).statusCode());
        assertEquals(404, call("DELETE", path, KEY_A, null).statusCode());
    }

    private void assertUnauthorized(HttpResponse<String> response) {
        assertEquals(401, response.statusCode());
        assertEquals("{\"error\":\"INVALID_API_KEY\"}", response.body());
        assertEquals("ApiKey realm=\"directory-server\"", response.headers().firstValue("WWW-Authenticate").orElseThrow());
    }

    private String register(String key) throws Exception {
        HttpResponse<String> response = call("POST", "/api/servers", key, REGISTER);
        assertEquals(201, response.statusCode(), response.body());
        var matcher = Pattern.compile("\"serverId\"\\s*:\\s*\"([^\"]+)\"").matcher(response.body());
        assertTrue(matcher.find(), response.body());
        return matcher.group(1);
    }

    private URI uri(String path) {
        return URI.create("http://localhost:" + port + path);
    }

    private HttpResponse<String> call(String method, String path, String key, String body) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(uri(path)).header("Content-Type", "application/json");
        if (key != null) request.header("X-API-Key", key);
        request.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body));
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }
}
