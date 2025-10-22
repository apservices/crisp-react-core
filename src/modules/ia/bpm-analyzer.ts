import fs from "fs";
import { decode } from "wav-decoder";
import MusicTempo from "music-tempo";

export async function analyzeBpmFromWav(filePath: string): Promise<number> {
  const buffer = fs.readFileSync(filePath);
  const audioData = await decode(buffer);

  const channel = audioData.channelData[0];

  if (!channel || channel.length < 1000) {
    throw new Error("Canal de áudio muito curto ou inválido");
  }

  const tempo = new MusicTempo(channel);

  if (!tempo || isNaN(tempo.tempo)) {
    throw new Error("Fail to find peaks");
  }

  return Math.round(tempo.tempo);
}
