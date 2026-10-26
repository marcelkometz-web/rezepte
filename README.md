# Rezepte

Private Familien-App: https://marcelkometz-web.github.io/rezepte/

Gemeinsame Anmeldung, Nutzerfreigabe, freiwillige Profile und Familienforum mit [Ramonas Garten](https://marcelkometz-web.github.io/newgarten/). Die 263 übernommenen Rezepte liegen weiterhin in ihrem eigenen Supabase-Projekt.

Die vollständige [Bedienhilfe](Read.txt) erklärt alle Funktionen, Rechte, KI-Zugänge, Installation und Sicherungen. Das [Impressum](impressum.html) ist ohne Anmeldung erreichbar.

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

GitHub Pages veröffentlicht `main` aus `/ (root)`. Alle lokalen Dateien verwenden den Pfad `/rezepte/`; der Wechsel zur Garten-App führt nach `/newgarten/`. Keine Sitzungen oder Tokens werden über Links übertragen.
