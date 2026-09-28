export const DEFAULT_APP_NAME = "Billora";
export const DEFAULT_APP_DOMAIN = "billora.in";
export const DEFAULT_APP_URL = "http://localhost:3000";

export const APP_NAME_STORAGE_KEY = "billora_app_name";
export const APP_DOMAIN_STORAGE_KEY = "billora_app_domain";
export const APP_NAME_CHANGE_EVENT = "app:name-change";

/**
 * Gets the configured application name.
 * Server: reads process.env.NEXT_PUBLIC_APP_NAME or fallback.
 * Client: reads localStorage override if set, else process.env.NEXT_PUBLIC_APP_NAME or fallback.
 */
export function getAppName(): string {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(APP_NAME_STORAGE_KEY);
      if (stored && stored.trim()) return stored.trim();
    } catch {}
  }
  return process.env.NEXT_PUBLIC_APP_NAME || DEFAULT_APP_NAME;
}

/**
 * Gets the configured application domain.
 * Server: reads process.env.NEXT_PUBLIC_APP_DOMAIN or fallback.
 * Client: reads localStorage override if set, else process.env.NEXT_PUBLIC_APP_DOMAIN or fallback.
 */
export function getAppDomain(): string {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(APP_DOMAIN_STORAGE_KEY);
      if (stored && stored.trim()) return stored.trim();
    } catch {}
  }
  if (process.env.NEXT_PUBLIC_APP_DOMAIN) {
    return process.env.NEXT_PUBLIC_APP_DOMAIN;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      return new URL(process.env.NEXT_PUBLIC_APP_URL).hostname;
    } catch {}
  }
  return DEFAULT_APP_DOMAIN;
}

/**
 * Gets the full application URL.
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || DEFAULT_APP_URL;
}

/**
 * Returns formatted "Powered by {APP_NAME}" text.
 */
export function getPoweredByText(customAppName?: string): string {
  return `Powered by ${customAppName || getAppName()}`;
}

/**
 * Client-only function to set the app name and dispatch update events.
 */
export function setClientAppName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    if (name && name.trim()) {
      localStorage.setItem(APP_NAME_STORAGE_KEY, name.trim());
    } else {
      localStorage.removeItem(APP_NAME_STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent(APP_NAME_CHANGE_EVENT, { detail: name }));
  } catch {}
}

/**
 * Client-only function to set the app domain.
 */
export function setClientAppDomain(domain: string): void {
  if (typeof window === "undefined") return;
  try {
    if (domain && domain.trim()) {
      localStorage.setItem(APP_DOMAIN_STORAGE_KEY, domain.trim());
    } else {
      localStorage.removeItem(APP_DOMAIN_STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent(APP_NAME_CHANGE_EVENT, { detail: domain }));
  } catch {}
}
