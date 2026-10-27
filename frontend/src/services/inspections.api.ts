import { apiFetch, getCurrentUserId } from './client';
import { PredictionResult, InspectionRecord } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export async function predictDefect(batchId: string, imageFile: File): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append('batchId', batchId);
  formData.append('image', imageFile);

  const response = await fetch(`${BASE_URL}/inspections/predict`, {
    method: 'POST',
    headers: {
      'x-user-id': getCurrentUserId(),
    },
    body: formData,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message || 'Prediction failed');
  }
  return json.data as PredictionResult;
}

export async function submitInspection(payload: {
  batchId: string;
  predictionId: string;
  finalDefectType: string;
  comments?: string;
}): Promise<InspectionRecord> {
  return apiFetch<InspectionRecord>('/inspections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getInspections(filters?: { defectType?: string; batchId?: string }): Promise<InspectionRecord[]> {
  const params = new URLSearchParams();
  if (filters?.defectType) params.append('defectType', filters.defectType);
  if (filters?.batchId) params.append('batchId', filters.batchId);

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<InspectionRecord[]>(`/inspections${query}`);
}
export async function fetchInspectionImage(imagePath: string): Promise<string> {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  const response = await fetch(`${BASE_URL}/images/${imagePath.split('/').pop()}`, {
    headers: { 
      'x-user-id': localStorage.getItem('x-user-id') || 'quality-engineer-demo' 
    },
  });
  if (!response.ok) throw new Error('Failed to load image');
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}