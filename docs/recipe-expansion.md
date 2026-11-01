# 220 neue Rezepte 🍲🥗🍓

Der Batch `recipe-expansion-20261101` ergänzt 220 eigenständig zusammengestellte Rezepte für jeweils eine vollständige Portion. Es werden ausschließlich die 121 bereits vorhandenen, geprüften Lebensmittelreferenzen der bestehenden Zutatenberechnungen verwendet. Es gibt keine erfundenen Markenwerte, hinzugefügten Personenangaben oder neuen KI-Bilder.

| Schwerpunkt | Neue Rezepte | Energie je Portion | Eiweiß je Portion |
|---|---:|---:|---:|
| Frühstück | 40 | 298,7–438,7 kcal | 25,3–37,6 g |
| Mittagessen | 50 | 346,0–536,6 kcal | 31,4–49,6 g |
| Abendessen | 40 | 291,5–466,9 kcal | 33,4–48,3 g |
| Salate als Hauptmahlzeit | 35 | 294,4–479,0 kcal | 32,8–49,5 g |
| Nachtisch | 35 | 117,1–262,2 kcal | 2,3–22,2 g |
| Zusätzliche Eintöpfe | 20 | 347,1–509,1 kcal | 36,8–45,1 g |

Ein Rezept kann in mehreren passenden Filtern erscheinen. 185 Rezepte erreichen die App-Regel **High-Protein** (mindestens 25 g Eiweiß pro Originalportion), 132 die App-Regel **Low-Carb** (höchstens 30 g Kohlenhydrate). Die 20 zusätzlichen Eintöpfe und vier passende Topfgerichte aus der übrigen Auswahl tragen `eintoepfe`. 139 Rezepte enthalten weder Fleisch noch Fisch oder Krebstiere; davon bestehen 15 ausschließlich aus pflanzlichen Referenzzutaten. Das sind Zutatenbeschreibungen, keine Zertifizierung von Produkten oder Allergiefreiheit.

## Nachvollziehbare Nährwerte 🔎

Jede Zutat enthält Grammmenge, Lebensmittelzustand, Originalbezeichnung, Datenquelle und acht Referenzwerte pro 100 g. Öl, Dressings, Nüsse, Saaten, Käse und Gewürze zählen mit. Die vorhandene Funktion `roundedNutrition` addiert zunächst ungerundet und rundet erst die Summe. Energie und Grammwerte erhalten eine, Salz zwei Nachkommastellen. Zutatenliste und gespeicherte Werte werden gegen dieselbe Berechnungsbasis geprüft.

Natürlich vorkommender Zucker wird mitgezählt. **Ohne zusätzlich eingestreuten Haushaltszucker bedeutet weder zuckerfrei noch automatisch zuckerarm.** Auch Honig, Sirup und gesüßte Ersatzprodukte sind nicht vorgesehen. Die Dessertportionen enthalten je nach Frucht-/Milchmischung 8,8–24,6 g Gesamtzucker. Die Referenzen sind Durchschnittswerte und ersetzen keine Laboranalyse oder konkreten Packungswerte. Bei 15 Fischgerichten fehlt ein belastbarer Ballaststoff-Referenzwert; die Ballaststoffsumme bleibt dort ausdrücklich unbekannt.

Quellen: Max Rubner-Institut (2025), **Bundeslebensmittelschlüssel 4.0**, [DOI 10.25826/Data20251217-134202-0](https://doi.org/10.25826/Data20251217-134202-0), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Gewählte Gewürze: [USDA FoodData Central](https://fdc.nal.usda.gov/), SR Legacy, Public Domain. Originalcodes, Zustände und gegebenenfalls Nachweisgrenzen bleiben je Zutat erhalten. Weitere Erläuterungen stehen in [NUTRITION.md](../NUTRITION.md).

## Vielfalt und Zubereitung 🍳

Die Auswahl enthält gekühlte Haferfrühstücke, Getreidebreie, Pfannkuchen, Eiergerichte, Brotmahlzeiten, Füllungen, Ofengemüse, Fischpäckchen, Gemüsepfannen, Hülsenfruchtgerichte, Salate, Eintöpfe, Kompotte, gebackene Desserts und Eisvarianten. Alle 220 Titel unterscheiden sich auch nach Entfernung üblicher Werbeadjektive. Zusätzlich besitzt jedes Rezept eine eigene Kombination von Hauptzutaten, selbst wenn Öl, Wasser, Kräuter und Gewürze beim Vergleich ignoriert werden.

Zubereitungsschritte wurden redaktionell auf Zutaten, Zustände und Garregeln geprüft; es gab **keinen praktischen Koch- oder Geschmackstest aller Gerichte**. Garzeiten bleiben vom Gerät, der Schnittgröße und dem Produkt abhängig. Geflügel erhält eine konkrete Kerntemperaturangabe, Eier werden durchgegart, grüne Bohnen vorgekocht und die gegebenenfalls aufgetauten Beeren vor kalter Verwendung erhitzt. Luftfritteusen-Schritte werden nicht automatisch aus Ofenzeiten erfunden. Lebensmittelallergene und sichere Kühlung werden ausdrücklich erwähnt.

## Bestehende Eintöpfe zuordnen 🥘

Eine getrennte, manuell kuratierte Liste ordnet elf vorhandene stückige Eintöpfe, Gulasch-, Chili- und Bohnentopfgerichte zusätzlich der Kategorie `eintoepfe` zu. Fein pürierte Cremesuppen und nicht eindeutig passende Suppen werden nicht pauschal umbenannt. Vorhandene Kategorien bleiben erhalten; ausschließlich `eintoepfe` wird ergänzt. Der SQL-Entwurf prüft dafür die exakte bisherige ID, den Titel und den Kategorienstand und bricht bei fremden Änderungen ab. Bestehende Zutaten, Nährwerte und Zubereitungen werden dabei nicht verändert.

## Reproduzierbarer Build und Einspielen 🧰

Die neue Datendatei enthält Referenzbibliothek, Rezeptentwürfe, fertige App-Datensätze und Prüfsummenmetadaten. Bestehende private Rezepttexte oder Kontodaten werden nicht in den neuen Datensatz kopiert. Die Prüfung gegen die ursprünglichen 384 Titel ist nur als Anzahl und Hash hinterlegt.

```sh
node scripts/build-recipe-expansion.mjs --check
node tests/recipe-expansion.test.mjs
```

Ohne `--check` erzeugt der Builder außerdem `/tmp/recipe-expansion-20261101.sql`. Der Entwurf fügt ausschließlich neue Zeilen ein, lässt IDs von der Datenbank vergeben und überspringt vorhandene kanonische Titel. Er führt keine Aktualisierung oder Löschung vorhandener Rezepte aus. Ein erneuter Import soll deshalb keine weiteren Kopien anlegen. Private SQL-Eingabedateien und die Liste alter Rezeptstände gehören nicht ins Repository.

Mit `--legacy-stews /tmp/recipe-stew-backfill-rows.json` wird zusätzlich `/tmp/recipe-stew-backfill-20261101.sql` für die gesonderte Kategorienergänzung erstellt. Vor dem produktiven Einspielen werden Altbestands-Hashes aufgenommen; danach werden eingefügte Anzahl, Kategorien, Formate und Zutatenberechnungen aus der Datenbank erneut geprüft. Für die elf ausdrücklich zugeordneten Altgerichte darf ausschließlich die Kategorie samt automatisch geführter Version/Zeit abweichen.
