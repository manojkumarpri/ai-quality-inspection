export const DEFECT_TYPES = [
  'Scratch',
  'Dent',
  'Paint Issue',
  'Missing Component',
  'No Defect',
] as const;

export type DefectType = (typeof DEFECT_TYPES)[number];