export interface AudioAnalysis {
  bpm: number;
  key: string;
}

export function analyzeBpmAndKey(_: unknown): AudioAnalysis {
  return {
    bpm: 124,
    key: "A#m"
  };
}
