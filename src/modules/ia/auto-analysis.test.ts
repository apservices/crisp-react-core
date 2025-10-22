import { describe, it, expect } from "vitest";
import { analyzeTrack } from "./auto-analysis";

describe("analyzeTrack", () => {
  it("should return BPM and key from a mock audio buffer", () => {
    const mockAudioBuffer = {} as AudioBuffer;
    const result = analyzeTrack(mockAudioBuffer);
    expect(result.bpm).toBe(128);
    expect(result.key).toBe("C#m");
  });
});
