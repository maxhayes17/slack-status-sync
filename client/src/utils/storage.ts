export const GOOGLE_AUTH_STORAGE_KEY = "slack-status-sync-google-auth";
export const LAST_ACTIVE_TIME_STORAGE_KEY =
  "slack-status-sync-last-active-time";

export function storeItem(key: string, token: string) {
  localStorage.setItem(key, token);
}

export function getItem(key: string) {
  return localStorage.getItem(key);
}
