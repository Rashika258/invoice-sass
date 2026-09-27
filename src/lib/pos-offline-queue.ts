export interface OfflinePosTransaction {
  id: string;
  timestamp: string;
  customerId: string;
  items: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
    gstRate: number;
  }>;
  totalAmount: number;
  paymentMode: string;
  synced: boolean;
}

const OFFLINE_QUEUE_KEY = "billora_pos_offline_queue";

/**
 * Enqueue POS transaction to browser local storage during network outage
 */
export function enqueueOfflinePosTransaction(
  transaction: Omit<OfflinePosTransaction, "id" | "timestamp" | "synced">,
): OfflinePosTransaction {
  const item: OfflinePosTransaction = {
    ...transaction,
    id: `off_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    synced: false,
  };

  try {
    const existing = getOfflinePosQueue();
    existing.push(item);
    if (typeof window !== "undefined") {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(existing));
    }
  } catch {
    console.warn("Failed to store offline transaction in localStorage");
  }

  return item;
}

/**
 * Get all queued offline POS transactions
 */
export function getOfflinePosQueue(): OfflinePosTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear queued offline transactions after successful background sync
 */
export function clearOfflinePosQueue(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  }
}
