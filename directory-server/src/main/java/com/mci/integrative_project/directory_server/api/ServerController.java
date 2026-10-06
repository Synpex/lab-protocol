package com.mci.integrative_project.directory_server.api;

import java.util.List;
import java.util.UUID;
import com.mci.integrative_project.directory_server.logic.ServerRegistry;
import com.mci.integrative_project.directory_server.model.EServerStatus;
import com.mci.integrative_project.directory_server.model.GameState;

import jakarta.validation.Valid;

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
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/servers")
public class ServerController {
	private final ServerRegistry serverRegistry;

	public ServerController(ServerRegistry serverRegistry) {
		this.serverRegistry = serverRegistry;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public RegisterServerResponse register(@RequestBody @Valid RegisterServerRequest request) {
		String serverId = "srv-" + UUID.randomUUID().toString().substring(0, 4);
		this.serverRegistry.register(serverId, request.name(), request.host(), request.port(), 0, request.maxPlayers());
		return new RegisterServerResponse(serverId, 10);
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
	public void deleteServer(@PathVariable String id) {
		this.serverRegistry.unregister(id);
	}

	@PutMapping("/{id}/heartbeat")
	@ResponseStatus(HttpStatus.OK)
	public HeartbeatServerResponse heartbeat(@PathVariable String id,
			@RequestBody @Valid HeartbeatServerRequest request) {
		if (!this.serverRegistry.contains(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND);
		}
		this.serverRegistry.heartbeat(id, request.status(), request.currentPlayers(),
				request.maxPlayers());
		return new HeartbeatServerResponse(true);
	}

}
