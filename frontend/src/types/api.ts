export type Role = 'QUALITY_ENGINEER' | 'PRODUCTION_SUPERVISOR';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Batch {
  id: string;
  batchCode: string;
  productName: string;
  productionLine: string;
  createdAt: string;
}

export interface PredictionResult {
  predictionId: string;
  batchId: string;
  imageRef: string;
  imageUrl: string;
  predictedDefectType: string;
  confidence: number | null;
}

export interface InspectionRecord {
  id: string;
  batchId: string;
  batchCode: string;
  productName: string;
  imageUrl: string;
  aiPredictedDefectType: string;
  aiConfidence: number | null;
  finalDefectType: string;
  wasOverridden: boolean;
  comments?: string;
  inspector: string;
  inspectedAt: string;
}

export interface DashboardKPIs {
  totalInspected: number;
  passed: number;
  rejected: number;
  defectRate: number;
  aiAcceptanceRate: number;
  defectBreakdown: { defectType: string; count: number }[];
}