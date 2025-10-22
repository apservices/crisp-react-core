import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { suggestCompatibleTracks, Track } from "./suggest-compatible";

const dir = "exports";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

const tracks: Track[] = files.map(f => {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  return {
    title: path.basename(f),
    bpm: data.bpm,
    key: data.key
  };
});

if (!tracks.length) {
  console.log("Nenhuma faixa encontrada.");
  process.exit(1);
}

(async () => {
  const { selectedTitle, filterKey, sortBpm } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedTitle",
      message: "🎧 Escolha a faixa base:",
      choices: tracks.map(t => t.title)
    },
    {
      type: "confirm",
      name: "filterKey",
      message: "🎼 Deseja filtrar por tonalidade exata?",
      default: true
    },
    {
      type: "confirm",
      name: "sortBpm",
      message: "📊 Deseja ordenar por BPM mais próximo?",
      default: true
    }
  ]);

  const base = tracks.find(t => t.title === selectedTitle)!;
  let compatibles = suggestCompatibleTracks([base, ...tracks.filter(t => t !== base)]);

  if (filterKey) {
    compatibles = compatibles.filter(t => t.key === base.key);
  }

  if (sortBpm) {
    compatibles = compatibles.sort((a, b) =>
      Math.abs(a.bpm - base.bpm) - Math.abs(b.bpm - base.bpm)
    );
  }

  console.log("\\n🎯 Faixas compatíveis com", base.title);
  if (!compatibles.length) {
    console.log("Nenhuma faixa compatível encontrada.");
  } else {
    compatibles.forEach((t, i) =>
      console.log(`${i + 1}. ${t.title}  [${t.bpm} BPM | ${t.key}]`)
    );
  }
})();
