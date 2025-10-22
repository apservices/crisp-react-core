import fs from "fs";
import path from "path";
import { suggestCompatibleTracks, Track } from "./suggest-compatible";

const dir = process.argv[2] || "exports";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

const tracks: Track[] = files.map(f => {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  return {
    title: path.basename(f),
    bpm: data.bpm,
    key: data.key
  };
});

const compatibles = suggestCompatibleTracks(tracks);

console.log("🎯 Melhor opção compatível:");
if (compatibles.length === 0) {
  console.log("Nenhuma faixa compatível encontrada.");
} else {
  const best = compatibles[0]; // Mais próxima na lista
  console.log(`🎵 ${best.title} (${best.bpm} BPM, ${best.key})`);
}
