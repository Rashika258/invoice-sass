export interface RecentItem {
  id: string;
  title: string;
  subtitle: string;
  category: "INVOICE" | "CUSTOMER" | "ITEM" | "REPORT" | "PAGE";
  href: string;
  timestamp: string;
}

const RECENT_ITEMS_KEY = "billora_recent_actions";

export function recordRecentItem(
  title: string,
  subtitle: string,
  category: RecentItem["category"],
  href: string
): void {
  if (typeof window === "undefined") return;

  try {
    const existingStr = localStorage.getItem(RECENT_ITEMS_KEY);
    const existing: RecentItem[] = existingStr ? JSON.parse(existingStr) : [];
    
    // Deduplicate by href
    const filtered = existing.filter((item) => item.href !== href);
    const newItem: RecentItem = {
      id: `rec_${Date.now()}`,
      title,
      subtitle,
      category,
      href,
      timestamp: new Date().toISOString(),
    };

    const updated = [newItem, ...filtered].slice(0, 10); // Keep top 10 recent
    localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(updated));
  } catch {
    // LocalStorage quota or restricted
  }
}

export function getRecentItems(): RecentItem[] {
  if (typeof window === "undefined") return [];

  try {
    const existingStr = localStorage.getItem(RECENT_ITEMS_KEY);
    if (!existingStr) return getFallbackRecentItems();
    const parsed: RecentItem[] = JSON.parse(existingStr);
    return parsed.length > 0 ? parsed : getFallbackRecentItems();
  } catch {
    return getFallbackRecentItems();
  }
}

function getFallbackRecentItems(): RecentItem[] {
  return [
    {
      id: "rec_default_1",
      title: "New GST Sale Invoice",
      subtitle: "Zero-navigation billing loop",
      category: "INVOICE",
      href: "/invoices/new",
      timestamp: new Date().toISOString(),
    },
    {
      id: "rec_default_2",
      title: "Customer Directory & Dues",
      subtitle: "Parties list & ledgers",
      category: "CUSTOMER",
      href: "/customers",
      timestamp: new Date().toISOString(),
    },
    {
      id: "rec_default_3",
      title: "Inventory & Stock Transfer",
      subtitle: "Godown warehouse management",
      category: "ITEM",
      href: "/items",
      timestamp: new Date().toISOString(),
    },
  ];
}
