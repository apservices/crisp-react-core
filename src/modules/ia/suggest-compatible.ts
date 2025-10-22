export interface Track {
  bpm: number;
  key: string;
  title?: string;
}

export function suggestCompatibleTracks(tracks: Track[]): Track[] {
  if (!tracks.length) return [];
  const [base, ...rest] = tracks;
  return rest.filter(t =>
    Math.abs(t.bpm - base.bpm) <= 6 && t.key === base.key
  );
}
