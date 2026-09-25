"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface CommandItem {
  id: string;
  title: string;
  category: string;
  href: string;
  shortcut?: string;
}

const COMMAND_NAVIGATION: CommandItem[] = [
  { id: "nav-invoices", title: "Invoices & Sales Bills", category: "Navigation", href: "/invoices", shortcut: "G I" },
  { id: "nav-new-invoice", title: "Create Sale Invoice", category: "Quick Actions", href: "/invoices/new", shortcut: "C I" },
  { id: "nav-customers", title: "Parties & Customers", category: "Navigation", href: "/customers", shortcut: "G C" },
  { id: "nav-items", title: "Items & Inventory", category: "Navigation", href: "/items", shortcut: "G P" },
  { id: "nav-accounting", title: "Tally Accounting & Ledgers", category: "Navigation", href: "/accounting", shortcut: "G A" },
  { id: "nav-vouchers", title: "Journal Vouchers", category: "Navigation", href: "/accounting/vouchers", shortcut: "G V" },
  { id: "nav-pos", title: "Touch POS Terminal", category: "Quick Actions", href: "/pos", shortcut: "G K" },
  { id: "nav-settings", title: "Business Settings", category: "Navigation", href: "/settings", shortcut: "G S" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = COMMAND_NAVIGATION.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  function executeCommand(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden shadow-2xl border">
        <div className="p-3 border-b bg-muted/20">
          <Input
            placeholder="🔍 Type a command or search page (Ctrl + K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 border-none bg-transparent text-base focus-visible:ring-0"
            autoFocus
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-2 divide-y">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => executeCommand(cmd.href)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-accent text-left text-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-muted text-muted-foreground">
                    {cmd.category}
                  </span>
                  <span className="font-medium text-foreground">{cmd.title}</span>
                </div>
                {cmd.shortcut && (
                  <kbd className="text-xs font-mono px-1.5 py-0.5 rounded bg-muted border text-muted-foreground">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
