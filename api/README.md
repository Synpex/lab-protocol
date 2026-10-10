# Labyrinth-Schnittstellen

| Datei | System | Transport | Stand |
| --- | --- | --- | --- |
| [openapi.yaml](openapi.yaml) | Verzeichnisserver | HTTP/REST, OpenAPI 3.1 | Vorhandene Java-Implementierung |
| [asyncapi.yaml](asyncapi.yaml) | Spielserver ↔ Client | WebSocket, AsyncAPI 3.0 | Vertrag aus den bereitgestellten Dokumenten; Spielserver noch nicht im Repo implementiert |

Die Spezifikationen sind unabhängig importierbare YAML-Dateien mit ausschließlich internen `$ref`-Referenzen. `info.version: 1.0.0` versioniert diese Vertragsdateien; der Beispielwert `SERVER_INFO.serverVersion: 2.0.0` ist ein anderes, bislang nicht ausgehandeltes Metadatum.

## Quellen und Abgleich

Abgeglichen am **10.10.2026** mit `main` bei Commit [`8b4f61f0357d5ed935c4e1b674baca168927e0c0`](https://github.com/Synpex/lab-protocol/tree/8b4f61f0357d5ed935c4e1b674baca168927e0c0): `ServerController`, Request-/Response-Records, `EServerStatus`, `ServerRegistry`, `ApiExceptionHandler` und README.

Zusätzlich vom Auftraggeber bereitgestellt (die PDF-Dateien sind nicht Bestandteil des Repositories):

- **Shared - Labyrinth Schnittstellen (1).pdf**, 46 Seiten: Architektur/Kernregeln S. 2–3, Sequenzdiagramme S. 4–8, REST S. 9–12, Client-Befehle S. 13–24, Server-Ereignisse S. 25–42, Fehler S. 43–44, Datentypen S. 45, Meetingprotokoll S. 46.
- **Question Answer.pdf**, 11 Seiten: Ergänzungen, Antworten und noch offene Vorschläge. Relevant sind unter anderem Client-KI, Admin-Nachfolge, Zielfeld/kürzester Weg, Achievements und offene Lobby-/Timeout-Regeln.

Die Dokumente werden als fachliche Quellen verwendet. Arbeitsaufträge, To-dos und Vorschläge innerhalb der Dokumente gelten nicht automatisch als beschlossene Erweiterungen des Protokolls. Für REST bildet diese Version den vorhandenen Code ab; für WebSocket die ausdrücklich beschriebenen Nachrichten. Ergänzungen mit unvollständigem Wire-Format stehen unten als offene Punkte.

## Import und Validierung

- OpenAPI: [Swagger Editor](https://editor.swagger.io/) → **File → Import file** → `openapi.yaml`. Die Datei kann auch in Swagger UI, Postman oder einem OpenAPI-Clientgenerator importiert werden.
- AsyncAPI: [AsyncAPI Studio](https://studio.asyncapi.com/) → `asyncapi.yaml` öffnen/importieren. Die Operationsrichtungen gelten **aus Sicht des Spielservers**: `receive` empfängt Client-Befehle, `send` sendet Server-Ereignisse. Ein Clientgenerator muss entsprechend die Gegenrolle verwenden.

Zum Prüfen sind Node.js >= 22.19 und npm erforderlich, unabhängig vom Java-Server:

```sh
cd api
npm ci
npm run validate
```

Die Prüfung validiert beide Spezifikationsformate, interne Referenzen, alle REST-/WebSocket-Beispiele, Operationsrichtungen, vollständige Board-Beispiele sowie positive und negative Grenzfälle (z. B. gerade Spielfeldgröße, falsche Bonusparameter, fehlendes `maxPlayers`). Sie ersetzt keine Laufzeit- oder Konformitätsprüfung eines Spielservers. Der GitHub-Workflow führt sie bei Änderungen der API-Dateien aus.

## Verzeichnisserver: REST

Lokale Basisadresse: `http://localhost:8080`. Produktive Hostadresse und Port müssen vom Betreiber angegeben werden.

| Methode | Pfad | Aufrufer | Erfolg | Dokumentierte Fehler |
| --- | --- | --- | --- | --- |
| POST | `/api/servers` | Spielserver | 201, `serverId` und `heartbeatIntervalSeconds` | 400 `INVALID_CONFIG` |
| GET | `/api/servers?status=LOBBY` | Client | 200, Serverliste | Keine expliziten fachlichen Fehler |
| PUT | `/api/servers/{id}/heartbeat` | Spielserver | 200, `acknowledged: true` | 400 `INVALID_CONFIG`, 404 `SERVER_NOT_FOUND` |
| DELETE | `/api/servers/{id}` | Spielserver | 204, leerer Body | 404 `SERVER_NOT_FOUND` |

Registrierung:

```sh
curl -X POST http://localhost:8080/api/servers \
  -H 'Content-Type: application/json' \
  -d '{"name":"MCI Arena #1","host":"localhost","port":9000,"maxPlayers":4}'
```

Heartbeat mit der tatsächlich erhaltenen `serverId`:

```sh
curl -X PUT http://localhost:8080/api/servers/srv-44a1/heartbeat \
  -H 'Content-Type: application/json' \
  -d '{"status":"LOBBY","currentPlayers":2,"maxPlayers":4}'
```

Heartbeats alle 10 Sekunden. Einträge mit letztem Lebenszeichen älter als 30 Sekunden werden alle 5 Sekunden bereinigt. Bei 404 erneut registrieren. Der Server speichert sein Verzeichnis im Arbeitsspeicher; nach Neustart müssen sich Spielserver neu registrieren.

### Abweichungen zwischen PDF und REST-Code

| Thema | PDF | Aktueller Code / OpenAPI |
| --- | --- | --- |
| Registrierung | `name`, `host`, `port` | Zusätzlich `maxPlayers` erforderlich (2–4) |
| Heartbeat | `status`, `currentPlayers` | Zusätzlich `maxPlayers` (2–4) mitsenden; aktualisiert die Kapazität |
| Status | `LOBBY`, `RUNNING` | Zusätzlich `UNKNOWN`; Status unmittelbar nach Registrierung |
| Listenfilter | Zwei Statuswerte genannt | Case-sensitiver Stringvergleich; auch `UNKNOWN` möglich, unbekannte Werte ergeben `[]` |
| Heartbeat-Fehler | Nur 404 aufgeführt | Zusätzlich 400 bei JSON-/Validierungsfehlern |
| Abmelde-Fehler | Nur HTTP 404 genannt | JSON-Body `{"error":"SERVER_NOT_FOUND"}` |
| Port | Beispiel 9000 | Validiert werden 0–65535, keine Beschränkung auf positive Ports |

Die OpenAPI beschreibt die vollständigen von Konsumenten zu sendenden Heartbeat-Felder. `currentPlayers` und `maxPlayers` sind im Java-Record primitive `int`; `@NotNull` allein kann fehlende primitive Werte nicht verlässlich unterscheiden. Außerdem prüft der Code nicht `currentPlayers <= maxPlayers`. Diese Spezifikation verspricht daher keine vollständige fachliche Validierung des Servers. Nicht dokumentierte Framework-Coercions sind kein empfohlener Clientvertrag.

## Spielserver: WebSocket

1. Client ruft die Serverliste per REST ab und wählt `host` und `port`.
2. Client öffnet **`ws://host:port/game` direkt zum Spielserver**.
3. Spielserver sendet `SERVER_INFO` per Unicast; Client sendet binnen 10 Sekunden `CONNECT`.
4. `CONNECT_ACK` liefert Spieler-ID, Farbe, Admin-Rolle und privates Reconnect-Token. `LOBBY_STATE` aktualisiert die Teilnehmer.
5. Admin sendet `START_GAME`. Server sendet `GAME_STARTED`, unmittelbar danach den vollständigen `GAME_STATE_UPDATE` sowie je Spieler private `NEXT_TREASURE`.
6. Aktiver Spieler dreht/schiebt in `WAITING_FOR_PUSH`, bewegt seine Figur oder passt in `WAITING_FOR_MOVE`. Zustandsänderungen kommen als vollständiger Snapshot zurück.
7. Reconnect binnen 30 Sekunden: neuen WebSocket öffnen, `CONNECT` mit gespeichertem `identifierToken`; nach `CONNECT_ACK` vollständigen State und die private Schatzkarte erhalten.
8. Nach `GAME_OVER` können Vormatch-Spieler für 15 Sekunden bevorzugt eine Revanche zusagen.

**Alle 27 Nachrichtentypen nutzen dieselbe Verbindung und dasselbe Envelope:**

```json
{"type":"CONNECT","data":{"username":"Alice"}}
```

Kein REST-Endpunkt für Spielzüge und kein zusätzlicher WebSocket zum Verzeichnisserver ist in dieser Version definiert. Unicast/Broadcast sind Zustellregeln auf dem gemeinsamen Kanal, keine verschiedenen Endpunkte. Die AsyncAPI enthält 10 Client-Befehle und 17 Server-Ereignisse, jeweils mit vollständigem Envelope-Beispiel. `NEXT_TREASURE`, `CONNECT_ACK`, `SERVER_INFO` und `ERROR` sind privat; `GAME_STATE_UPDATE` ist regulär Broadcast und beim Reconnect zusätzlich Unicast.

Gemeinsame Datentypen: `Direction`, `PlayerColor`, `TurnState`, `BonusType`, `Coordinates`, `Tile`, `Board`, Spielerprofile und Statistik. `USE_BONUS` hat vier unterscheidbare Varianten mit passenden `params`. `row`/`column` beginnen bei 0 oben links; `cols` bezeichnet ausschließlich eine Board-Dimension. Zeitpunkte sind ISO-8601 UTC mit `Z` und basieren auf der Serverzeit.

`entrances` bestimmt verbindlich die offenen Wege. `rotation` 0–3 dient zur Darstellung; eine Drehung über `ROTATE_SPARE_TILE` aktualisiert beide Werte. Normale Schübe verwenden ungerade innere Indizes, `PUSH_FIXED` gerade innere Indizes. Figuren auf der hinausgeschobenen Kachel werden auf die neu eingeschobene Kachel gegenüber gesetzt. Boni bleiben an ihrer Kachel. Nur das Bewegungsziel sammelt Bonus/Schatz, Schritte werden nach dem Q&A über den kürzesten Weg gezählt. Ungültige Befehle verändern den Spielzustand nicht; erneute Versuche sind möglich, die Zugzeit läuft weiter.

## Auslegung und noch offene Abstimmungen

Diese Punkte sind für Implementierer relevant; sie werden nicht durch erfundene Nachrichten oder Enum-Werte geschlossen:

| Punkt | Behandlung in dieser Vertragsversion |
| --- | --- |
| Lobby-Konfiguration vor dem Start | Q&A schlägt `UPDATE_GAME_CONFIG` und Konfiguration in `LOBBY_STATE` vor. Kein vollständiger, ausdrücklich definierter Wire-Vertrag vorhanden; nicht als weitere Operation ergänzt. Konfiguration bisher über dokumentiertes `START_GAME`. |
| Drehung im `PUSH_TILE` | Q&A schlägt Ablösung von `ROTATE_SPARE_TILE` vor. API-Dokumentation und Diagramm führen den Befehl weiterhin und `PUSH_TILE` ohne Rotation; diese Fassung beibehalten. |
| `GAME_STARTED`-Board | Begleittext verlangt das gesamte Board, konkretes JSON enthält nur `rows`, `cols`, `gameEndTime`, `spareTile`. Diese Felder übernommen; vollständiger Snapshot zwingend direkt danach. Kein zusätzliches Board-Feld erfunden. |
| Unvollständiges State-Beispiel | PDF zeigt für 7×7 nur eine Zeile mit zwei Kacheln und gleichzeitig Schatz + Bonus. Beispiel durch vollständiges 3×3 mit zwei Spielern ersetzt; Gleichzeitigkeit von Schatz und Bonus im Schema ausgeschlossen. |
| Pflichtfelder von Ereignissen | Wo nur Beispiele vorliegen, deren Felder als vollständige Form modelliert. `PLAYER_UPDATED` ist gemäß Diagramm partiell; `ERROR.message` optional, weil im Diagramm weggelassen. Weitere optionale Varianten müssen abgestimmt werden. |
| Fehlercodes | Tabelle plus `INVALID_CONFIG` aus `START_GAME` und `INVALID_ACTION` aus `ROTATE_SPARE_TILE` zusammengeführt. Bedeutung/Abgrenzung von `INVALID_ACTION` zu `INVALID_TURN_PHASE` ist noch abzustimmen. |
| Timeout | 30 Sekunden Reconnect, konfigurierbare Zugzeit und 3 Sekunden Warncountdown sind getrennte Größen; Texte/Diagramm legen deren Kopplung nicht konsistent fest. Keine zusätzliche Frist oder Server-KI festgeschrieben. |
| Bonusphasen | `BONUS` ist nur eine Überschrift und fehlt im TurnState-Enum. `PUSH_TWICE`: MOVE → PUSH beschrieben; Zeitpunkt/Wirkung der übrigen Boni auf Zugabschluss offen. |
| Inventar | Architekturtext erlaubt freie Auswahl, Meetingprotokoll nennt FIFO, Q&A lässt Größe/Handhabung gruppenabhängig. Array bleibt erhalten; keine zusätzliche Reihenfolge-/Kapazitätsregel im Schema. |
| Punkte und Achievements | 20/15/135 sind Beispielwerte, kein vereinbartes Punktesystem. Achievement-Namen sind freie Strings. Kein Login und keine Persistenzpflicht aus diskutierten Vorschlägen abgeleitet. |
| Spielende | Alle Schätze + Rückkehr zur Start-Ecke. Erstes Spielende oder Weiterspielen ist serverabhängig. Gleichstand, keine Gewinner-ID, letzte Schatzkarte sowie unbegrenzte `gameEndTime`-Darstellung nicht verbindlich definiert. |
| Offene Wertelisten | Schatz-ID-Katalog, Abmelde-/Spielende-Gründe und Details anderer Boni sind nicht vollständig definiert; keine künstlichen Enums oder IDs ergänzt. |
| Zusätzliche Metadaten | `requestId`, Kachel-ID, `shape`, Version-Aushandlung und verbleibende Sekunden sind diskutierte Erweiterungen ohne vollständigen Vertrag; nicht erfunden. |

Generierte Clients benötigen bei diesen offenen Fällen eine gemeinsame Abstimmung mit dem implementierenden Spielserver. Ein erfolgreiches Schema-Parsing bestätigt nicht, dass die fachlichen Lücken geklärt sind.

## Weiterentwicklung

Änderungen an einem Nachrichtentyp müssen Payload-Schema, Beispiele und Beschreibung gemeinsam aktualisieren. Bei REST außerdem mit Controller/Records/Fehlerbehandlung vergleichen. Vor Commit `npm run validate` ausführen. Zustandsabhängige Regeln (Board-Matrix entspricht `rows`/`cols`, Koordinaten innerhalb des aktuellen Boards, Rückschiebeverbot, Erreichbarkeit, Belegung, Admin-/Turn-Rechte und insgesamt höchstens 24 Schatzkarten) müssen zusätzlich im Spielserver geprüft werden; reine JSON-Schemata können diese dynamischen Beziehungen nicht vollständig ausdrücken.
