export interface Track {
  bpm: number;
  key: string;
}

export function isHarmonicallyCompatible(trackA: Track, trackB: Track): boolean {
  const bpmDiff = Math.abs(trackA.bpm - trackB.bpm);
  const compatibleKeys = [trackA.key, "C#m"]; // lógica fictícia

  return bpmDiff <= 6 && compatibleKeys.includes(trackB.key);
}
