import { apiFetch } from './client';
import { User } from '../types/api';

export async function getUsers(): Promise<User[]> {
  return apiFetch<User[]>('/auth/users');
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('/auth/me');
}