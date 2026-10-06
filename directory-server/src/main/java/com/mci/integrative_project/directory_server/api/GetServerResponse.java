package com.mci.integrative_project.directory_server.api;

public record GetServerResponse(String serverId, String name, String host, int port, int currentPlayers, int maxPlayers,
                String status, int heartbeatIntervalSeconds) {
}
