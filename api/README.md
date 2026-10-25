# Labyrinth-Schnittstellen

| Datei | System | Transport | Stand |
| --- | --- | --- | --- |
| [openapi.yaml](openapi.yaml) | Verzeichnisserver | HTTP/REST, OpenAPI 3.1 | Vorhandene Java-Implementierung |
| [asyncapi.yaml](asyncapi.yaml) | Spielserver ↔ Client | WebSocket, AsyncAPI 3.0 | Vertrag aus den bereitgestellten Dokumenten; Spielserver noch nicht im Repo implementiert |

Die Spezifikationen sind unabhängig importierbare YAML-Dateien mit ausschließlich internen `$ref`-Referenzen. Die OpenAPI verwendet `info.version: 2.0.0` wegen der jetzt verpflichtenden Authentifizierung für Schreiboperationen; die AsyncAPI verwendet `2.0.0` wegen der im Oktober bestätigten Änderungen an Befehlen, Schiebeparametern und Ereignissen. Diese Werte versionieren die Vertragsdateien; der Beispielwert `SERVER_INFO.serverVersion: 2.0.0` ist ein anderes, bislang nicht ausgehandeltes Metadatum.

## Quellen und Abgleich

Abgeglichen am **10.10.2026** mit `main` bei Commit [`8b4f61f0357d5ed935c4e1b674baca168927e0c0`](https://github.com/Synpex/lab-protocol/tree/8b4f61f0357d5ed935c4e1b674baca168927e0c0): `ServerController`, Request-/Response-Records, `EServerStatus`, `ServerRegistry`, `ApiExceptionHandler` und README.

**Erweiterung vom 10.10.2026:** Auf ausdrückliche Vorgabe des Auftraggebers wurden getrennte API-Keys je Team und Besitzrechte im Java-Verzeichnisserver ergänzt. Diese Vorgabe stammt aus dem Auftrag und ist keine aus den PDFs abgeleitete Anforderung. Die OpenAPI 2.0.0 bildet diese Erweiterung ab.

Zusätzlich vom Auftraggeber bereitgestellt (die PDF-Dateien sind nicht Bestandteil des Repositories):

- **Shared - Labyrinth Schnittstellen (1).pdf**, 46 Seiten: Architektur/Kernregeln S. 2–3, Sequenzdiagramme S. 4–8, REST S. 9–12, Client-Befehle S. 13–24, Server-Ereignisse S. 25–42, Fehler S. 43–44, Datentypen S. 45, Meetingprotokoll S. 46.
- **Question Answer.pdf**, 11 Seiten: Ergänzungen, Antworten und noch offene Vorschläge. Relevant sind unter anderem Client-KI, Admin-Nachfolge, Zielfeld/kürzester Weg, Achievements und offene Lobby-/Timeout-Regeln.

Die Dokumente werden als fachliche Quellen verwendet. Arbeitsaufträge, To-dos und Vorschläge innerhalb der Dokumente gelten nicht automatisch als beschlossene Erweiterungen des Protokolls. Für REST bildet diese Version den Java-Code einschließlich der beauftragten API-Key-Erweiterung ab; für WebSocket die ausdrücklich beschriebenen Nachrichten. Ergänzungen mit unvollständigem Wire-Format stehen unten als offene Punkte.

## Veröffentlichte Dokumentation

**[Gemeinsame Startseite](https://synpex.github.io/lab-protocol/)** · [REST / Swagger UI](https://synpex.github.io/lab-protocol/rest/) · [WebSocket / AsyncAPI](https://synpex.github.io/lab-protocol/websocket/)

Die Website wird mit `.github/workflows/deploy-pages.yml` aus `main` gebaut. Vor jedem Deployment laufen die Vertragsprüfungen. Beide YAML-Dateien, Swagger UI und der WebSocket-Viewer werden zusammen veröffentlicht; die Browseransichten brauchen kein externes CDN. In den Repository-Einstellungen ist **Pages → Source → GitHub Actions** aktiviert. Ein manueller Neuaufbau ist unter **Actions → Deploy API documentation → Run workflow** möglich.

Lokale Vorschau mit Node.js und Python:

```sh
cd api
npm ci --ignore-scripts
npm run build:site
python3 -m http.server 8811 --directory _site
```

Anschließend `http://localhost:8811` öffnen. `_site/` ist erzeugter Output und bleibt außerhalb von Git. Quellen sind `site/`, `build-site.mjs` und die beiden YAML-Verträge. Der REST-Viewer kann Browser-Anfragen nur an entsprechend erreichbare Zielserver mit HTTPS/CORS senden. Die WebSocket-Ansicht zeigt jede der 26 Nachrichten als eigenen aufklappbaren Eintrag im Swagger-Stil. Eine durchsuchbare Sidebar trennt Client-Befehle und Server-Ereignisse und öffnet die gewählte Nachricht. JSON-Beispiele (einschließlich aller Varianten) und das auflösbare Schema stehen in Tabs direkt im Eintrag; JSON lässt sich kopieren. Die Sidebar lässt sich auf Desktop und Mobilgeräten vollständig ausblenden; der Nachrichtenbereich nutzt dann auch ihre bisherige Breite. Auf Mobilgeräten startet sie ausgeblendet. Der obere Markenbanner entfällt. Eine eigene Fehlerübersicht zeigt alle 17 Codes mit Bedeutung, Auslösern und Links zu den ausdrücklich dokumentierten Befehlen. Diese Befehle verlinken ihre Fehler direkt; `ERROR` verweist auf die vollständige Übersicht. Die Bedeutungen stehen als `oneOf`-Varianten im `ErrorCode`-Schema, die Befehlszuordnungen als `x-error-codes` an den Operationen. Die Handbuchansicht nutzt eine gemeinsame Navigation für Übersicht, REST und WebSocket. Mit `/` öffnest du die Nachrichtensuche, `Escape` leert sie; die Filter „Client“ und „Server“ grenzen die Richtung ein. Direktlinks und vollständige JSON-Beispiele lassen sich pro Nachricht kopieren. Auf breiten Bildschirmen stehen Erklärung und Beispiel nebeneinander, mobil untereinander. Die Daten werden beim Build direkt aus `asyncapi.yaml` erzeugt; es gibt keine zweite manuell gepflegte Vertragsdatei. Die Ansicht ist kein laufender Spielserver oder WebSocket-Testclient. Asset-URLs und Vertragsdaten werden beim Build mit einer Inhaltsrevision versehen, damit veröffentlichte Änderungen nicht mit altem JavaScript/CSS vermischt werden.

## Import und Validierung

- OpenAPI: [Swagger Editor](https://editor.swagger.io/) → **File → Import file** → `openapi.yaml`. Die Datei kann auch in Swagger UI, Postman oder einem OpenAPI-Clientgenerator importiert werden.
- AsyncAPI: [AsyncAPI Studio](https://studio.asyncapi.com/) → `asyncapi.yaml` öffnen/importieren. Die Operationsrichtungen gelten **aus Sicht des Spielservers**: `receive` empfängt Client-Befehle, `send` sendet Server-Ereignisse. Ein Clientgenerator muss entsprechend die Gegenrolle verwenden.

Zum Prüfen sind Node.js >= 22.19 und npm erforderlich, unabhängig vom Java-Server:

```sh
cd api
npm ci
npm run validate
```

Die Prüfung validiert beide Spezifikationsformate, interne Referenzen, alle REST-/WebSocket-Beispiele, Operationsrichtungen, die REST-Authentifizierung, vollständige Board-Beispiele sowie positive und negative Grenzfälle (z. B. gerade Spielfeldgröße, falsche Bonusparameter, fehlendes `maxPlayers`). Sie ersetzt keine Laufzeit- oder Konformitätsprüfung eines Spielservers. Der GitHub-Workflow führt sie bei Änderungen der API-Dateien aus.

## Verzeichnisserver: REST

Lokale Basisadresse: `http://localhost:8080`. Produktive Hostadresse und Port müssen vom Betreiber angegeben werden.

| Methode | Pfad | Aufrufer | Erfolg | Dokumentierte Fehler |
| --- | --- | --- | --- | --- |
| POST | `/api/servers` | Spielserver mit Team-Key | 201, `serverId` und `heartbeatIntervalSeconds` | 400 `INVALID_CONFIG`, 401 `INVALID_API_KEY` |
| GET | `/api/servers?status=LOBBY` | Client | 200, Serverliste | Keine expliziten fachlichen Fehler |
| PUT | `/api/servers/{id}/heartbeat` | Besitzer-Team mit Key | 200, `acknowledged: true` | 400 `INVALID_CONFIG`, 401 `INVALID_API_KEY`, 403 `SERVER_ACCESS_DENIED`, 404 `SERVER_NOT_FOUND` |
| DELETE | `/api/servers/{id}` | Besitzer-Team mit Key | 204, leerer Body | 401 `INVALID_API_KEY`, 403 `SERVER_ACCESS_DENIED`, 404 `SERVER_NOT_FOUND` |

### Authentifizierung

Der Verzeichnisserver-Betreiber konfiguriert `DIRECTORY_API_KEYS` als kommaseparierte `team:key`-Paare und verteilt jeden Key vertraulich an das jeweilige Team. Die [Startanleitung](../README.md#lokal-starten) zeigt die Erzeugung zufälliger Keys. Keine echten Keys in YAML-Dateien, GitHub Pages oder im Repository hinterlegen. Ein Team kann mehrere Spielserver mit demselben Team-Key registrieren. Team-Namen müssen eindeutig sein; verschiedene Teams benötigen verschiedene Keys. Konfiguration ohne Keys oder mit Keys unter 32 Zeichen wird beim Start abgelehnt.

Spielserver senden **genau einen Header `X-API-Key`** bei Registrierung, Heartbeat und Abmeldung. Die Authentifizierung läuft vor dem Einlesen des Bodys. Fehlende, ungültige oder mehrfach gesendete Header ergeben `401 {"error":"INVALID_API_KEY"}` und `WWW-Authenticate: ApiKey realm="directory-server"`. Für fremde registrierte Server ergeben Heartbeat und Abmeldung `403 {"error":"SERVER_ACCESS_DENIED"}`. Ein nicht mehr registrierter Server ergibt mit gültigem Key 404.

**GET /api/servers bleibt öffentlich**, auch mit Statusfilter. Die Antwort enthält keine Keys oder Team-Zuordnung. Spielclients benötigen keinen Verzeichnisserver-Key; die AsyncAPI und ihre Reconnect-Tokens bleiben davon unabhängig. Produktiv HTTPS verwenden. In Swagger UI über **Authorize** den Team-Key eingeben, bevor eine Schreiboperation mit **Try it out** ausgeführt wird.

Für die folgenden Shell-Beispiele `TEAM_API_KEY` auf den vom Betreiber erhaltenen Key setzen. Dieser gehört in die Umgebungs-/Secret-Konfiguration des Spielservers. Beim Rotieren den Team-Namen beibehalten; nach einem Verzeichnisserver-Neustart ist wegen der Speicherung im Arbeitsspeicher eine erneute Registrierung nötig.

Registrierung:

```sh
curl -X POST http://localhost:8080/api/servers \
  -H 'Content-Type: application/json' \
  -H "X-API-Key: ${TEAM_API_KEY}" \
  -d '{"name":"MCI Arena #1","host":"localhost","port":9000,"maxPlayers":4}'
```

Für `SERVER_ID` die tatsächlich erhaltene `serverId` verwenden. Heartbeat:

```sh
curl -X PUT "http://localhost:8080/api/servers/${SERVER_ID}/heartbeat" \
  -H 'Content-Type: application/json' \
  -H "X-API-Key: ${TEAM_API_KEY}" \
  -d '{"status":"LOBBY","currentPlayers":2,"maxPlayers":4}'
```

Abmeldung mit demselben Team-Key:

```sh
curl -X DELETE "http://localhost:8080/api/servers/${SERVER_ID}" \
  -H "X-API-Key: ${TEAM_API_KEY}"
```

Öffentliche Discovery ohne Key:

```sh
curl 'http://localhost:8080/api/servers?status=LOBBY'
```

Heartbeats alle 10 Sekunden. Einträge mit letztem Lebenszeichen älter als 30 Sekunden werden alle 5 Sekunden bereinigt. Bei 404 erneut registrieren. Der Server speichert sein Verzeichnis im Arbeitsspeicher; nach Neustart müssen sich Spielserver neu registrieren.

### Abweichungen zwischen PDF und REST-Code

| Thema | PDF | Aktueller Code / OpenAPI |
| --- | --- | --- |
| Authentifizierung | Kein Team-Key definiert | Beauftragte Erweiterung: `X-API-Key` bei POST/PUT/DELETE, Team-Besitzrechte; GET öffentlich |
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
6. Aktiver Spieler sendet `PUSH_TILE` mit Einfügekoordinaten und Rotation in `WAITING_FOR_PUSH`. Danach folgt `WAITING_FOR_BONUS_USE`: BEAM/SWAP einsetzen oder mit `PASS_MOVE` überspringen. In `WAITING_FOR_MOVE` bewegen oder den Zug mit `PASS_MOVE` beenden. Zustandsänderungen kommen als vollständiger Snapshot zurück.
7. Reconnect binnen 30 Sekunden: neuen WebSocket öffnen, `CONNECT` mit gespeichertem `identifierToken`; nach `CONNECT_ACK` vollständigen State und die private Schatzkarte erhalten.
8. Nach `GAME_OVER` können Vormatch-Spieler für 15 Sekunden bevorzugt eine Revanche zusagen.

**Alle 26 Nachrichtentypen nutzen dieselbe Verbindung und dasselbe Envelope:**

```json
{"type":"CONNECT","data":{"username":"Alice"}}
```

Kein REST-Endpunkt für Spielzüge und kein zusätzlicher WebSocket zum Verzeichnisserver ist in dieser Version definiert. Unicast/Broadcast sind Zustellregeln auf dem gemeinsamen Kanal, keine verschiedenen Endpunkte. Die AsyncAPI enthält 9 Client-Befehle und 17 Server-Ereignisse, jeweils mit vollständigem Envelope-Beispiel. `NEXT_TREASURE`, `CONNECT_ACK`, `SERVER_INFO` und `ERROR` sind privat; `GAME_STATE_UPDATE` ist regulär Broadcast und beim Reconnect zusätzlich Unicast.

Gemeinsame Datentypen: `Direction`, `PlayerColor`, `TurnState`, `BonusType`, `Coordinates`, `Tile`, `Board`, Spielerprofile und Statistik. `USE_BONUS` hat vier unterscheidbare Varianten mit passenden `params`. `row`/`column` beginnen bei 0 oben links; `cols` bezeichnet ausschließlich eine Board-Dimension. Zeitpunkte sind ISO-8601 UTC mit `Z` und basieren auf der Serverzeit.

`entrances` bestimmt verbindlich die offenen Wege. `rotation` ist absolut: 0 = 0°, 1 = 90°, 2 = 180°, 3 = 270°, jeweils im Uhrzeigersinn zur ungedrehten Ausgangslage. `PUSH_TILE` setzt die gewünschte Orientierung beim Einschieben; der Server aktualisiert `entrances` entsprechend. Normale Schübe verwenden ungerade innere Indizes, `PUSH_FIXED` gerade innere Indizes. Figuren auf der hinausgeschobenen Kachel werden auf die neu eingeschobene Kachel gegenüber gesetzt. Boni bleiben an ihrer Kachel. Nur das Bewegungsziel sammelt Bonus/Schatz, Schritte werden nach dem Q&A über den kürzesten Weg gezählt. Ungültige Befehle verändern den Spielzustand nicht; erneute Versuche sind möglich, die Zugzeit läuft weiter.


## Änderungen vom 25.10.2026 (AsyncAPI 2.0.0)

Grundlage sind die vom Auftraggeber zur Übernahme eingereichten Teamnachrichten vom 16.–23.10.2026 und die Bestätigung der Bonusphasen sowie null-Schatzfelder am 25.10.2026. Diese Entscheidungen ersetzen die widersprechenden älteren PDF-Passagen. Der Hinweis auf einen entfallenden `PUSH_TILE` wird wegen der gleichzeitig angeforderten Erweiterung dieses Befehls als Verweis auf den separaten Drehbefehl verstanden. `PUSH_TILE` bleibt erhalten; `ROTATE_SPARE_TILE` und dessen Fehler `INVALID_ACTION` entfallen. Andere Teams müssen ihre Clients für die folgenden Änderungen anpassen.

### Einfügekoordinaten und Rotation

`PUSH_TILE.data` und `USE_BONUS` mit `bonusType: PUSH_FIXED` verwenden `rowIndex`, `columnIndex`, `rotation` und `direction`. `board.lastPush` verwendet dieselbe Darstellung. `rowOrColIndex` entfällt.

Die Koordinaten bezeichnen die Randkachel **im Board**, auf deren Position eingeschoben wird, mit Ursprung oben links:

| Richtung | Einfügeposition | Gewählte Linie |
| --- | --- | --- |
| RIGHT | `columnIndex = 0` | `rowIndex` |
| LEFT | `columnIndex = cols - 1` | `rowIndex` |
| DOWN | `rowIndex = 0` | `columnIndex` |
| UP | `rowIndex = rows - 1` | `columnIndex` |

Regulär ist der gewählte innere Index ungerade, bei `PUSH_FIXED` gerade. Randreihen/-spalten sind keine wählbaren Linien. Obergrenzen und Gegenschubverbot werden anhand des aktuellen Boards geprüft. `rotation` ist die absolute Orientierung der Ersatzkachel (0/90/180/270° im Uhrzeigersinn), kein relativer Drehschritt.

```json
{"type":"PUSH_TILE","data":{"rowIndex":1,"columnIndex":0,"rotation":1,"direction":"RIGHT"}}
```

### Bonusphasen und Ergebnisse

| Befehl / Bonus | Erlaubte Phase | Wirkung / Folgephase |
| --- | --- | --- |
| PUSH_TILE | WAITING_FOR_PUSH | Schieben → WAITING_FOR_BONUS_USE |
| BEAM | WAITING_FOR_BONUS_USE | Auf freies Ziel teleportieren → WAITING_FOR_MOVE |
| SWAP | WAITING_FOR_BONUS_USE | Mit anderem Spieler tauschen → WAITING_FOR_MOVE |
| PUSH_FIXED | WAITING_FOR_PUSH | Gerade innere Linie unmittelbar schieben → WAITING_FOR_BONUS_USE |
| PUSH_TWICE | WAITING_FOR_MOVE, nach erstem Schub | WAITING_FOR_PUSH freischalten, danach PUSH_TILE |
| PASS_MOVE | WAITING_FOR_BONUS_USE | Nur Bonusphase überspringen → WAITING_FOR_MOVE, gleicher Spieler |
| PASS_MOVE | WAITING_FOR_MOVE | Zug ohne Bewegung beenden → nächster Spieler, WAITING_FOR_PUSH |
| MOVE_FIGURE | WAITING_FOR_MOVE | Bewegung ausführen und Zug beenden |

Bei Erfolg wird der genutzte Bonus einmalig aus dem Inventar entfernt. Falsche Phase: `INVALID_TURN_PHASE`; falscher Spieler: `NOT_YOUR_TURN`. `GAME_STATE_UPDATE.currentTurnInfo.turnState` bildet jede Phase explizit ab. Phasenwechsel allein setzen keinen neuen Spielerzug voraus.

`BONUS_USED.data.details` ist je `bonusType` typisiert und hat für jede Variante ein eigenes Beispiel:

| Bonus | Pflichtfelder in details |
| --- | --- |
| BEAM | `targetCoordinates` |
| SWAP | `swappedWithPlayerId` |
| PUSH_FIXED | `rowIndex`, `columnIndex`, `rotation`, `direction` |
| PUSH_TWICE | `turnState: "WAITING_FOR_PUSH"` |

Anschließend folgt der vollständige State; `details` ersetzt diesen Snapshot nicht.

### Schatz-IDs und Heimkehr

Alle Schatz-IDs (`Treasure.id`, `NEXT_TREASURE.treasureId`, `TREASURE_FOUND.treasureId`) verwenden denselben Integerbereich **0 bis 23**. Höchstens 24 verschiedene IDs bedeutet nicht, dass jede Partie alle 24 enthalten muss.

`remainingTreasureCount` zählt alle noch zu sammelnden Karten einschließlich der aktuellen Karte. Bei einem positiven Wert müssen ID und Name gesetzt sein. Nach dem letzten Fund und bei einem Reconnect ohne verbleibende Karte lautet die private Nachricht:

```json
{"type":"NEXT_TREASURE","data":{"treasureId":null,"name":null,"remainingTreasureCount":0}}
```

Der Client zeigt „Kehre zu deiner Homebase zurück“ an und liest das Ziel aus `GAME_STATE_UPDATE.players` beim eigenen `playerId` unter `homePosition`. Es wird keine künstliche Schatz-ID für die Homebase und keine zusätzliche Nachricht eingeführt. Die Bewegung erfolgt weiter über das reguläre Protokoll; die Schatzsammlung allein beendet die Partie noch nicht, die Heimkehr ist zusätzlich erforderlich.

## Auslegung und noch offene Abstimmungen

Diese Punkte sind für Implementierer relevant; sie werden nicht durch erfundene Nachrichten oder Enum-Werte geschlossen:

| Punkt | Behandlung in dieser Vertragsversion |
| --- | --- |
| Lobby-Konfiguration vor dem Start | Q&A schlägt `UPDATE_GAME_CONFIG` und Konfiguration in `LOBBY_STATE` vor. Kein vollständiger, ausdrücklich definierter Wire-Vertrag vorhanden; nicht als weitere Operation ergänzt. Konfiguration bisher über dokumentiertes `START_GAME`. |
| Drehung im `PUSH_TILE` | Seit 2.0.0 direkt über `PUSH_TILE.rotation`; separater Drehbefehl entfernt. |
| `GAME_STARTED`-Board | Begleittext verlangt das gesamte Board, konkretes JSON enthält nur `rows`, `cols`, `gameEndTime`, `spareTile`. Diese Felder übernommen; vollständiger Snapshot zwingend direkt danach. Kein zusätzliches Board-Feld erfunden. |
| Unvollständiges State-Beispiel | PDF zeigt für 7×7 nur eine Zeile mit zwei Kacheln und gleichzeitig Schatz + Bonus. Beispiel durch vollständiges 3×3 mit zwei Spielern ersetzt; Gleichzeitigkeit von Schatz und Bonus im Schema ausgeschlossen. |
| Pflichtfelder von Ereignissen | Wo nur Beispiele vorliegen, deren Felder als vollständige Form modelliert. `PLAYER_UPDATED` ist gemäß Diagramm partiell; `ERROR.message` optional, weil im Diagramm weggelassen. Weitere optionale Varianten müssen abgestimmt werden. |
| Fehlercodes | 17 Codes: PDF-Tabelle plus `INVALID_CONFIG`. `INVALID_ACTION` entfällt; falsche Zugphasen verwenden `INVALID_TURN_PHASE`. |
| Timeout | 30 Sekunden Reconnect, konfigurierbare Zugzeit und 3 Sekunden Warncountdown sind getrennte Größen; Texte/Diagramm legen deren Kopplung nicht konsistent fest. Keine zusätzliche Frist oder Server-KI festgeschrieben. |
| Bonusphasen | `WAITING_FOR_BONUS_USE` und phasenabhängiges `PASS_MOVE` sind bestätigt. Die erlaubten Phasen und Folgezustände stehen in der Tabelle oben. |
| Inventar | Architekturtext erlaubt freie Auswahl, Meetingprotokoll nennt FIFO, Q&A lässt Größe/Handhabung gruppenabhängig. Array bleibt erhalten; keine zusätzliche Reihenfolge-/Kapazitätsregel im Schema. |
| Punkte und Achievements | 20/15/135 sind Beispielwerte, kein vereinbartes Punktesystem. Achievement-Namen sind freie Strings. Kein Login und keine Persistenzpflicht aus diskutierten Vorschlägen abgeleitet. |
| Spielende | Alle Schätze + Rückkehr zur Start-Ecke. Erstes Spielende oder Weiterspielen ist serverabhängig. Nach letzter Karte: `NEXT_TREASURE` mit Zähler 0 und null-Schatzfeldern, Rückkehr zur eigenen `homePosition`. Gleichstand, keine Gewinner-ID sowie unbegrenzte `gameEndTime`-Darstellung bleiben offen. |
| Offene Wertelisten | Schatz-IDs sind 0–23; die Zuordnung zu Motiven/Namen bleibt abzustimmen. Abmelde-/Spielende-Gründe sind nicht vollständig definiert. Bonusdetails sind seit 2.0.0 je Typ spezifiziert. |
| Zusätzliche Metadaten | `requestId`, Kachel-ID, `shape`, Version-Aushandlung und verbleibende Sekunden sind diskutierte Erweiterungen ohne vollständigen Vertrag; nicht erfunden. |

Generierte Clients benötigen bei diesen offenen Fällen eine gemeinsame Abstimmung mit dem implementierenden Spielserver. Ein erfolgreiches Schema-Parsing bestätigt nicht, dass die fachlichen Lücken geklärt sind.

## Weiterentwicklung

Änderungen an einem Nachrichtentyp müssen Payload-Schema, Beispiele und Beschreibung gemeinsam aktualisieren. Bei REST außerdem mit Controller/Records/Fehlerbehandlung vergleichen. Vor Commit `npm run validate` ausführen. Bei Änderungen am Verzeichnisserver zusätzlich unter JDK 25 `cd directory-server && ./mvnw --batch-mode --no-transfer-progress test` ausführen; diese Tests benötigen keine produktiven Keys. Zustandsabhängige Regeln (Board-Matrix entspricht `rows`/`cols`, Koordinaten innerhalb des aktuellen Boards, Rückschiebeverbot, Erreichbarkeit, Belegung, Admin-/Turn-Rechte und insgesamt höchstens 24 Schatzkarten) müssen zusätzlich im Spielserver geprüft werden; reine JSON-Schemata können diese dynamischen Beziehungen nicht vollständig ausdrücken.
