# Rezepte

Private Familien-App: https://marcelkometz-web.github.io/rezepte/

Gemeinsame Anmeldung, Nutzerfreigabe, freiwillige Profile und Familienforum mit [Ramonas Garten](https://marcelkometz-web.github.io/garten/). Die 263 Originalrezepte und 120 ergänzte kalorienbewusste Rezepte liegen in ihrem eigenen Supabase-Projekt (insgesamt 383).

Die vollständige [Bedienhilfe](Read.txt) erklärt alle Funktionen, Rechte, KI-Zugänge, Installation und Sicherungen. Das [Impressum](impressum.html) ist ohne Anmeldung erreichbar.

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
