package com.mci.integrative_project.directory_server.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterServerRequest(@NotNull @NotBlank String name, @NotNull @NotBlank String host,
        @NotNull @Min(0) @Max(65535) Integer port,
        @NotNull @Min(2) @Max(4) Integer maxPlayers) {
}
