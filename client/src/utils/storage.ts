export const GOOGLE_AUTH_STORAGE_KEY = "slack-status-sync-google-auth";

export function storeToken(key: string, token: string) {
  localStorage.setItem(key, token);
}

export function getToken(key: string) {
  return localStorage.getItem(key);
}
