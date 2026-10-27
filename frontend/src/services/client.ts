let currentUserId = 'quality-engineer-demo'; // Default persona

export function setCurrentUserId(userId: string) {
  currentUserId = userId;
}

export function getCurrentUserId() {
  return currentUserId;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'x-user-id': currentUserId,
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message || 'An API error occurred.');
  }
  return json.data as T;
}

export async function fetchImageBlob(imagePath: string): Promise<string> {
  const imageKey = imagePath.split('/').pop();
  const response = await fetch(`${BASE_URL}/images/${imageKey}`, {
    headers: { 'x-user-id': currentUserId },
  });
  if (!response.ok) throw new Error('Failed to load image resource');
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}