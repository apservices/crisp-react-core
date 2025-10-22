import type { Track } from "./harmonic-compatibility";
import { isHarmonicallyCompatible } from "./harmonic-compatibility";

export function suggestTrackSequence(baseTrack: Track, tracks: Track[]): Track[] {
  return tracks
    .filter(track => isHarmonicallyCompatible(baseTrack, track))
    .sort((a, b) => Math.abs(a.bpm - baseTrack.bpm) - Math.abs(b.bpm - baseTrack.bpm));
}
