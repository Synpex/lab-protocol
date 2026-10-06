package com.mci.integrative_project.directory_server.api;

import com.mci.integrative_project.directory_server.model.EServerStatus;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record HeartbeatServerRequest(@NotNull EServerStatus status, @NotNull @Min(0) @Max(4) int currentPlayers,
        @NotNull @Min(2) @Max(4) int maxPlayers) {
}
