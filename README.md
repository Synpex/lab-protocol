# lab-protocol

Schnittstellen für „Das verrückte Labyrinth“ und die Java-Implementierung des Verzeichnisservers. Der Verzeichnisserver nutzt REST; Spielserver und Clients kommunizieren über WebSocket. Eine Spielserver-Implementierung ist hier noch nicht enthalten.

## Dokumentation

**[Dokumentation öffnen](https://synpex.github.io/lab-protocol/)**

- [REST-Referenz](https://synpex.github.io/lab-protocol/rest/) · [OpenAPI-Datei](api/openapi.yaml)
- [WebSocket-Referenz](https://synpex.github.io/lab-protocol/websocket/) · [AsyncAPI-Datei](api/asyncapi.yaml)
- [Beispiele, Import und Hinweise zur Implementierung](api/README.md)

## Lokal starten

Der Verzeichnisserver benötigt **JDK 25**. Für jedes Team wird ein eigener API-Key konfiguriert:

```sh
cd directory-server
export DIRECTORY_API_KEYS="team-1:$(openssl rand -hex 32),team-2:$(openssl rand -hex 32)"
./mvnw spring-boot:run
```

Die Serverliste ist unter `http://localhost:8080/api/servers` erreichbar. Unter Windows `mvnw.cmd` verwenden.

Spielserver senden ihren Team-Key als `X-API-Key` und dürfen nur eigene Einträge verwalten. Das Abrufen der Serverliste bleibt öffentlich. Echte Keys gehören in die Secret-Konfiguration; Details stehen unter [Authentifizierung](api/README.md#authentifizierung).

## Schnittstellen prüfen

Mit **Node.js ab 22.19**:

```sh
cd api
npm ci
npm run validate
```
