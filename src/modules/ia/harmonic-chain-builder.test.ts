import { describe, it, expect } from "vitest";
import { buildHarmonicChain } from "./harmonic-chain-builder";
import { Track } from "./types";

describe("buildHarmonicChain", () => {
  it("should create a chain with harmonically compatible tracks", () => {
    const tracks: Track[] = [
      { id: "1", title: "A", bpm: 128, key: "C#m" },
      { id: "2", title: "B", bpm: 129, key: "C#m" },
      { id: "3", title: "C", bpm: 140, key: "G" },
    ];

    const chain = buildHarmonicChain(tracks);
    expect(chain.length).toBeGreaterThan(1);
    expect(chain[0].key).toBe("C#m");
    expect(chain[1].key).toBe("C#m");
  });
});
