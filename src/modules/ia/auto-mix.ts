import { Track } from "./harmonic-compatibility";
import { isHarmonicallyCompatible } from "./harmonic-compatibility";

export function suggestNextTrack(currentTrack: Track, trackList: Track[]): Track | null {
  const compatibleTracks = trackList.filter((track) =>
    isHarmonicallyCompatible(currentTrack, track)
  );

  return compatibleTracks.length > 0 ? compatibleTracks[0] : null;
}
