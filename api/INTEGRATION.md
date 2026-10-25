# Integrationshinweise

[REST-Referenz](https://synpex.github.io/lab-protocol/rest/) · [WebSocket-Referenz](https://synpex.github.io/lab-protocol/websocket/) · [Lokale Vorschau und Validierung](README.md#lokal-prüfen-und-ansehen)

## Authentifizierung

Der Betreiber hinterlegt pro Team einen Key in `DIRECTORY_API_KEYS` (`team:key`, kommasepariert, mindestens 32 Zeichen je Key). Spielserver senden ihn als `X-API-Key` bei Registrierung, Heartbeat und Abmeldung. Clients brauchen keinen Key.

- Ungültiger Key: `401 INVALID_API_KEY`.
- Fremder Servereintrag: `403 SERVER_ACCESS_DENIED`.
- Heartbeat alle 10 Sekunden; bei `404` neu registrieren. Nach einem Verzeichnisserver-Neustart müssen sich alle Spielserver erneut anmelden.

[Verzeichnisserver starten](../README.md#lokal-starten)

## Umstieg auf 2.0.0

- `ROTATE_SPARE_TILE` und `INVALID_ACTION` entfallen.
- `PUSH_TILE`, `PUSH_FIXED` und `board.lastPush` nutzen `rowIndex`, `columnIndex`, `direction` und `rotation` statt `rowOrColIndex`.
- Neue Phase: `WAITING_FOR_BONUS_USE`. `PASS_MOVE` überspringt hier die Bonusphase; in `WAITING_FOR_MOVE` beendet es den Zug.
- `BONUS_USED.details` enthält je Bonustyp unterschiedliche Felder.
- Schatz-IDs liegen zwischen 0 und 23. Bei `remainingTreasureCount: 0` sind `treasureId` und `name` null; das Ziel ist die eigene `homePosition`.

Felder, Bonusphasen und Beispiele stehen in der [WebSocket-Referenz](https://synpex.github.io/lab-protocol/websocket/). Die Vertragsversion ist unabhängig von `SERVER_INFO.serverVersion`; eine Versionsaushandlung ist nicht definiert.

## Noch abzustimmen

Vor der Integration mit der Partnergruppe klären:

- Lobby-Einstellungen: Für Änderungen vor dem Spielstart fehlt ein vollständiger Nachrichtenvertrag.
- Timeout: Zusammenspiel von Zugzeit, Antwortfrist, Warncountdown und Reconnect.
- Inventar: Auswahl, Reihenfolge, Kapazität und Kombination von Boni.
- Spielende: Gleichstand, Weiterspielen nach erster Heimkehr und Ende ohne Sieger.
- Wertung: gemeinsame Punkte- und Achievement-Regeln.
- Wertelisten: Schatzmotive sowie Abmelde- und Spielendegründe.

Die Verträge basieren auf den bereitgestellten Schnittstellen-PDFs und den Teamabstimmungen vom Oktober 2026. Für die Implementierung gelten die [OpenAPI](openapi.yaml) und [AsyncAPI](asyncapi.yaml).
