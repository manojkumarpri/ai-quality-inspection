import { apiFetch } from './client';
import { DashboardKPIs } from '../types/api';

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  return apiFetch<DashboardKPIs>('/dashboard');
}