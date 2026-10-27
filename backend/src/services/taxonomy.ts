export const DEFECT_TYPES = [
  "Scratch",
  "Dent",
  "Paint Issue",
  "Missing Component",
  "No Defect",
] as const;

export type DefectType = (typeof DEFECT_TYPES)[number];

export function isValidDefectType(value: string): value is DefectType {
  return (DEFECT_TYPES as readonly string[]).includes(value);
}
