"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Calculator,
  ChevronDown,
  FileCheck,
  FileSpreadsheet,
  FileText,
  LogOut,
  Package,
  Plus,
  Receipt,
  Search,
  Settings,
  ShoppingBag,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { logoutUser } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type VyaparHeaderProps = {
  userName: string;
  companyName: string;
  taxId?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
};

export function VyaparHeader({
  userName,
  companyName,
  taxId,
  logoUrl,
}: VyaparHeaderProps) {
  const router = useRouter();
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState<string | null>(null);

  // Global search modal
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Keyboard shortcut listener: F8 for Add Sale, F9 for Add Purchase, Ctrl+K for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F8") {
        e.preventDefault();
        router.push("/invoices/new");
      } else if (e.key === "F9") {
        e.preventDefault();
        router.push("/purchases/new");
      } else if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Calculator evaluation
  const handleCalcButton = (val: string) => {
    if (val === "C") {
      setCalcInput("");
      setCalcResult(null);
    } else if (val === "=") {
      try {
        const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, "");
        if (!sanitized) return;
        // eslint-disable-next-line no-new-func
        const res = Function(`"use strict"; return (${sanitized})`)();
        setCalcResult(String(res));
      } catch {
        setCalcResult("Error");
      }
    } else {
      setCalcInput((prev) => prev + val);
    }
  };

  const quickNav = [
    { title: "Sale Invoices", href: "/invoices", icon: FileText, category: "Sales" },
    { title: "New Sale Invoice", href: "/invoices/new", icon: Plus, category: "Sales" },
    { title: "Purchase Bills", href: "/purchases", icon: ShoppingBag, category: "Purchases" },
    { title: "New Purchase Bill", href: "/purchases/new", icon: Plus, category: "Purchases" },
    { title: "Parties Directory", href: "/customers", icon: Users, category: "Parties" },
    { title: "Items & Inventory", href: "/items", icon: Package, category: "Inventory" },
    { title: "Payment In / Out", href: "/payments", icon: Wallet, category: "Cash & Bank" },
    { title: "Cash & Bank Accounts", href: "/cash-bank", icon: Wallet, category: "Cash & Bank" },
    { title: "Expenses", href: "/expenses", icon: Banknote, category: "Cash & Bank" },
    { title: "Attendance & Payroll", href: "/attendance", icon: FileText, category: "Payroll" },
    { title: "Staff Directory", href: "/employees", icon: Users, category: "Staff" },
    { title: "Reports & GST", href: "/reports", icon: FileText, category: "Reports" },
    { title: "Settings & Company", href: "/settings", icon: Settings, category: "Settings" },
  ];

  const filteredNav = quickNav.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* Vyapar Desktop Topmost Utility Strip */}
      <div className="flex h-7 w-full items-center justify-between border-b border-border/50 bg-card/70 px-4 text-[11px] text-muted-foreground select-none">
        <div className="flex items-center gap-3">
          <Link href="/settings" className="font-semibold text-foreground flex items-center gap-1.5 hover:text-primary transition-colors">
            <span className="size-2 rounded-full bg-primary" />
            Company
          </Link>
          <span className="hover:text-foreground cursor-pointer hidden sm:inline">Help</span>
          <span className="hover:text-foreground cursor-pointer hidden sm:inline">Versions</span>
          <span className="hover:text-foreground cursor-pointer hidden sm:inline">Shortcuts</span>
          <button type="button" onClick={() => router.refresh()} className="hover:text-foreground cursor-pointer" title="Refresh">
            ↻
          </button>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-[10px]">
          <span>Customer Support : 📞 +91 77956 87633, +91 63644 44752</span>
          <span className="text-border">|</span>
          <span className="text-primary font-semibold flex items-center gap-1">
            📡 Get Instant Online Support
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      <header className="sticky top-0 z-30 flex h-13 w-full items-center justify-between border-b border-border/60 bg-background/90 backdrop-blur-md px-4 sm:px-6">
        {/* Left: Quick Search button styled like Vyapar desktop search */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/60 transition-all cursor-pointer w-44 sm:w-52 justify-between shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="size-3.5 text-primary" />
              <span className="truncate">Open Anything</span>
            </div>
            <kbd className="hidden sm:inline-block rounded bg-background px-1.5 py-0.5 text-[9px] font-mono border text-muted-foreground">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Center: Vyapar Iconic Red/Purple Dot + Business Name */}
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-muted/40 transition-colors group"
            title="Click to edit business name & settings"
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={companyName}
                className="size-6 rounded-md object-contain bg-white shadow-2xs p-0.5 border"
              />
            ) : (
              <span className="size-2.5 rounded-full bg-primary animate-pulse" />
            )}
            <span className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
              {companyName || "Enter Business Name"}
            </span>
          </Link>
        </div>

        {/* Right: Vyapar Iconic Pill Action Buttons */}
        <div className="flex items-center gap-2">
          {/* + Add Sale (Purple pill button, F8) */}
          <Link
            href="/invoices/new"
            className="inline-flex shrink-0 items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs px-4 h-8 gap-1.5 rounded-full text-xs transition-all active:scale-[0.98] select-none"
          >
            <Plus className="size-3.5" />
            <span>Add Sale</span>
            <span className="hidden xl:inline-block ml-0.5 rounded bg-black/25 px-1 py-0.2 text-[9px] font-mono">
              F8
            </span>
          </Link>

          {/* + Add Purchase (Blue pill button, F9) */}
          <Link
            href="/purchases/new"
            className="inline-flex shrink-0 items-center justify-center bg-[#1976D2] hover:bg-[#1565c0] text-white font-semibold shadow-xs px-4 h-8 gap-1.5 rounded-full text-xs transition-all active:scale-[0.98] select-none"
          >
            <Plus className="size-3.5" />
            <span>Add Purchase</span>
            <span className="hidden xl:inline-block ml-0.5 rounded bg-black/25 px-1 py-0.2 text-[9px] font-mono">
              F9
            </span>
          </Link>

          {/* + Add More (Circular Button Dropdown) */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon" className="size-8 rounded-full border-border/80 text-xs" title="Add Other Transaction">
                  <Plus className="size-4 text-primary" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Sale Transactions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push("/estimates/new")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="size-4 text-blue-600" />
                <span>Estimate / Quotation</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/payments")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <ArrowDownLeft className="size-4 text-emerald-600" />
                <span>Payment In (Receipt)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/challans/new")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <FileCheck className="size-4 text-purple-600" />
                <span>Delivery Challan</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/credit-notes/new")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Receipt className="size-4 text-amber-600" />
                <span>Sale Return (Credit Note)</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Purchase &amp; Expenses</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push("/payments")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <ArrowUpRight className="size-4 text-rose-600" />
                <span>Payment Out</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/expenses")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Banknote className="size-4 text-orange-600" />
                <span>Add Expense</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/purchase-orders/new")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="size-4 text-blue-600" />
                <span>Purchase Order</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/debit-notes/new")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Receipt className="size-4 text-rose-600" />
                <span>Purchase Return (Debit Note)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Calculator Dialog Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCalcOpen(true)}
            title="Quick Calculator"
            className="size-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <Calculator className="size-4" />
          </Button>

          {/* Settings Gear icon */}
          <Link
            href="/settings"
            className="inline-flex size-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Settings & Profile"
          >
            <Settings className="size-4" />
          </Link>

          {/* User Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                  <User className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <p className="font-bold">{userName}</p>
                <p className="text-xs text-muted-foreground font-normal truncate">{companyName}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="cursor-pointer"
              >
                <Settings className="mr-2 size-4" />
                <span>Settings &amp; Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/reports")}
                className="cursor-pointer"
              >
                <FileText className="mr-2 size-4" />
                <span>Reports Hub</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={logoutUser}>
                <button type="submit" className="w-full flex items-center px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded cursor-pointer">
                  <LogOut className="mr-2 size-4" />
                  <span>Sign out</span>
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Quick Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="flex items-center border-b px-3">
            <Search className="size-4 text-muted-foreground mr-2 shrink-0" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoices, parties, items, reports..."
              className="border-0 focus-visible:ring-0 shadow-none h-12 text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {filteredNav.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">No matches found.</p>
            ) : (
              filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setSearchOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-md p-2 text-left text-sm hover:bg-muted transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="size-4 text-primary" />
                      <span className="font-medium">{item.title}</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Calculator Dialog */}
      <Dialog open={calcOpen} onOpenChange={setCalcOpen}>
        <DialogContent className="max-w-xs p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Calculator className="size-4 text-primary" /> Vyapar Calculator
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/40 p-3 text-right">
            <div className="min-h-5 text-xs text-muted-foreground font-mono">
              {calcInput || "0"}
            </div>
            <div className="text-xl font-bold font-mono">
              {calcResult !== null ? calcResult : calcInput || "0"}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2">
            {["7", "8", "9", "/"].map((btn) => (
              <Button key={btn} variant="outline" onClick={() => handleCalcButton(btn)}>
                {btn}
              </Button>
            ))}
            {["4", "5", "6", "*"].map((btn) => (
              <Button key={btn} variant="outline" onClick={() => handleCalcButton(btn)}>
                {btn}
              </Button>
            ))}
            {["1", "2", "3", "-"].map((btn) => (
              <Button key={btn} variant="outline" onClick={() => handleCalcButton(btn)}>
                {btn}
              </Button>
            ))}
            {["C", "0", "=", "+"].map((btn) => (
              <Button
                key={btn}
                variant={btn === "=" ? "default" : btn === "C" ? "destructive" : "outline"}
                className={btn === "=" ? "bg-primary hover:bg-primary/90 text-primary-foreground font-bold" : ""}
                onClick={() => handleCalcButton(btn)}
              >
                {btn}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
