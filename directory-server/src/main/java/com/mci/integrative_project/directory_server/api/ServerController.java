package com.mci.integrative_project.directory_server.api;

import java.util.List;

import com.mci.integrative_project.directory_server.logic.ServerRegistry;
import com.mci.integrative_project.directory_server.model.GameState;

import jakarta.validation.Valid;
import com.mci.integrative_project.directory_server.security.DirectoryApiKeyFilter;
import org.springframework.web.bind.annotation.RequestAttribute;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/servers")
public class ServerController {
	private final ServerRegistry serverRegistry;

	public ServerController(ServerRegistry serverRegistry) {
		this.serverRegistry = serverRegistry;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public RegisterServerResponse register(@RequestBody @Valid RegisterServerRequest request,
			@RequestAttribute(DirectoryApiKeyFilter.TEAM_ATTRIBUTE) String ownerTeam) {
		GameState server = this.serverRegistry.register(ownerTeam, request.name(), request.host(),
				request.port(), request.maxPlayers());
		return new RegisterServerResponse(server.getServerId(), 10);
	}

	@GetMapping
	@ResponseStatus(HttpStatus.OK)
	public List<GetServerResponse> getMethodName(@RequestParam(required = false) String status) {
		List<GameState> servers = this.serverRegistry.getServers();
		return servers.stream()
				.filter(gameState -> status == null || gameState.getStatus().name().equals(status))
				.map(gameState -> new GetServerResponse(
						gameState.getServerId(),
						gameState.getName(),
						gameState.getHost(),
						gameState.getPort(),
						gameState.getCurrentPlayers(),
						gameState.getMaxPlayers(),
						gameState.getStatus().name()))
				.toList();
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteServer(@PathVariable String id,
			@RequestAttribute(DirectoryApiKeyFilter.TEAM_ATTRIBUTE) String ownerTeam) {
		this.serverRegistry.unregister(id, ownerTeam);
	}

	@PutMapping("/{id}/heartbeat")
	@ResponseStatus(HttpStatus.OK)
	public HeartbeatServerResponse heartbeat(@PathVariable String id,
			@RequestBody @Valid HeartbeatServerRequest request,
			@RequestAttribute(DirectoryApiKeyFilter.TEAM_ATTRIBUTE) String ownerTeam) {
		this.serverRegistry.heartbeat(id, ownerTeam, request.status(), request.currentPlayers(),
				request.maxPlayers());
		return new HeartbeatServerResponse(true);
	}

}
