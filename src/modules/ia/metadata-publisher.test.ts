import { describe, it, expect } from "vitest";
import { publishMetadata } from "./metadata-publisher";

describe("publishMetadata", () => {
  it("should return a message for each platform", () => {
    const messages = publishMetadata({
      title: "Sunset Mix",
      artist: "DJ Light",
      bpm: 124,
      key: "Am",
      platforms: ["spotify", "soundcloud"]
    });

    expect(messages).toHaveLength(2);
    expect(messages[0]).toContain("SPOTIFY");
    expect(messages[1]).toMatch(/soundcloud/i);
  });
});
