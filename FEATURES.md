# Funktionsumfang des Neubaus

Abgleich mit app.js, index.html, chef.js, ei.html und der bisherigen Bedienungsanleitung.

## Rezepte
- Alle 263 Originaldatensätze einschließlich Zutaten, aller Nährwertfelder, Vorbereitung, Herd, Ofen, Airfryer, Tipps und vorhandener Gesundheitshinweise erhalten.
- Mahlzeiten: Frühstück, Mittag, Abend, Snacks/Desserts; zusätzliche Filter für Low-Carb, High-Protein ab 25 g, Airfryer und Favoriten.
- Suche mit mehreren Zutaten gleichzeitig, vier Gruppen für Zutaten-Schnellauswahl, Suchfeld leeren und Filter zurücksetzen.
- Rezeptdetails, Bilder oder Emoji, gespeicherte Bewertung A–E und klare Kennzeichnung als vorhandene Einschätzung.
- 1–20 Portionen, Mengen einschließlich Brüchen und Bereichen skalieren; Nährwerte auf die ausgewählte Gesamtmenge beziehen.
- Fünf Beilagenoptionen mit zusätzlichen Mengen und Nährwerten; keine medizinischen Garantien zu Insulinspitzen.
- Alle fünf Varianten für „5 gesunde Dips“: Aioli, Honig-Senf, Salsa, Teriyaki, Tzatziki.
- Zutaten per WhatsApp teilen oder in die gemeinsame Notiz-/Einkaufsliste übernehmen.
- Schritte vorlesen, stoppen und Bildschirm beim Kochen wach halten, sofern der Browser dies unterstützt.
- Rezepte manuell erstellen, vollständig bearbeiten, Tipps speichern und nach Bestätigung löschen.

## KI
- Küchenchat mit Gesprächsverlauf, Themenvorschlägen und optionaler Google-Suche.
- Rezepte aus einem Wunschtext oder einem Foto als bearbeitbaren Entwurf erstellen.
- Bilder auswählen/aufnehmen, Vorschau, Entfernen, Komprimieren und Hochladen.
- Modell und Denkaufwand auswählen; tatsächlich verwendetes Modell transparent anzeigen.
- Neuer Schlüssel ausschließlich geschützt serverseitig; Anmeldung, Berechtigungsprüfung und Nutzungslimits.

## Alltag und Einstellungen
- Geteilte Notizen/Einkaufsliste, Ramona/Matze/eigener Anzeigename, erledigen, wieder öffnen, löschen und Echtzeitabgleich.
- Zyklusbeginn und Zykluslänge, vier Phasen, passende Suchvorschläge, Daten ausschließlich lokal auf dem Gerät und löschbar.
- Vollständigen JSON-Datenbankexport sowie validierten, bestätigten Import mit tatsächlicher Speicherung anbieten; ältere Exportformate berücksichtigen.
- Vier saisonale Designs der Garten-App (Frühling, Sommer, Herbst, Winter).
- Eier-Timer mit Größen-/Gewichtswahl, Starttemperatur, Höhenkorrektur, Garstufen, Start/Pause/Weiter/Reset und Signal erhalten.
- Installierbare Web-App, Handy-/Tablet-/Desktopansicht, Hilfe, Impressum und Link zur neuen Garten-App.
- Echte serverseitige Bearbeitungsrechte ersetzen den öffentlich abrufbaren Admin-PIN.

## Abgrenzung
- Rezeptfunktionen im Repository `rezepte` und Supabase-Projekt `kzxzhpebugvzyqfjqedx` umbauen.
- Zusätzlich autorisiert: gemeinsamer Forum-Zugang, gegenseitige App-Verlinkung und Scrollsperre für Dialoge auch in `newgarten`. Bestehende Gartenfunktionen und Gartendatensätze erhalten.
- Einen mutmaßlich kompromittierten KI-Schlüssel nicht wiederverwenden. Widerruf beim Anbieter separat erledigen.

Die Umsetzung wird zusätzlich durch automatisierte Fachlogik-/Backendtests, Browserprüfungen und Live-Zugriffsprüfungen verifiziert.

## Ergänzungen aus dem weiteren Gespräch
- Anmeldung vor allen gemeinsamen Inhalten; neue Konten zunächst durch den Betreiber freischalten.
- Alle freigeschalteten Personen sehen dieselbe Sammlung und dieselbe gemeinsame Einkaufsliste.
- Adminbereich für Rezeptverwaltung, Konten, Rechte und geschützte Gemini-/OpenAI-Schlüssel.
- Gemeinsames Forum in Garten und Rezepte; Profile und gemeinsame Anmeldung werden abgestimmt.
- Frühling, Sommer, Herbst und Winter mit passenden Gerichte-Sprüchen: Wechsel alle 15 Minuten, mindestens sechs Stunden ohne Textwiederholung.
- In beiden Apps zur jeweils anderen App wechseln können.
- In beiden Apps Hintergrundscrollen bei geöffnetem Dialog sperren und nach dem Schließen die Scrollposition wiederherstellen.
- Anonyme Zugriffe auf geschützte Inhalte, Schreibzugriffe ohne Freigabe und Abruf von KI-Schlüsseln ausdrücklich testen.
