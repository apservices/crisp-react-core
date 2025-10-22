import { describe, it, expect } from "vitest";
import { isHarmonicallyCompatible, Track } from "./harmonic-matcher";

describe("isHarmonicallyCompatible", () => {
  it("should return true for compatible BPM and key", () => {
    const a: Track = { title: "A", bpm: 128, key: "C#m" };
    const b: Track = { title: "B", bpm: 126, key: "C#m" };
    expect(isHarmonicallyCompatible(a, b)).toBe(true);
  });

  it("should return false if BPM difference is too large", () => {
    const a: Track = { title: "A", bpm: 128, key: "C#m" };
    const b: Track = { title: "B", bpm: 115, key: "C#m" };
    expect(isHarmonicallyCompatible(a, b)).toBe(false);
  });

  it("should return false if keys are not compatible", () => {
    const a: Track = { title: "A", bpm: 128, key: "C#m" };
    const b: Track = { title: "B", bpm: 127, key: "F" };
    expect(isHarmonicallyCompatible(a, b)).toBe(false);
  });
});
