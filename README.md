# SSS-Trainer Seemannschaft

Übungsprogramm für den theoretischen Prüfungsteil **Seemannschaft** des
Sportseeschifferscheins. 147 Prüfungsfragen aus neun Themengebieten, Antwort
frei formulieren, Bewertung gegen ein Konzeptmodell, danach Abgleich mit der
wörtlichen Musterlösung.

Die Anwendung läuft ohne Server, ohne Anmeldung und ohne Netzverbindung. Der
Lernstand bleibt im Browser.

---

## Neu: Nochmals fragen und Alle Fragen

- **Nochmals fragen:** Nach einer richtigen Antwort (nach der Selbstbewertung
  „Sass“) erscheint der Knopf „Nochmals fragen“. Ist er aktiviert, kommt die
  Frage nach drei bis sechs anderen Fragen in derselben Runde nochmals.
- **Automatische Wiederholung:** Nicht richtig beantwortete oder übersprungene
  Fragen kommen nach drei anderen Fragen nochmals, höchstens zweimal.
- Für Lernstand, Auswahl und Rundenergebnis zählt **nur der erste
  Versuch**. Wiederholungen sind reines Üben.
- **Alle Fragen:** Das Listen-Symbol oben rechts (ersetzt „Nachschlagen“)
  zeigt alle Fragen, wählbar nach Themengebiet, mit optionaler Suche.
  Antippen öffnet die Musterlösung. Während einer Runde ist die Liste gesperrt.

**Hinweis:** Die Quellordner (`src/`, `js/`, `css/`, `data-src/`, `tools/`,
`tests/`) sind nicht mehr vorhanden. Änderungen werden deshalb direkt in
`index.html` gemacht. Die Abschnitte zu `npm run build` unten gelten nicht mehr.

Die App-Symbole liegen in `icons/`, die Vorlage ist `icons/icon.svg`.

---

## Veröffentlichen über GitHub Pages

1. Neues Repository anlegen und den Inhalt dieses Ordners hineinlegen.
2. Im Repository unter **Settings → Pages** als Quelle **GitHub Actions** wählen.
3. Auf `main` schieben. Der mitgelieferte Ablauf unter
   `.github/workflows/pages.yml` baut die Fragendatei, prüft den Datenbestand,
   lässt die Tests laufen und veröffentlicht.

Wer lieber ohne Actions arbeitet, wählt unter **Settings → Pages** als Quelle
den Branch `main` und den Ordner `/ (root)`. Die Datei `.nojekyll` verhindert,
dass GitHub die Dateien durch Jekyll schickt. Alle Pfade sind relativ, die
Anwendung läuft deshalb auch in einem Unterordner wie
`benutzername.github.io/sss-trainer/`.

Wichtig: `index.html` und `data/fragen.json` sind eingecheckt, weil sie erzeugt
werden. Wer eine Quelldatei ändert, lässt `npm run build` laufen und schiebt
die erzeugten Dateien mit.

### Örtlich ausprobieren

Die `index.html` **doppelklicken**. Sie ist eine in sich geschlossene Datei:
Stylesheet, Programm und alle 147 Fragen stecken darin. Es wird nichts
nachgeladen, es braucht keinen Server.

Einzige Einschränkung dabei: über `file://` behandeln Browser den Ursprung als
undurchsichtig und sperren den dauerhaften Speicher. Die Anwendung läuft, der
Lernstand ist aber nur bis zum Schliessen des Reiters vorhanden. Unter
Einstellungen steht ein entsprechender Hinweis. Wer den Lernstand behalten
will, legt die Datei auf GitHub Pages oder startet örtlich einen Server:

```bash
python3 -m http.server 8080     # oder: npm start
```

---

## Aufbau

```
index.html                 ERZEUGT: fertige Anwendung in einer Datei
src/index.html             Gerüst mit sieben Ansichten
manifest.webmanifest       Angaben für die Installation als App
sw.js                      Offlinebetrieb
css/styles.css             Vorgegebenes Stylesheet plus Ergänzungsblock am Ende
js/config.js               Schwellen, Modi, Konstanten
js/bewertung.js            Bewertung freier Antworten, ohne DOM-Zugriff
js/speicher.js             Lernstand, Auswahl, Aus- und Einlesen
js/app.js                  Ablauf und Oberfläche
data-src/*.json            Neun Quelldateien, eine je Themengebiet
data/fragen.json           Gebaute Gesamtdatei, wird von der App geladen
tools/build.mjs            Führt die Quelldateien zu data/fragen.json zusammen
tools/bundle.mjs           Bündelt alles zur ausgelieferten index.html
tools/validate.mjs         Prüft den Datenbestand
tools/icons.py             Erzeugt die Anwendungssymbole neu
tests/                     Tests für Bewertung, Oberfläche und Durchlauf
```

