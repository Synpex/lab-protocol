package com.mci.integrative_project.directory_server.logic;

import com.mci.integrative_project.directory_server.model.GameState;
import com.mci.integrative_project.directory_server.model.EServerStatus;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class ServerRegistry {
    private Map<String, GameState> servers = new ConcurrentHashMap<>();

    public List<GameState> getServers() {
        return List.copyOf(servers.values());
    }

    public GameState register(String serverId, String name, String host, int port, int currentPlayers, int maxPlayers) {
        GameState gameState = new GameState(serverId, name, host, port, currentPlayers, maxPlayers,
                EServerStatus.UNKNOWN);
        servers.put(serverId, gameState);
        return gameState;
    }

    public boolean unregister(String serverId) {
        return servers.remove(serverId) != null;
    }

    public boolean heartbeat(String serverId, EServerStatus status, int currentPlayers, int maxPlayers) {
        GameState gameState = servers.get(serverId);
        if (gameState != null) {
            gameState.updateLastHeartbeat();
            gameState.setStatus(status);
            gameState.setCurrentPlayers(currentPlayers);
            gameState.setMaxPlayers(maxPlayers);
            return true;
        }
        return false;
    }

    public boolean contains(String serverId) {
        return servers.containsKey(serverId);
    }

}
