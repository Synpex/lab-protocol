# Labyrinth-Schnittstellen

**[Dokumentation öffnen](https://synpex.github.io/lab-protocol/)** – mit Befehlen, Fehlercodes, Schemas und JSON-Beispielen.

| Schnittstelle | Referenz | Vertrag |
| --- | --- | --- |
| Verzeichnisserver · REST | [Swagger UI](https://synpex.github.io/lab-protocol/rest/) | [openapi.yaml](openapi.yaml) |
| Spielserver ↔ Client · WebSocket | [Nachrichtenreferenz](https://synpex.github.io/lab-protocol/websocket/) | [asyncapi.yaml](asyncapi.yaml) |

Die YAML-Dateien lassen sich in API-Werkzeuge importieren. In der AsyncAPI gelten `receive` und `send` aus Sicht des Spielservers. Eine Spielserver-Implementierung ist hier noch nicht enthalten.

## Authentifizierung

Spielserver verwenden ihren Team-Key als `X-API-Key` für Schreibzugriffe auf den Verzeichnisserver. Die Serverliste bleibt öffentlich. [Konfiguration und Start](../README.md#lokal-starten) · [Details und Beispiele](INTEGRATION.md#authentifizierung)

## Lokal prüfen und ansehen

Voraussetzungen: Node.js ab 22.19 und Python 3 für die Vorschau. Vom Repository-Verzeichnis aus:

```sh
cd api
npm ci
npm run validate
npm run build:site
python3 -m http.server 8811 --directory _site
```

Danach [localhost:8811](http://localhost:8811) öffnen. Änderungen auf `main` werden nach erfolgreicher Prüfung automatisch auf GitHub Pages veröffentlicht.

[Quellen, Migration auf 2.0.0 und offene Abstimmungen](INTEGRATION.md) stehen in den Integrationshinweisen. Bei Vertragsänderungen Schema, Beispiele und Beschreibung gemeinsam anpassen und die Validierung ausführen.
