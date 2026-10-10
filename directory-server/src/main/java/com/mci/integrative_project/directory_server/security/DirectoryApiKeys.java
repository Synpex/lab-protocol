package com.mci.integrative_project.directory_server.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DirectoryApiKeys {
    private final Map<String, byte[]> keyHashes;

    public DirectoryApiKeys(@Value("${directory.api-keys:}") String configuration) {
        Map<String, byte[]> hashes = new LinkedHashMap<>();
        Set<String> uniqueHashes = new HashSet<>();
        if (configuration.isBlank()) {
            throw new IllegalArgumentException("Configure DIRECTORY_API_KEYS with team:key pairs before starting the directory server.");
        }
        for (String entry : configuration.split(",", -1)) {
            String[] parts = entry.strip().split(":", 2);
            if (parts.length != 2 || !parts[0].matches("[A-Za-z0-9_-]+")
                    || parts[1].length() < 32 || parts[1].chars().anyMatch(Character::isWhitespace)) {
                throw new IllegalArgumentException("DIRECTORY_API_KEYS requires team:key pairs with keys of at least 32 characters and no whitespace.");
            }
            byte[] digest = hash(parts[1]);
            if (hashes.putIfAbsent(parts[0], digest) != null
                    || !uniqueHashes.add(HexFormat.of().formatHex(digest))) {
                throw new IllegalArgumentException("DIRECTORY_API_KEYS requires unique team names and distinct keys.");
            }
        }
        keyHashes = Map.copyOf(hashes);
    }

    public String authenticate(String apiKey) {
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }
        byte[] provided = hash(apiKey);
        String team = null;
        for (Map.Entry<String, byte[]> entry : keyHashes.entrySet()) {
            if (MessageDigest.isEqual(entry.getValue(), provided)) {
                team = entry.getKey();
            }
        }
        return team;
    }

    private static byte[] hash(String value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
