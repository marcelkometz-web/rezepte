# Snacks: Kuchen, Kekse und Sonstiges

„Snacks“ öffnet die drei Unterkategorien. Sie lassen sich mit der Suche kombinieren; die Zahlen beziehen sich auf die ganze Sammlung. „Alle Snacks“ und „Zurück zu allen Rezepten“ verlassen den Unterfilter. Vorhandene Kuchen und Kekse werden auch anhand eindeutiger alter Bezeichnungen gefunden; ihre gespeicherten Rezeptdaten bleiben erhalten. Im Editor kann ein Snacktyp ausdrücklich zugewiesen werden.

Die Erweiterung vom 8. November 2026 ergänzt 25 Kuchen, 25 Keksrezepte und 25 weitere Snacks. Alle werden über die bestehende geschützte Rezept-Datenbank ausgeliefert. Die neuen privaten Rezepttexte, Bestandsinventare und Importdateien werden nicht in den öffentlichen Programmdateien abgelegt. Im Repository stehen nur der Generator, Tests und öffentlich zugängliche Nährwertreferenzen.

## Mengen und Berechnung

Die Datenbank speichert Zutaten und Nährwerte für eine Portion. Bei den neuen Backrezepten öffnet sich zunächst die verifizierte Standardmenge, etwa acht Kuchenstücke oder zwölf Kekse in vier Portionen. Die Anzeige erklärt die Stückzahl und die Portionseinheit; eine einzelne Portion kann weiterhin gewählt werden.

Die Berechnung verwendet die abgewogenen Zutaten und die je Zutat dokumentierten Referenzwerte. Standardlebensmittel stammen überwiegend aus BLS 4.0; einzelne weitere Werte aus USDA beziehungsweise Herstelleretiketten. Es handelt sich um eine nachvollziehbare Rechnung mit Durchschnittswerten, keine Laboranalyse des fertigen Gebäcks. Öl, Nüsse, Milchprodukte und natürlicher Fruchtzucker sind berücksichtigt.

Die Rezepte kommen ohne zugesetzten Haushaltszucker, Honig oder Sirup aus. Das bedeutet **nicht zuckerfrei**: Obst und Milchprodukte enthalten natürlichen Zucker. Erythrit wird mit seinen ausgewiesenen 0 kcal und 0 g Zucker gerechnet; laut Hersteller gehören seine mehrwertigen Alkohole trotzdem zur Kohlenhydratangabe.

## Flavour Drops

15 Keksrezepte verwenden wenig IRONMAXX Flavour Drops in kalter Creme, Füllung oder Glasur. Die Zugabe erfolgt erst nach vollständigem Abkühlen, anschließend wird die Creme nicht erneut erhitzt. Die Tropfen werden nicht im Teig mitgebacken.

Die Herstellerangabe rundet fünf Tropfen auf 0 kcal. Pro 100 ml können dennoch 1 oder 7 kcal ausgewiesen sein. Die Basis speichert diese Originalangabe und die Rezeptdosis getrennt. Es wird keine ungesicherte Umrechnung von Tropfen in Gramm vorgenommen. Die Nährwertansicht erläutert den gerundeten Kleinstbeitrag; bei einer anderen Flasche gelten deren Etikett und Dosierung.

Quellen: [IRONMAXX Vanille](https://www.ironmaxx.de/products/flavour-drops-50ml-flasche-vanille), [IRONMAXX Schokolade](https://www.ironmaxx.de/products/flavour-drops-50ml-flasche-schokolade), [Xucker Erythrit](https://www.xucker.de/suessungsmittel/xucker-light/xucker-light-erythrit), [BfR zu erhitzter Sucralose](https://www.bfr.bund.de/mitteilung/sucralose-beim-erhitzen-ueber-120-grad-koennen-sich-gesundheitsschaedliche-stoffe-bilden/), [BLS-Daten](https://www.blsdb.de/download).

## Verwaltung und Verifikation

`scripts/build-snack-expansion.mjs` verarbeitet separat aufbewahrte Rezeptentwürfe, prüft sie gegen den aktuellen Bestand und erzeugt eine private Importdatei:

```sh
node scripts/build-snack-expansion.mjs --input PRIVATE_BLUEPRINTS.json --existing PRIVATE_INVENTORY.json --output PRIVATE_RESULT.json
```

Der SQL-Generator ergänzt ausschließlich neue Rezepte mit datenbankgenerierten IDs. Er verändert keine vorhandenen Rezepte, Freigaben oder Tabellen. Mengen, Referenzen, vollständige Rechenergebnisse und Standardportionen werden vor dem Import kontrolliert. Taxonomie, Navigation, Berechnung, Duplikaterkennung und sichere Tropfenverwendung sind durch Regressionstests abgedeckt; die Bedienung wird zusätzlich im Browser geprüft.
