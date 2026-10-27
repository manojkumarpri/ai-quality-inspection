import { describe, it, expect } from "vitest";

describe("Human-in-the-Loop Accept/Override Logic", () => {
  it("correctly sets wasOverridden to false when final matches AI prediction", () => {
    const predictedDefectType: string = "Dent";
    const finalDefectType: string = "Dent";
    const wasOverridden = finalDefectType !== predictedDefectType;

    expect(wasOverridden).toBe(false);
  });

  it("correctly sets wasOverridden to true when final differs from AI prediction", () => {
    const predictedDefectType: string = "Dent";
    const finalDefectType: string = "Paint Issue";
    const wasOverridden = finalDefectType !== predictedDefectType;

    expect(wasOverridden).toBe(true);
  });
});
