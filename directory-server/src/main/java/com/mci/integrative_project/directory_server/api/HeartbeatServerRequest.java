package com.mci.integrative_project.directory_server.api;

import com.mci.integrative_project.directory_server.model.EServerStatus;

public record HeartbeatServerRequest(EServerStatus status, int currentPlayers, int maxPlayers) {
}
