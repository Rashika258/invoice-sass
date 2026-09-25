export interface SavedViewPreset {
  id: string;
  name: string;
  module: "INVOICE" | "ITEM" | "CUSTOMER" | "EXPENSE";
  filters: Record<string, any>;
  isDefault?: boolean;
}

const SAVED_VIEWS_KEY = "billora_saved_views_presets";

export function getSavedViews(module: SavedViewPreset["module"]): SavedViewPreset[] {
  const defaults = getDefaultPresets(module);
  if (typeof window === "undefined") return defaults;

  try {
    const str = localStorage.getItem(SAVED_VIEWS_KEY);
    if (!str) return defaults;
    const all: SavedViewPreset[] = JSON.parse(str);
    const custom = all.filter((v) => v.module === module);
    return [...defaults, ...custom];
  } catch {
    return defaults;
  }
}

export function saveViewPreset(name: string, module: SavedViewPreset["module"], filters: Record<string, any>): SavedViewPreset {
  const newPreset: SavedViewPreset = {
    id: `preset_${Date.now()}`,
    name,
    module,
    filters,
  };

  if (typeof window !== "undefined") {
    try {
      const str = localStorage.getItem(SAVED_VIEWS_KEY);
      const existing: SavedViewPreset[] = str ? JSON.parse(str) : [];
      const updated = [newPreset, ...existing];
      localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }

  return newPreset;
}

function getDefaultPresets(module: SavedViewPreset["module"]): SavedViewPreset[] {
  switch (module) {
    case "INVOICE":
      return [
        { id: "inv_all", name: "All Sales Invoices", module: "INVOICE", filters: {}, isDefault: true },
        { id: "inv_unpaid", name: "Today's Unpaid Invoices", module: "INVOICE", filters: { status: "UNPAID" } },
        { id: "inv_overdue", name: "Overdue Dues > 30 Days", module: "INVOICE", filters: { status: "OVERDUE" } },
      ];
    case "ITEM":
      return [
        { id: "item_all", name: "All Inventory Products", module: "ITEM", filters: {}, isDefault: true },
        { id: "item_low", name: "Low-Stock Reorder Buffer", module: "ITEM", filters: { lowStock: true } },
      ];
    case "CUSTOMER":
      return [
        { id: "cust_all", name: "All Customers & Parties", module: "CUSTOMER", filters: {}, isDefault: true },
        { id: "cust_outstanding", name: "High Outstanding Balances", module: "CUSTOMER", filters: { hasBalance: true } },
      ];
    case "EXPENSE":
      return [
        { id: "exp_all", name: "All Business Expenses", module: "EXPENSE", filters: {}, isDefault: true },
      ];
    default:
      return [];
  }
}
