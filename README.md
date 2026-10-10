# lab-protocol

Protokoll für "Das verrückte Labyrinth"

## Verzeichnisserver

Unter dem Verzeichnisserver werden alle registrierten Spielserver verwaltet. Er stellt sicher, dass nur aktive Server im Verzeichnis bleiben und ermöglicht Clients, verfügbare Server zu finden.

### Lokal starten

Voraussetzung ist ein installiertes JDK 25. Maven muss nicht installiert sein, der mitgelieferte Maven Wrapper (`mvnw`) lädt es beim ersten Start selbst herunter.

```sh
cd directory-server
./mvnw spring-boot:run
```

Unter Windows `mvnw.cmd spring-boot:run` verwenden.

Der Server läuft, sobald `Started DirectoryServerApplication` im Log erscheint, und ist dann unter `http://localhost:8080/api/servers` erreichbar. Beendet wird er mit `Strg+C`.

Falls der Build mit einer Meldung wie `release version 25 not supported` abbricht, zeigt `JAVA_HOME` auf ein älteres JDK. Dann den Pfad zum JDK 25 beim Start mitgeben, unter Linux zum Beispiel:

```sh
env JAVA_HOME=/usr/lib/jvm/java-25-openjdk-amd64 ./mvnw spring-boot:run
```

## Maschinenlesbare Schnittstellen

Die [OpenAPI](api/openapi.yaml) beschreibt ausschließlich die REST-Schnittstelle des Verzeichnisservers. Die [AsyncAPI](api/asyncapi.yaml) beschreibt die WebSocket-Kommunikation zwischen Spielserver und Client unter `/game` mit allen 10 Client-Befehlen und 17 Server-Ereignissen.

[Import, Beispiele, Validierung und dokumentierte Abweichungen](api/README.md) erklären die Nutzung durch andere Teams. Die OpenAPI entspricht dem vorhandenen Java-Code; die AsyncAPI basiert auf den bereitgestellten Schnittstellen-PDFs. Eine Spielserver-Implementierung ist in diesem Repository noch nicht enthalten.

```sh
cd api
npm ci
npm run validate
```
