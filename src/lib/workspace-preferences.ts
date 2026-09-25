// src/lib/workspace-preferences.ts
/**
 * Simple wrapper around localStorage for persisting UI state per user workspace.
 * All values are JSON‑serialised. Prefix is used to avoid collisions.
 */
const PREFIX = 'billora_workspace_';

export function setWorkspacePreferences(key: string, value: any): void {
  try {
    const fullKey = PREFIX + key;
    const data = JSON.stringify(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(fullKey, data);
    }
  } catch (e) {
    console.error('Failed to set workspace preference', key, e);
  }
}

export function getWorkspacePreferences<T = any>(key: string): T | null {
  try {
    const fullKey = PREFIX + key;
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(fullKey);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    console.error('Failed to get workspace preference', key, e);
    return null;
  }
}

export function clearWorkspacePreferences(key: string): void {
  try {
    const fullKey = PREFIX + key;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(fullKey);
    }
  } catch (e) {
    console.error('Failed to clear workspace preference', key, e);
  }
}
