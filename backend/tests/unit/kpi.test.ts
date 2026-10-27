import { describe, it, expect } from "vitest";

interface InspectionMock {
  finalDefectType: string;
  wasOverridden: boolean;
}

function calculateDashboard(inspections: InspectionMock[]) {
  const totalInspected = inspections.length;
  const passed = inspections.filter(
    (i) => i.finalDefectType === "No Defect",
  ).length;
  const rejected = totalInspected - passed;
  const defectRate =
    totalInspected === 0 ? 0 : (rejected / totalInspected) * 100;
  const accepted = inspections.filter((i) => !i.wasOverridden).length;
  const aiAcceptanceRate =
    totalInspected === 0 ? 0 : (accepted / totalInspected) * 100;

  return { totalInspected, passed, rejected, defectRate, aiAcceptanceRate };
}

describe("Dashboard KPI Calculations", () => {
  it("correctly calculates KPIs for the 10-inspection worked example", () => {
    const mockInspections: InspectionMock[] = [
      ...Array(6).fill({ finalDefectType: "No Defect", wasOverridden: false }),
      { finalDefectType: "Scratch", wasOverridden: false },
      { finalDefectType: "Dent", wasOverridden: false },
      { finalDefectType: "Dent", wasOverridden: true },
      { finalDefectType: "Paint Issue", wasOverridden: true },
    ];

    const kpis = calculateDashboard(mockInspections);

    expect(kpis.totalInspected).toBe(10);
    expect(kpis.passed).toBe(6);
    expect(kpis.rejected).toBe(4);
    expect(kpis.defectRate).toBe(40);
    expect(kpis.aiAcceptanceRate).toBe(80);
  });
});
