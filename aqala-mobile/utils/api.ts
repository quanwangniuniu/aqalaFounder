/**
 * API utility for calling the Next.js backend from mobile
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_WEB_URL || "https://aqala.io";

export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
}
