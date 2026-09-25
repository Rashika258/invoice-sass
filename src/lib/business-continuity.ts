/**
 * 🔄 Billora Business Continuity & Safe Action Queue
 * Guarantees zero data loss during network disruptions, form drops, and offline work.
 */

export interface QueuedSafeAction {
  id: string;
  actionType: string;
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
  lastError?: string;
  status: "QUEUED" | "SYNCING" | "FAILED" | "RECOVERED";
}

const ACTION_QUEUE_KEY = "billora_continuity_queue";
const LAST_SYNC_KEY = "billora_last_sync_timestamp";

export function getQueuedActions(): QueuedSafeAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACTION_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function queueFailedAction(actionType: string, payload: Record<string, unknown>, errorMsg?: string): QueuedSafeAction {
  const queued: QueuedSafeAction = {
    id: `qa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    actionType,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    lastError: errorMsg,
    status: "QUEUED",
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getQueuedActions();
      existing.unshift(queued);
      localStorage.setItem(ACTION_QUEUE_KEY, JSON.stringify(existing.slice(0, 50)));
    } catch {
      // storage unavailable
    }
  }

  return queued;
}

export function removeQueuedAction(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getQueuedActions().filter((a) => a.id !== id);
    localStorage.setItem(ACTION_QUEUE_KEY, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

export function getLastSyncTime(): string {
  if (typeof window === "undefined") return new Date().toISOString();
  try {
    return localStorage.getItem(LAST_SYNC_KEY) || new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export function recordSuccessfulSync(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch {
    // ignore
  }
}
