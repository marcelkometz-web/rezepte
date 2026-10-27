# Heute und Menüplanung

Der Tab **Heute** zeigt zwei täglich wechselnde Gerichte aus der vorhandenen Sammlung. Rezeptlinks öffnen in einem eigenen Tab, sodass die aktuelle App geöffnet bleibt. Kalorienbewusste Hauptgerichte werden bevorzugt, sobald mindestens zwei vorhanden sind. Die gleiche Auswahl erscheint in Garten und Abnehmen. `src/daily-selection.mjs` und die gleichlautende Datei der `recipes-daily` wählen nach Datum und stabil sortierten Rezept-IDs; KI-Aufrufe sind dafür nicht nötig.

**Menü zum Abnehmen planen** öffnet den bestehenden Küchen-Assistenten mit einer vorbereiteten Frage und einer begrenzten Auswahl vorhandener Rezepte samt bekannten Nährwerten/Zutaten. Die Frage lässt sich ändern. Anbieter, Modell und Übermittlungsfreigabe werden weiterhin vor dem Absenden ausgewählt. Private Gewichts-, Körpermaß-, BMI- oder Fotodaten aus Abnehmen werden nicht automatisch in diesen Familienbereich übernommen.

Die neue, ausschließlich lesende Funktion `recipes-daily` durchläuft alle bisherigen Konten-, Sitzungs- und Familienprüfungen. Er liefert nur zwei Vorschläge, keine Einkaufsliste. Rezeptlinks `?recipe=ID` öffnen nach einer gültigen Anmeldung direkt das zugehörige Rezept. Die bestehenden Bearbeitungsrechte werden nicht geändert.