Unter `tools/` liegen ausserdem drei Einmalskripte, mit denen der Bestand
einmalig bereinigt wurde: `dubletten-abgleich.mjs` gleicht die Konzeptmengen
innerhalb einer Dublettengruppe an, `labels-zusammenfuehren.mjs` führt
inhaltsgleiche Konzepte mit unterschiedlicher Bezeichnung zusammen,
`treffer-nachtragen.mjs` ergänzt fehlende Wortformen. Sie sind wiederholbar und
für den laufenden Betrieb nicht nötig, aber nützlich, wenn wieder Dubletten
hinzukommen.

### Befehle

```bash
node tools/build.mjs        # data-src/ -> data/fragen.json
node tools/bundle.mjs       # src + css + js + data -> index.html
node tools/validate.mjs     # Datenbestand prüfen
npm install --no-save jsdom # nur für den Durchlauftest nötig
node --test "tests/*.test.mjs"
npm run pruefen             # alles nacheinander
```

**Die `index.html` im Wurzelverzeichnis wird erzeugt.** Wer etwas ändert,
bearbeitet `src/index.html`, `css/styles.css`, `js/*.js` oder `data-src/*.json`
und lässt anschliessend `npm run build` laufen.

### Warum eine einzige Datei

Ein `<script type="module" src="…">` wird von jedem Browser blockiert, sobald
die Seite über `file://` geöffnet wird; für Module gilt die
Ursprungsbeschränkung auch bei lokalen Dateien. Beim Öffnen aus einem ZIP
heraus entpacken die Betriebssysteme ausserdem oft nur die angeklickte Datei in
einen Zwischenordner, sodass `css/` und `js/` gar nicht danebenliegen. Beides
führt zu einer Seite ohne Gestaltung, deren Knöpfe nichts tun. Die Bündelung
schliesst beide Fälle aus. Der Quelltext bleibt trotzdem in Modulen aufgeteilt.

---

## Datenmodell

Jede Frage in `data-src/<gebiet>.json`:

```json
{
  "id": "wetter-06",
  "unterthema": "abwettern",
  "quellnummer": "Frage 6",
  "frage": "Welche Funktion hat ein Treibanker …",
  "punkte": 3,
  "mindestanzahl": 3,
  "dublettenGruppe": "treibanker-funktion",
  "leitfrage": true,
  "anmerkung": "…",
  "musterloesung": {
    "typ": "liste | fliesstext | gemischt",
    "einleitung": "…",
    "bloecke": [{ "titel": "…", "punkte": ["…"] }, { "text": "…" }]
  },
  "konzepte": [
    {
      "id": "k1",
      "label": "Verringert die Driftgeschwindigkeit",
      "pflicht": true,
      "verneinend": false,
      "treffer": ["driftgeschwindigkeit", "abdrift verringern", "bremst"]
    }
  ]
}
```

- **`musterloesung`** ist die wörtliche Vorlage aus dem PDF, einschliesslich
  „ß“. Sie wird nur angezeigt, nie bewertet.
- **`konzepte`** sind die Sinneinheiten, die die Bewertung sucht. `treffer`
  enthält Formulierungen, die dasselbe ausdrücken; Gross- und Kleinschreibung
  spielt keine Rolle.
- **`pflicht`** markiert einen Kernpunkt. Fehlt er, wird die Quote gedeckelt.
- **`verneinend`** markiert Konzepte, die selbst eine Verneinung enthalten
  („Motorenraum nicht öffnen“). Ein davorstehendes „nicht“ entwertet den
  Treffer dann nicht. Der Build setzt diese Markierung selbständig.
- **`soll`** wird beim Bauen errechnet: die Zahl der Konzepte, die die eigene
  Musterlösung abdeckt. Ohne diese Korrektur wären Dubletten mit kürzerer
  Musterlösung nicht lösbar.

### Fragen ergänzen oder ändern

1. Die passende Datei unter `data-src/` öffnen, Frage nach obigem Muster
   ergänzen. Die `id` muss im ganzen Bestand einmalig sein.
2. In `tools/validate.mjs` die erwartete Fragenzahl des Themengebiets anpassen.
3. `npm run pruefen`

Der letzte Test prüft, ob jede Musterlösung ihre eigene Bewertung besteht. Er
ist der schnellste Weg, eine zu enge Trefferliste zu finden.

---

## Bewertung

Die Antwort wird vereinheitlicht: Kleinschreibung, „ß“ zu „ss“, Umlautfaltung,
Satzzeichen zu Leerzeichen. Satzschlusszeichen bleiben als Grenzmarke erhalten,
damit eine Verneinung nicht in den nächsten Satz hineinwirkt.

