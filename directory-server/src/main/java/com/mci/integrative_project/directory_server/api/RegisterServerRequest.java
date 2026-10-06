package com.mci.integrative_project.directory_server.api;

import jakarta.validation.constraints.NotNull;

public record RegisterServerRequest(@NotNull String name, @NotNull String host, @NotNull Integer port,
        @NotNull Integer maxPlayers) {
}
