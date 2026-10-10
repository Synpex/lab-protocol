package com.mci.integrative_project.directory_server.logic;

import com.mci.integrative_project.directory_server.errors.ServerAccessDeniedException;
import com.mci.integrative_project.directory_server.errors.ServerNotFoundException;
import com.mci.integrative_project.directory_server.model.GameState;
import com.mci.integrative_project.directory_server.model.EServerStatus;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class ServerRegistry {
    private record RegisteredServer(GameState state, String ownerTeam) {
    }

    private final Map<String, RegisteredServer> servers = new ConcurrentHashMap<>();

    public List<GameState> getServers() {
        return servers.values().stream().map(RegisteredServer::state).toList();
    }

    public GameState register(String ownerTeam, String name, String host, int port, int maxPlayers) {
        GameState state;
        do {
            String serverId = "srv-" + UUID.randomUUID();
            state = new GameState(serverId, name, host, port, 0, maxPlayers, EServerStatus.UNKNOWN);
        } while (servers.putIfAbsent(state.getServerId(), new RegisteredServer(state, ownerTeam)) != null);
        return state;
    }

    public void unregister(String serverId, String ownerTeam) {
        servers.compute(serverId, (id, registered) -> {
            requireOwner(registered, ownerTeam);
            return null;
        });
    }

    public void heartbeat(String serverId, String ownerTeam, EServerStatus status,
            int currentPlayers, int maxPlayers) {
        servers.compute(serverId, (id, registered) -> {
            requireOwner(registered, ownerTeam);
            GameState state = registered.state();
            state.updateLastHeartbeat();
            state.setStatus(status);
            state.setCurrentPlayers(currentPlayers);
            state.setMaxPlayers(maxPlayers);
            return registered;
        });
    }

    private void requireOwner(RegisteredServer registered, String ownerTeam) {
        if (registered == null) {
            throw new ServerNotFoundException();
        }
        if (!registered.ownerTeam().equals(ownerTeam)) {
            throw new ServerAccessDeniedException();
        }
    }

    @Scheduled(fixedRate = 5000)
    public void removeStaleServers() {
        long cutoff = System.currentTimeMillis() - 30_000;
        // Serialize expiry with heartbeat and ownership checks for the same registration.
        servers.forEach((id, ignored) -> servers.computeIfPresent(id,
                (key, server) -> server.state().getLastHeartbeat() < cutoff ? null : server));
    }
}
