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

const result = suggestCompatibleTracks(tracks);
console.log("🔁 Compatíveis:");
result.forEach(t => console.log(`- ${t.title} (${t.bpm} BPM, ${t.key})`));
