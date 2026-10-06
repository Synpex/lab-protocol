package com.mci.integrative_project.directory_server.model;

public class GameState {
    private EServerStatus status;
    private String serverId;
    private String name;
    private String host;
    private int port;
    private int currentPlayers;
    private int maxPlayers;

    GameState(String serverId, String name, String host, int port, int currentPlayers, int maxPlayers,
            EServerStatus status) {
        this.serverId = serverId;
        this.name = name;
        this.host = host;
        this.port = port;
        this.currentPlayers = currentPlayers;
        this.maxPlayers = maxPlayers;
        this.status = status;
    }

    public String getServerId() {
        return serverId;
    }

    public String getName() {
        return name;
    }

    public String getHost() {
        return host;
    }

    public int getPort() {
        return port;
    }

    public int getCurrentPlayers() {
        return currentPlayers;
    }

    public int getMaxPlayers() {
        return maxPlayers;
    }

    public EServerStatus getStatus() {
        return status;
    }
}
