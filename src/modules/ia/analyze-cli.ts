import { analyzeBpmFromWav } from './bpm-detect-real';
import { extractKeyFromWav } from './key-detect-real';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node analyze-cli.ts <file.wav>');
  process.exit(1);
}

async function main() {
  const bpm = await analyzeBpmFromWav(filePath);
  const key = await extractKeyFromWav(filePath);
  console.log('BPM:', bpm);
  console.log('Key:', key);
}

main();
