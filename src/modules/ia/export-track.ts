import fs from "fs";
import path from "path";

export function exportTrackAnalysis(filePath: string, bpm: number, key: string) {
  const result = { file: filePath, bpm, key };
  const dir = path.resolve("exports");
  fs.mkdirSync(dir, { recursive: true });
  const output = path.join(dir, `${Date.now()}_analysis.json`);
  fs.writeFileSync(output, JSON.stringify(result, null, 2));
  return output;
}
