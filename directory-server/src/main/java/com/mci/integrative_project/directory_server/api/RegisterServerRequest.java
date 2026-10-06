package com.mci.integrative_project.directory_server.api;

public record RegisterServerRequest(String name, String host, Integer port, Integer maxPlayers) {
}
