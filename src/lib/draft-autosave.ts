import { useEffect, useState } from "react";

export interface DraftState<T> {
  data: T;
  savedAt: string;
}

const DRAFT_PREFIX = "billora_draft_";

export function saveFormDraft<T>(formKey: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const draft: DraftState<T> = {
      data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${DRAFT_PREFIX}${formKey}`, JSON.stringify(draft));
  } catch {
    // LocalStorage quota or unavailable
  }
}

export function loadFormDraft<T>(formKey: string): DraftState<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const str = localStorage.getItem(`${DRAFT_PREFIX}${formKey}`);
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

export function clearFormDraft(formKey: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${formKey}`);
  } catch {
    // Ignore
  }
}

export function useDraftAutosave<T>(formKey: string, formData: T, enabled = true) {
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState<boolean>(false);

  // Check if existing draft exists on mount
  useEffect(() => {
    const existing = loadFormDraft<T>(formKey);
    if (existing) {
      setHasDraft(true);
      setLastSaved(existing.savedAt);
    }
  }, [formKey]);

  // Debounced auto-save every 3 seconds when data changes
  useEffect(() => {
    if (!enabled || !formData) return;

    const timer = setTimeout(() => {
      saveFormDraft(formKey, formData);
      const now = new Date().toISOString();
      setLastSaved(now);
      setHasDraft(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formKey, formData, enabled]);

  return {
    lastSaved,
    hasDraft,
    restoreDraft: () => loadFormDraft<T>(formKey)?.data ?? null,
    discardDraft: () => {
      clearFormDraft(formKey);
      setHasDraft(false);
      setLastSaved(null);
    },
  };
}
