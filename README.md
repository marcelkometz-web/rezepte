# Rezepte 🍽️

<img src="icon.svg" width="80" height="80" alt="Rezepte">

Private Familien-App: https://marcelkometz-web.github.io/rezepte/

Gemeinsame Anmeldung, Nutzerfreigabe, freiwillige Profile und Familienforum mit [Ramonas Garten](https://marcelkometz-web.github.io/garten/). Die 263 Originalrezepte und 120 ergänzte kalorienbewusste Rezepte liegen in ihrem eigenen Supabase-Projekt. Beim Import waren es 383; eigene Ergänzungen erhöhen die in der App angezeigte Zahl.

Die vollständige [Bedienhilfe](read.html) mit [Textfassung](Read.txt) erklärt alle Funktionen, Rechte, KI-Zugänge, Installation und Sicherungen. Das [Impressum](impressum.html) ist ohne Anmeldung erreichbar.

## Neue Rezepte und Zutatenberechnung

25 Frühstücke, 30 Mittagessen, 25 Abendessen, 20 Desserts und zusätzlich 20 Salate ergänzen die Sammlung. Eigenständige Filter führen zu **Salate**, **Nachtisch** und **Kalorienbewusst**. 104 der neuen Rezepte enthalten mindestens 25 g Eiweiß; 88 liegen bei höchstens 30 g Kohlenhydraten pro Portion. Alle Zutatenmengen, Öle, Dressings und Toppings sind in der Berechnung enthalten.

Die neuen Rezepte speichern ihre Zutatenbasis mit Gramm-Mengen, Quellen und Werten pro 100 g. Über **Zutatenberechnung & Markenwerte** lassen sich Mengen und konkrete Packungsangaben neu berechnen; das Speichern erfordert die bestehenden Bearbeitungsrechte. Details und Grenzen: [Nährwertberechnung](NUTRITION.md). Die 263 Originalrezepte wurden nicht umgeschrieben.

## Entwicklung

```sh
npm ci --ignore-scripts
npm test
npm run build
```

`src/app.js` enthält die für Rezepte abgeleitete bestehende Konto-, Profil-, Admin- und Forumsoberfläche. `src/recipes-ui.js` ergänzt die Rezeptfunktionen. `src/domain.mjs` enthält Mengenrechnung, Suche und Backup-Konvertierung. `src/seasons.mjs` enthält saisonale Gerichte-Sprüche und Wiederholungsschutz.

`config.json` enthält ausschließlich öffentliche Supabase-Projektadressen und Publishable-Keys. Niemals Anbieter-Schlüssel, Service-Keys, Passwörter oder private Rezept-Backups einchecken.

## Backend

- `recipes-api` im Rezepteprojekt prüft die aktuelle Garten-Identität, aktive Sitzung, Familienfreigabe und Bearbeitungsrechte. Browserrollen haben absichtlich weder direkten Schema-Zugriff noch Tabellenrechte für Rezepte und Systemnotizen. Auch alte HTTP-RPCs und frühere Schlüsselablagen sind für diese Rollen gesperrt.
- `recipes-ai` im Gartenprojekt verwendet dessen bereits verschlüsselt verwaltete Gemini-/OpenAI-Zugänge sowie zentrale Modellfreigaben und Limits. Anbieter-Schlüssel werden nicht an den Client zurückgegeben.
- Beide Funktionen prüfen die Anmeldung selbst; die plattformseitige Legacy-JWT-Prüfung ist deshalb deaktiviert. Fehlende oder ungültige Benutzertokens werden im Handler zurückgewiesen.
- Das neue Änderungssignal `recipe_sync_events` enthält nur eine Familienkennung und einen Zeitstempel für den Abgleich. Garten- und Rezeptinhalte werden dafür nicht kopiert.
- Forum und Profilverwaltung verwenden die bestehenden Garten-Daten und Zugriffsregeln.

Die SQL-Dateien wurden mit der Supabase-CLI angelegt und mit dem verbundenen Datenbankzugang ausgeführt. Seed- und Sicherungsdateien mit privaten Originalinhalten werden separat aufbewahrt und sind nicht Bestandteil dieses öffentlichen Repositorys. Ein JSON-Rezeptexport enthält keine Bilddateien und ersetzt keine vollständige Datenbank- und Storage-Sicherung.

## Veröffentlichung

GitHub Pages veröffentlicht `main` aus `/ (root)`. Alle lokalen Dateien verwenden den Pfad `/rezepte/`; der Wechsel zur Garten-App führt nach `/garten/`. Keine Sitzungen oder Tokens werden über Links übertragen.

## Gemeinsame Anmeldung und Wiederherstellung

Garten, Rezepte und Abnehmen teilen ihre Supabase-Anmeldung im lokalen Browser-Speicher. Nach zehn Minuten ohne Bedienung dieser Apps wird gemeinsam abgemeldet; Abmelden in einem Tab beendet alle drei App-Anmeldungen. Die einzelnen App-Freigaben werden weiterhin serverseitig geprüft. `src/shared-auth.mjs` entspricht dem Modul in Abnehmen. „Passwort vergessen?“ kehrt per PKCE in dieselbe App zurück und fordert eine doppelte neue Passwort-Eingabe. Ungültige oder im falschen Browser geöffnete Links führen zu einer neuen Anforderung.

## Gemeinsame Oberfläche

[Unser Zuhause](https://marcelkometz-web.github.io/abnehmen/zuhause/) verbindet Garten, Rezepte und Ramonas Fortschritt in einem App-Fenster. Die vorhandene Anmeldung und Kontofreigabe bleibt wirksam. Die gemeinsame Ansicht ist auf die oberste Startseite derselben Origin begrenzt; fremde oder verschachtelte Frames bleiben gesperrt. Nicht sichtbare Bereiche pausieren ihre regelmäßigen Datenabfragen. [Plattform- und Performancebericht](https://github.com/marcelkometz-web/abnehmen/blob/main/docs/plattformen-und-performance-2026-10-31.md).

## Datenqualität und Hilfe

Das gemeinsame Impressum verwendet den bestätigten Betreiberkontakt. Die allgemeine Hilfe und alle drei Bedienhilfen öffnen im gemeinsamen App-Fenster. Neun ältere Rezepte haben widersprüchliche Teilnährwerte; betroffene Wertepaarungen werden bis zur belegten Korrektur als unbekannt behandelt. Die Originaldaten werden nicht durch erfundene Angaben ersetzt. Der Rezepteditor und die Zutatenberechnung prüfen solche Widersprüche. Bei Beilagen bleiben nicht dokumentierte Teilnährwerte unbekannt statt als null Gramm zu gelten. [Datenbank-Prüfbericht](https://github.com/marcelkometz-web/abnehmen/blob/main/docs/datenbankpruefung-2026-10-31.md).

## Schwebende Navigation

Start, Zurück, Vorwärts und ein auswählbarer Verlauf sind in der gemeinsamen Oberfläche und allen drei Einzel-Apps verfügbar. Die gemeinsame Oberfläche verbindet die bekannten Menüseiten über validierte Frame-Nachrichten; die Einzel-Apps steuern ihre eigenen erlaubten Seiten. Ein neuer Weg nach einem Rücksprung entfernt den bisherigen Vorwärtszweig. Der begrenzte Verlauf bleibt ausschließlich im Arbeitsspeicher und enthält nur feste App-/Seitenkennungen; Authverlust löscht ihn. Offene Dialoge, laufende Speicherungen und ungespeicherte Formulare werden berücksichtigt. Die Leiste erhält reservierten Platz statt Inhalte zu überdecken.

### 📅 Zusammen planen, sicher begleiten

Gemeinsamer privater Wochenplan mit Einkaufsliste, nachvollziehbare Erntevorschläge und verschlüsselte Sicherungen ergänzen die Apps. Ramonas Weg bietet eigene Seiten für Wochenbericht und Übungsprotokoll. Garten und Rezepte erhalten den aufklappbaren Dörrautomaten mit belegten Richtwerten für den Arendo 306526. Umfang, Grenzen und Bedienung stehen in der jeweiligen Bedienhilfe.
