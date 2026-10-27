import { apiFetch } from './client';
import { Batch } from '../types/api';

export async function getBatches(): Promise<Batch[]> {
  return apiFetch<Batch[]>('/batches');
}