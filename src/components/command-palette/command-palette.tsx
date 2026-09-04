"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search, LayoutDashboard, FileText, ShoppingBag, Package, Users,
  Wallet, BarChart3, Settings, Plus, Receipt, ArrowRight,
  CreditCard, Building2, FileSpreadsheet, Zap, BookOpen,
  CalendarDays, Scale, TrendingUp, Moon, Sun, Keyboard,
  Boxes, UserCheck, AlertCircle, Store, Clock, X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

// ─── Command Registry ─────────────────────────────────────────────────────────

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
};

type CommandGroup = {
  heading: string;
  items: CommandItem[];
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setSearch("");
      router.push(href);
    },
    [router]
  );

  // ⌘K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const groups: CommandGroup[] = [
    {
      heading: "Quick Create",
      items: [
        {
          id: "new-invoice",
          label: "New Sale Invoice",
          description: "Create a new GST invoice",
          icon: Plus,
          shortcut: "N I",
          action: () => go("/sales/new"),
          keywords: ["invoice", "sale", "bill", "create", "new"],
        },
        {
          id: "new-purchase",
          label: "New Purchase Bill",
          description: "Record a vendor purchase",
          icon: ShoppingBag,
          shortcut: "N P",
          action: () => go("/purchases/new"),
          keywords: ["purchase", "buy", "bill", "vendor", "new"],
        },
        {
          id: "new-expense",
          label: "Record Expense",
          description: "Log a business expense",
          icon: CreditCard,
          action: () => go("/expenses/new"),
          keywords: ["expense", "spend", "cost", "record"],
        },
        {
          id: "new-payment",
          label: "Record Payment",
          description: "Mark a payment received or made",
          icon: Wallet,
          action: () => go("/money"),
          keywords: ["payment", "receive", "collect", "pay"],
        },
        {
          id: "new-voucher",
          label: "New Journal Voucher",
          description: "Post an accounting entry",
          icon: BookOpen,
          shortcut: "N V",
          action: () => go("/accounting/vouchers"),
          keywords: ["journal", "voucher", "entry", "accounting", "dr", "cr"],
        },
        {
          id: "new-customer",
          label: "Add Customer / Party",
          description: "Create a new customer or vendor",
          icon: Users,
          action: () => go("/parties/new"),
          keywords: ["customer", "party", "vendor", "supplier", "add"],
        },
        {
          id: "new-item",
          label: "Add Product / Item",
          description: "Add a new inventory item",
          icon: Package,
          action: () => go("/items"),
          keywords: ["product", "item", "inventory", "stock", "add"],
        },
      ],
    },
    {
      heading: "Navigate — Sales",
      items: [
        {
          id: "sales",
          label: "Sales Dashboard",
          icon: FileText,
          action: () => go("/sales"),
          keywords: ["sales", "invoices", "revenue"],
        },
        {
          id: "quotations",
          label: "Quotations & Estimates",
          icon: FileText,
          action: () => go("/sales?type=ESTIMATE"),
          keywords: ["quote", "estimate", "quotation"],
        },
        {
          id: "deliveries",
          label: "Delivery Challans",
          icon: Boxes,
          action: () => go("/sales?type=DELIVERY_CHALLAN"),
          keywords: ["delivery", "challan", "dispatch"],
        },
        {
          id: "credit-notes",
          label: "Credit Notes / Returns",
          icon: Receipt,
          action: () => go("/sales?type=CREDIT_NOTE"),
          keywords: ["credit note", "return", "refund"],
        },
      ],
    },
    {
      heading: "Navigate — Accounting",
      items: [
        {
          id: "accounting",
          label: "Accounting Gateway",
          icon: BookOpen,
          action: () => go("/accounting"),
          keywords: ["accounting", "tally", "books"],
        },
        {
          id: "ledgers",
          label: "Ledger Master",
          description: "Chart of accounts",
          icon: BookOpen,
          action: () => go("/accounting/ledgers"),
          keywords: ["ledger", "chart of accounts", "coa"],
        },
        {
          id: "daybook",
          label: "Day Book",
          icon: CalendarDays,
          action: () => go("/accounting/daybook"),
          keywords: ["day book", "daily", "entries"],
        },
        {
          id: "trial-balance",
          label: "Trial Balance",
          icon: Scale,
          action: () => go("/accounting/trial-balance"),
          keywords: ["trial balance", "dr", "cr", "balance"],
        },
        {
          id: "pl",
          label: "Profit & Loss",
          icon: TrendingUp,
          action: () => go("/accounting/profit-loss"),
          keywords: ["profit", "loss", "p&l", "income"],
        },
        {
          id: "balance-sheet",
          label: "Balance Sheet",
          icon: BarChart3,
          action: () => go("/accounting/balance-sheet"),
          keywords: ["balance sheet", "assets", "liabilities"],
        },
      ],
    },
    {
      heading: "Navigate — Core",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          shortcut: "G H",
          action: () => go("/dashboard"),
          keywords: ["home", "dashboard", "overview"],
        },
        {
          id: "purchases",
          label: "Purchases",
          icon: ShoppingBag,
          action: () => go("/purchases"),
          keywords: ["purchases", "buy", "vendor"],
        },
        {
          id: "inventory",
          label: "Inventory / Items",
          icon: Package,
          action: () => go("/items"),
          keywords: ["inventory", "stock", "products", "items"],
        },
        {
          id: "parties",
          label: "Customers & Parties",
          icon: Users,
          action: () => go("/parties"),
          keywords: ["customers", "parties", "vendors", "contacts"],
        },
        {
          id: "money",
          label: "Money — Cash & Bank",
          icon: Wallet,
          action: () => go("/money"),
          keywords: ["money", "cash", "bank", "payments"],
        },
        {
          id: "expenses",
          label: "Expenses",
          icon: CreditCard,
          action: () => go("/expenses"),
          keywords: ["expenses", "costs", "spend"],
        },
        {
          id: "reports",
          label: "Reports",
          icon: BarChart3,
          action: () => go("/reports"),
          keywords: ["reports", "analytics", "gst"],
        },
        {
          id: "employees",
          label: "Employees & Attendance",
          icon: UserCheck,
          action: () => go("/employees"),
          keywords: ["employees", "staff", "attendance", "hr"],
        },
        {
          id: "pos",
          label: "POS — Point of Sale",
          icon: Store,
          action: () => go("/pos"),
          keywords: ["pos", "point of sale", "retail", "cashier"],
        },
        {
          id: "alerts",
          label: "Alerts & Reminders",
          icon: AlertCircle,
          action: () => go("/alerts"),
          keywords: ["alerts", "reminders", "notifications"],
        },
        {
          id: "tally",
          label: "Tally Integration Hub",
          icon: FileSpreadsheet,
          action: () => go("/tally"),
          keywords: ["tally", "import", "export", "erp"],
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          shortcut: "G S",
          action: () => go("/settings"),
          keywords: ["settings", "configuration", "preferences"],
        },
      ],
    },
    {
      heading: "Actions",
      items: [
        {
          id: "toggle-theme",
          label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
          icon: theme === "dark" ? Sun : Moon,
          shortcut: "T T",
          action: () => {
            setTheme(theme === "dark" ? "light" : "dark");
            setOpen(false);
            toast.success(`Switched to ${theme === "dark" ? "light" : "dark"} mode`);
          },
          keywords: ["theme", "dark", "light", "mode", "color"],
        },
        {
          id: "keyboard-shortcuts",
          label: "Keyboard Shortcuts",
          icon: Keyboard,
          action: () => {
            setOpen(false);
            toast.info("F4–F9 = Voucher types · Alt+S = Save · Ctrl+K = Command palette");
          },
          keywords: ["shortcuts", "keyboard", "help"],
        },
      ],
    },
  ];

  // Flatten for empty state
  const allItems = groups.flatMap((g) => g.items);

  return (
    <>
      {/* Trigger button in header */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 h-8 px-3 rounded-xl border border-border bg-muted/50 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer group"
        aria-label="Open command palette"
      >
        <Search className="size-3.5" />
        <span>Search or command...</span>
        <kbd className="ml-2 inline-flex items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground group-hover:text-foreground transition-colors">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl mx-4 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              shouldFilter
              filter={(value, search, keywords) => {
                const haystack = [value, ...(keywords ?? [])].join(" ").toLowerCase();
                return haystack.includes(search.toLowerCase()) ? 1 : 0;
              }}
              className="flex flex-col"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="size-4 text-muted-foreground shrink-0" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search or type a command..."
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="p-0.5 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono hover:bg-muted transition-colors cursor-pointer"
                >
                  ESC
                </button>
              </div>

              {/* Results */}
              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                <Command.Empty className="py-10 text-center text-sm text-muted-foreground space-y-2">
                  <Search className="size-8 mx-auto text-muted-foreground/40" />
                  <p>No results for <strong>"{search}"</strong></p>
                  <p className="text-xs">Try: "new invoice", "trial balance", "dark mode"</p>
                </Command.Empty>

                {groups.map((group) => (
                  <Command.Group
                    key={group.heading}
                    heading={group.heading}
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Command.Item
                          key={item.id}
                          value={item.id}
                          keywords={[item.label, ...(item.keywords ?? [])]}
                          onSelect={() => item.action()}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors
                            data-[selected=true]:bg-brand-light data-[selected=true]:text-brand
                            hover:bg-muted text-foreground group"
                        >
                          <Icon className="size-4 shrink-0 text-muted-foreground group-data-[selected=true]:text-brand" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold leading-tight">{item.label}</div>
                            {item.description && (
                              <div className="text-[11px] text-muted-foreground group-data-[selected=true]:text-brand/70 truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                          {item.shortcut && (
                            <div className="flex items-center gap-0.5 shrink-0">
                              {item.shortcut.split(" ").map((k) => (
                                <kbd
                                  key={k}
                                  className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded bg-muted border border-border text-[10px] font-mono font-bold text-muted-foreground"
                                >
                                  {k}
                                </kbd>
                              ))}
                            </div>
                          )}
                          <ArrowRight className="size-3.5 text-muted-foreground/0 group-data-[selected=true]:text-brand shrink-0" />
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                ))}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-border bg-muted/20 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="border border-border rounded px-1 py-0.5 font-mono bg-background">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="border border-border rounded px-1 py-0.5 font-mono bg-background">↵</kbd>
                    Select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="border border-border rounded px-1 py-0.5 font-mono bg-background">ESC</kbd>
                    Close
                  </span>
                </div>
                <span className="font-semibold text-brand">Billora</span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
