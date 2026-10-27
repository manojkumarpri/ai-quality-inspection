import { DefectType } from "../taxonomy";

export interface PredictionResult {
  defectType: DefectType;
  confidence: number | null;
  provider: string;
  model: string;
}

export interface AIProvider {
  classifyImage(imagePath: string, mimeType: string): Promise<PredictionResult>;
}
