/* ==========================================================================
   Prüft die Bewertung direkt an der ausgelieferten index.html.
   Aufruf: node tools/pruefen.mjs [pfad/zu/index.html]

   1. Jede Musterlösung muss ihre eigene Frage als „richtig“ bestehen.
   2. Gegenprobe: die Musterlösung einer fremden Frage darf möglichst nicht
      als richtig oder teilweise gelten (Anteil wird ausgegeben).
   3. Testfälle aus tests/faelle.json müssen das erwartete Urteil bekommen.
   ========================================================================== */
import fs from "node:fs";
import path from "node:path";

const wurzel = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const datei = process.argv[2] || path.join(wurzel, "index.html");
const html = fs.readFileSync(datei, "utf8");

const daten = JSON.parse(
  html.match(/<script id="fragen-daten" type="application\/json">([\s\S]*?)<\/script>/)[1]
);
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const von = js.indexOf("const STRENGEN");
const bis = js.indexOf("/** Wählt das nächste");
const B = new Function(
  js.slice(von, bis) +
    "; return { bewerten, suchbegriff: typeof suchbegriff === \"function\" ? suchbegriff : (t) => ({ woerter: [t] }) };"
)();

const musterText = (f) =>
  [
    f.musterloesung.einleitung || "",
    ...f.musterloesung.bloecke.flatMap((b) => [b.titel || "", b.text || "", ...(b.punkte || [])]),
  ].join(". ");

let fehler = 0;

// 0. Leere Suchbegriffe (nur Füllwörter)
for (const f of daten.fragen) {
  for (const k of f.konzepte) {
    for (const t of k.treffer) {
      if (B.suchbegriff(t).woerter.length === 0) {
        console.log(`LEER       ${f.id}/${k.id}: „${t}“ besteht nur aus Füllwörtern`);
        fehler++;
      }
    }
  }
}

// 1. Musterlösungen
let bestanden = 0;
for (const f of daten.fragen) {
  const r = B.bewerten(f, musterText(f));
  if (r.urteil === "richtig") bestanden++;
  else {
    fehler++;
    const offen = r.konzepte.filter((k) => !k.getroffen).map((k) => k.label);
    console.log(`MUSTER     ${f.id}: ${r.urteil} ${r.getroffen}/${r.soll}, fehlt: ${offen.join("; ")}`);
  }
}
console.log(`Musterlösungen bestehen: ${bestanden}/${daten.fragen.length}`);

// 2. Gegenprobe
let paare = 0;
let durch = 0;
for (const f of daten.fragen) {
  for (const o of daten.fragen) {
    if (o === f || (f.dublettenGruppe && f.dublettenGruppe === o.dublettenGruppe)) continue;
    paare++;
    if (B.bewerten(f, musterText(o)).urteil !== "falsch") durch++;
  }
}
const anteil = (100 * durch) / paare;
console.log(`Gegenprobe, fremde Musterlösung nicht „falsch“: ${durch}/${paare} (${anteil.toFixed(2)} %)`);
if (anteil > 2) {
  console.log("GEGENPROBE Anteil über 2 %: Suchbegriffe sind zu allgemein.");
  fehler++;
}

// 3. Testfälle
const faellePfad = path.join(wurzel, "tests", "faelle.json");
if (fs.existsSync(faellePfad)) {
  const faelle = JSON.parse(fs.readFileSync(faellePfad, "utf8"));
  let ok = 0;
  for (const fall of faelle) {
    const f = daten.fragen.find((x) => x.id === fall.id);
    if (!f) {
      console.log(`FALL       unbekannte Frage ${fall.id}`);
      fehler++;
      continue;
    }
    const r = B.bewerten(f, fall.antwort, { strenge: fall.strenge || "normal" });
    const ist = r.konzepte.filter((k) => k.getroffen).map((k) => k.id);
    const urteilOk = !fall.erwartet || r.urteil === fall.erwartet;
    const konzepteOk = !fall.konzepte || JSON.stringify([...fall.konzepte].sort()) === JSON.stringify([...ist].sort());
    if (urteilOk && konzepteOk) ok++;
    else {
      fehler++;
      console.log(
        `FALL       ${fall.id} (${fall.notiz || ""}): erwartet ${fall.erwartet || "-"} [${(fall.konzepte || []).join(",")}], ` +
          `ist ${r.urteil} [${ist.join(",")}]`
      );
    }
  }
  console.log(`Testfälle: ${ok}/${faelle.length}`);
}

console.log(fehler ? `\n${fehler} Problem(e).` : "\nAlles in Ordnung.");
process.exit(fehler ? 1 : 0);
