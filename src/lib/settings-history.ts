export interface CompanySettingsData {
  companyName: string;
  gstin?: string;
  phone?: string;
  email?: string;
  address?: string;
  stateCode?: string;
  defaultTaxRate?: number;
  enableStockDeduction?: boolean;
  currencySymbol?: string;
}

export interface SettingsVersionSnapshot {
  id: string;
  versionNumber: number;
  timestamp: string;
  authorName: string;
  description: string;
  settings: CompanySettingsData;
}

const SETTINGS_HISTORY_STORAGE_KEY = "billora_settings_history_v1";

let inMemoryHistory: SettingsVersionSnapshot[] = [
  {
    id: "ver_1",
    versionNumber: 1,
    timestamp: "2026-09-01T10:00:00.000Z",
    authorName: "System Admin",
    description: "Initial Organization Setup",
    settings: {
      companyName: "Acme Enterprises India Pvt Ltd",
      gstin: "27AABCU9603R1ZM",
      phone: "+91 98765 43210",
      email: "billing@acmeenterprises.in",
      address: "Suite 402, Trade Tower, Lower Parel, Mumbai, MH 400013",
      stateCode: "27",
      defaultTaxRate: 18,
      enableStockDeduction: true,
      currencySymbol: "₹",
    },
  },
];

export function getSettingsHistory(): SettingsVersionSnapshot[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(SETTINGS_HISTORY_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fall back to inMemoryHistory
    }
  }
  return [...inMemoryHistory];
}

export function saveSettingsSnapshot(
  settings: CompanySettingsData,
  description: string,
  authorName: string = "Admin User"
): SettingsVersionSnapshot {
  const history = getSettingsHistory();
  const nextVersion = history.length + 1;
  const newSnapshot: SettingsVersionSnapshot = {
    id: `ver_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    versionNumber: nextVersion,
    timestamp: new Date().toISOString(),
    authorName,
    description,
    settings: { ...settings },
  };

  const updatedHistory = [newSnapshot, ...history];
  inMemoryHistory = updatedHistory;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch {
      // Ignore storage errors
    }
  }

  return newSnapshot;
}

export function rollbackSettings(versionId: string): SettingsVersionSnapshot | null {
  const history = getSettingsHistory();
  const targetSnapshot = history.find((s) => s.id === versionId);

  if (!targetSnapshot) return null;

  // Save a new rollback snapshot reflecting the revert action
  const restoredSnapshot = saveSettingsSnapshot(
    targetSnapshot.settings,
    `Rollback to Version #${targetSnapshot.versionNumber} ("${targetSnapshot.description}")`,
    "System Admin"
  );

  return restoredSnapshot;
}
