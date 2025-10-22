import { describe, it, expect } from "vitest";
import { getAudioInsights } from "./audio-insights";

describe("getAudioInsights", () => {
  it("should return insights from a mock AudioBuffer", () => {
    const mockData = new Float32Array([0.1, -0.5, 0.3, 0.7]);
    const mockBuffer = {
      getChannelData: () => mockData,
      duration: 2.5,
    } as unknown as AudioBuffer;

    const result = getAudioInsights(mockBuffer);
    expect(result.duration).toBe(2.5);
    expect(result.peak).toBe(0.7);
    expect(result.averageEnergy).toBeGreaterThan(0.1);
  });
});
