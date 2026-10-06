package com.mci.integrative_project.directory_server.model;

public class GameState {
    private EServerStatus status;
    private String serverId;
    private String name;
    private String host;
    private int port;
    private int currentPlayers;
    private int maxPlayers;
    private long lastHeartbeat;

    public GameState(String serverId, String name, String host, int port, int currentPlayers, int maxPlayers,
            EServerStatus status) {
        this.serverId = serverId;
        this.name = name;
        this.host = host;
        this.port = port;
        this.currentPlayers = currentPlayers;
        this.maxPlayers = maxPlayers;
        this.status = status;
        this.lastHeartbeat = System.currentTimeMillis();
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

    public long getLastHeartbeat() {
        return lastHeartbeat;
    }

    public void updateLastHeartbeat() {
        this.lastHeartbeat = System.currentTimeMillis();
    }

    public void setStatus(EServerStatus status) {
        this.status = status;
    }

    public void setCurrentPlayers(int currentPlayers) {
        this.currentPlayers = currentPlayers;
    }

    public void setMaxPlayers(int maxPlayers) {
        this.maxPlayers = maxPlayers;
    }
}