Ein Suchwort ab sechs Zeichen greift auch in Zusammensetzungen („lenzpump“
findet „Handlenzpumpe“), ab fünf Zeichen am Wortanfang, darunter nur genau.
Bei Wortfolgen dürfen bis zu zwei beliebige Wörter dazwischenstehen.

Quote = getroffene Konzepte / Soll, gedeckelt bei 0,6 falls ein Kernpunkt
fehlt, minus 0,10 je genutztem Hinweis.

| Strenge | richtig ab | teilweise ab |
| ------- | ---------- | ------------ |
| mild    | 0,55       | 0,30         |
| normal  | 0,70       | 0,40         |
| streng  | 0,85       | 0,55         |

Die Automatik erkennt Begriffe, keine Argumente. Bei Seemannschaft zählt aber
die Begründung. Deshalb folgt nach jeder Frage eine dreistufige
Selbstbewertung, und **sie** bestimmt den Lernstand.

### Lernstand und Auswahl (rundenbasiert)

Die frühere Wiedervorlage nach Tagen (Stufen 0–4) ist ersetzt. Je Frage
speichert die App, wie oft und in welcher Runde sie zuletzt gestellt wurde,
und die Selbstbewertung der letzten fünf **ersten** Versuche: richtig 1,
teilweise 0,5, nicht gewusst und übersprungen 0. Ein Lernstand der früheren
Fassung wird übernommen: das letzte Ergebnis wird erster Eintrag.

Auswahl: Noch nie gestellte Fragen kommen zuerst. Danach gilt Priorität =
Runden seit dem letzten Stellen × Gewicht. Das Gewicht reicht von 1
(zuletzt immer richtig) bis 4 (immer falsch), markierte Fragen +1. Keine
Frage setzt länger als 3 × (Bestand ÷ Plätze, aufgerundet) Runden aus. In
einer Simulation über 150 Prüfungsmix-Runden kamen schwache Fragen etwa
dreimal so oft wie sichere, und alle 147 Fragen wurden gestellt.

Die Fortschrittsansicht zeigt je Frage die Quote der letzten fünf ersten
Versuche (grün sicher ab 80 %, gelb ab 40 %, rot darunter, grau neu).

---

## Übungsarten

| Art          | Umfang                                                          |
| ------------ | --------------------------------------------------------------- |
| Themengebiet | alle Fragen eines Gebiets (wahlweise ein Unterthema), Reihenfolge nach Priorität |
| Prüfungsmix  | 10 Fragen, je Gebiet die mit der höchsten Priorität, die zehnte aus dem schwächsten Gebiet |
| Wiederholung | die 20 schwächsten (unter 80 %) oder überfälligen Fragen       |
| Markierte    | selbst vorgemerkte Fragen                                       |

Im Prüfungsmix kommt höchstens eine Frage je Dublettengruppe vor.

---

## Zur Datengrundlage

Quelle sind die Fragensammlungen 8.1 sowie 8.3 bis 8.10. **8.2 fehlt im
Materialsatz**, daher neun statt zehn Themengebiete.

| Themengebiet             | Fragen |
| ------------------------ | ------ |
| Das Segelfahrzeug        | 8      |
| Sicherheitsausrüstung    | 17     |
| Seetüchtigkeit           | 7      |
| Verhalten in Notfällen   | 20     |
| SAR, Alarmierung, Bergung | 16    |
| Schweres Wetter          | 27     |
| Grossschifffahrt         | 13     |
| Ankern, Segelpraxis, MOB | 27     |
| Erste Hilfe an Bord      | 12     |

23 Fragen kommen in mehreren Sammlungen doppelt vor. Sie bleiben einzeln
erhalten, sind aber über `dublettenGruppe` verbunden. Die Konzepte einer Gruppe
sind die Vereinigungsmenge aller Varianten, damit dieselbe Antwort unabhängig
von der gezogenen Variante gleich bewertet wird. Die Musterlösung bleibt je
Frage die eigene wörtliche Vorlage.

Einzelne Fragen tragen eine `anmerkung`, wenn die Vorlage in sich uneinheitlich
ist. Beispiel: die Wiederbelebungsfrage folgt der älteren ABC-Systematik,
während aktuelle Leitlinien mit der Herzdruckmassage beginnen. Für die Prüfung
gilt die abgedruckte Musterlösung.

---

## Datenschutz

Kein Server, keine Zählpixel, keine Übertragung. Der Lernstand liegt allein im
`localStorage` dieses Browsers und lässt sich unter Einstellungen als Datei
ausgeben und auf einem anderen Gerät wieder einlesen. Beim Öffnen über `file://`
verweigern Browser den dauerhaften Speicher; die Anwendung weicht dann auf einen
flüchtigen Ersatz aus und weist unter Einstellungen darauf hin.
