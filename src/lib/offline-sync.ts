/**
 * Billora IndexedDB Offline POS Queue & Synchronization Manager
 */

const DB_NAME = "BilloraOfflineDB";
const STORE_NAME = "offline_pos_orders";
const DB_VERSION = 1;

export type OfflinePOSOrder = {
  id: string;
  customerId: string;
  items: {
    itemId: string;
    quantity: number;
    unitPrice: number;
  }[];
  paymentMode: "CASH" | "UPI" | "CARD";
  amountTendered: number;
  createdAt: string;
  synced: boolean;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineOrder(order: Omit<OfflinePOSOrder, "id" | "createdAt" | "synced">): Promise<OfflinePOSOrder> {
  const db = await openDB();
  const fullOrder: OfflinePOSOrder = {
    ...order,
    id: `off_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString(),
    synced: false,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(fullOrder);

    req.onsuccess = () => resolve(fullOrder);
    req.onerror = () => reject(req.error);
  });
}

export async function getQueuedOrders(): Promise<OfflinePOSOrder[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function removeQueuedOrder(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function flushOfflineQueue(
  syncCallback: (order: OfflinePOSOrder) => Promise<boolean>
): Promise<{ syncedCount: number; failedCount: number }> {
  const queue = await getQueuedOrders();
  let syncedCount = 0;
  let failedCount = 0;

  for (const order of queue) {
    try {
      const success = await syncCallback(order);
      if (success) {
        await removeQueuedOrder(order.id);
        syncedCount++;
      } else {
        failedCount++;
      }
    } catch {
      failedCount++;
    }
  }

  return { syncedCount, failedCount };
}
