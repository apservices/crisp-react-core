import { describe, it, expect } from "vitest";
import { parseComments } from "./waveform-comment-parser";

describe("parseComments", () => {
  it("should parse timed comments correctly", () => {
    const input = `
[15.2] - Drop incrível aqui!
[8.5] - Começa o build up
[0.0] - Introdução da faixa
`;

    const result = parseComments(input);
    expect(result).toHaveLength(3);
    expect(result[0].time).toBe(0);
    expect(result[1].text).toMatch(/build/i);
    expect(result[2].time).toBeGreaterThan(8);
  });
});
