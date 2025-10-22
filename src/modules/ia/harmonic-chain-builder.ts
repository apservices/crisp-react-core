import { Track } from "./types";
import { isHarmonicallyCompatible } from "./harmonic-matcher";

export function buildHarmonicChain(tracks: Track[]): Track[] {
  const chain: Track[] = [];
  const remaining = [...tracks];

  if (remaining.length === 0) return [];

  chain.push(remaining.shift()!);

  while (remaining.length > 0) {
    const last = chain[chain.length - 1];
    const nextIndex = remaining.findIndex((track) =>
      isHarmonicallyCompatible(last, track)
    );

    if (nextIndex === -1) break;

    chain.push(remaining.splice(nextIndex, 1)[0]);
  }

  return chain;
}
