import { describe, it, expect } from "vitest";
import { DEFECT_TYPES, DefectType } from "../../src/services/taxonomy"; // adjust path to your taxonomy

function isValidDefectType(value: unknown): value is DefectType {
  return (
    typeof value === "string" &&
    (DEFECT_TYPES as readonly string[]).includes(value)
  );
}

describe("Fixed Defect Taxonomy & Validation", () => {
  it("accepts all 5 valid defect categories", () => {
    const validCategories = [
      "Scratch",
      "Dent",
      "Paint Issue",
      "Missing Component",
      "No Defect",
    ];
    validCategories.forEach((cat) => {
      expect(isValidDefectType(cat)).toBe(true);
    });
  });

  it("rejects invalid or unsupported categories (e.g., Rust, Crack, empty string)", () => {
    const invalidCategories = [
      "Rust",
      "Crack",
      "Unknown",
      "",
      null,
      undefined,
      123,
    ];
    invalidCategories.forEach((cat) => {
      expect(isValidDefectType(cat)).toBe(false);
    });
  });

  it("validates confidence boundaries (between 0 and 1, or null)", () => {
    const isValidConfidence = (conf: unknown) =>
      conf === null ||
      (typeof conf === "number" &&
        Number.isFinite(conf) &&
        conf >= 0 &&
        conf <= 1);

    expect(isValidConfidence(0.83)).toBe(true);
    expect(isValidConfidence(0)).toBe(true);
    expect(isValidConfidence(1)).toBe(true);
    expect(isValidConfidence(null)).toBe(true);
    expect(isValidConfidence(-0.1)).toBe(false);
    expect(isValidConfidence(1.1)).toBe(false);
    expect(isValidConfidence(NaN)).toBe(false);
  });
});
