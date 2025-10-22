import fs from 'fs';
import path from 'path';
import wavDecoder from 'wav-decoder';
import MusicTempo from 'music-tempo';

export async function analyzeBpmFromWav(filePath: string): Promise<number> {
  const buffer = fs.readFileSync(path.resolve(filePath));
  const decoded = await wavDecoder.decode(buffer);
  const samples = decoded.channelData[0];
  const instance = new MusicTempo(samples);
  return parseFloat(instance.tempo as any);
}
