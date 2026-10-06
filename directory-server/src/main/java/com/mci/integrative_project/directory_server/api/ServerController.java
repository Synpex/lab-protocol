package com.mci.integrative_project.directory_server.api;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public RegisterServerResponse register(@RequestBody RegisterServerRequest request) {
		String serverId = "srv-" + UUID.randomUUID().toString().substring(0, 4);
		return new RegisterServerResponse(serverId, 10);
	}

	@GetMapping
	@ResponseStatus(HttpStatus.OK)
	public List<GetServerResponse> getMethodName(@RequestParam(required = false) String status) {
		return List.of(
				new GetServerResponse("srv-0000", "MCI Arena #1", "192.168.1.100", 9000, 2, 4, "LOBBY"),
				new GetServerResponse("srv-0001", "MCI Arena #2", "192.168.1.100", 9000, 2, 4, "RUNNING"));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteServer() {

	}

	@PutMapping("/{id}/heartbeat")
	@ResponseStatus(HttpStatus.OK)
	public HeartbeatServerResponse heartbeat(@RequestBody HeartbeatServerRequest request) {
		return new HeartbeatServerResponse(true);
	}

}
