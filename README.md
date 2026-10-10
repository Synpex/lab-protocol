# lab-protocol

Protokoll für "Das verrückte Labyrinth"

## Verzeichnisserver

Unter dem Verzeichnisserver werden alle registrierten Spielserver verwaltet. Er stellt sicher, dass nur aktive Server im Verzeichnis bleiben und ermöglicht Clients, verfügbare Server zu finden.

### Lokal starten

Voraussetzung ist ein installiertes JDK 25. Maven muss nicht installiert sein, der mitgelieferte Maven Wrapper (`mvnw`) lädt es beim ersten Start selbst herunter.

```sh
cd directory-server
TEAM_1_API_KEY="$(openssl rand -hex 32)"
TEAM_2_API_KEY="$(openssl rand -hex 32)"
export DIRECTORY_API_KEYS="team-1:${TEAM_1_API_KEY},team-2:${TEAM_2_API_KEY}"
./mvnw spring-boot:run
```

Die zwei Team-Namen sind Beispiele; für jedes beteiligte Team einen eigenen zufälligen Key konfigurieren und diesem Team vertraulich bereitstellen. `DIRECTORY_API_KEYS` enthält kommaseparierte `team:key`-Paare. Team-Namen dürfen Buchstaben, Ziffern, `_` und `-` enthalten; Keys müssen mindestens 32 Zeichen lang und ohne Whitespace sein. Doppelte Teams oder Keys werden abgelehnt. Ohne gültige Konfiguration startet der Verzeichnisserver nicht. In einem Deployment die Variable über dessen Secret-Konfiguration setzen; produktive Keys gehören nicht ins Repository.

Unter Windows die Variable `DIRECTORY_API_KEYS` entsprechend setzen und `mvnw.cmd spring-boot:run` verwenden.

Der Server läuft, sobald `Started DirectoryServerApplication` im Log erscheint, und ist dann unter `http://localhost:8080/api/servers` erreichbar. Beendet wird er mit `Strg+C`.

Falls der Build mit einer Meldung wie `release version 25 not supported` abbricht, zeigt `JAVA_HOME` auf ein älteres JDK. Dann den Pfad zum JDK 25 beim Start mitgeben, unter Linux zum Beispiel:

```sh
env JAVA_HOME=/usr/lib/jvm/java-25-openjdk-amd64 ./mvnw spring-boot:run
```

### API-Keys und Besitzrechte

Spielserver senden ihren Team-Key im Header `X-API-Key` bei **POST**, **PUT** und **DELETE**. Der registrierende Key ordnet den Eintrag einem Team zu. Nur dieses Team darf Heartbeats senden oder den Server abmelden. Clients können **GET /api/servers** weiterhin ohne Key aufrufen; die Spielserver-Keys gehören nicht in Clients. Die WebSocket-Verbindung zum Spielserver benötigt diese Verzeichnisserver-Keys nicht.

Fehlender/ungültiger Key: **401** `INVALID_API_KEY`. Zugriff auf den Eintrag eines anderen Teams: **403** `SERVER_ACCESS_DENIED`. Produktiv HTTPS verwenden. Beim Wechsel eines Keys den Team-Namen beibehalten und die Konfiguration des Verzeichnisservers sowie der zugehörigen Spielserver aktualisieren. Nach einem Verzeichnisserver-Neustart müssen sich alle Spielserver erneut registrieren, da das Verzeichnis im Arbeitsspeicher liegt.

Die [REST-Beispiele](api/README.md#verzeichnisserver-rest) zeigen den Header. Die CI prüft Authentifizierung und Team-Besitzrechte mit echten HTTP-Anfragen gegen den Java-Server.

## Maschinenlesbare Schnittstellen

Die Dokumentation ist unter **[synpex.github.io/lab-protocol](https://synpex.github.io/lab-protocol/)** verfügbar: [REST-Verzeichnisserver](https://synpex.github.io/lab-protocol/rest/) und [WebSocket-Spielserver](https://synpex.github.io/lab-protocol/websocket/). Änderungen an `api/` auf `main` werden nach erfolgreicher Prüfung automatisch veröffentlicht.

Die [OpenAPI](api/openapi.yaml) beschreibt ausschließlich die REST-Schnittstelle des Verzeichnisservers. Die [AsyncAPI](api/asyncapi.yaml) beschreibt die WebSocket-Kommunikation zwischen Spielserver und Client unter `/game` mit allen 10 Client-Befehlen und 17 Server-Ereignissen.

[Import, Beispiele, Validierung und dokumentierte Abweichungen](api/README.md) erklären die Nutzung durch andere Teams. Die OpenAPI entspricht dem vorhandenen Java-Code; die AsyncAPI basiert auf den bereitgestellten Schnittstellen-PDFs. Eine Spielserver-Implementierung ist in diesem Repository noch nicht enthalten.

```sh
cd api
npm ci
npm run validate
```
