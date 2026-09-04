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
};

export function VyaparHeader({
  userName,
  companyName,
  taxId,
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
        // Safe arithmetic expression parser
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
    { title: "Estimates / Quotation", href: "/estimates", icon: FileSpreadsheet, category: "Sales" },
    { title: "Delivery Challans", href: "/challans", icon: FileCheck, category: "Sales" },
    { title: "Credit Notes (Sale Return)", href: "/credit-notes", icon: Receipt, category: "Sales" },
    { title: "Debit Notes (Purchase Return)", href: "/debit-notes", icon: Receipt, category: "Purchases" },
    { title: "Parties (Customers/Vendors)", href: "/customers", icon: Users, category: "Masters" },
    { title: "Items & Inventory", href: "/items", icon: Package, category: "Masters" },
    { title: "Cash & Bank Accounts", href: "/cash-bank", icon: Wallet, category: "Banking" },
    { title: "Expenses", href: "/expenses", icon: Banknote, category: "Expenses" },
    { title: "GSTR & Profit Reports", href: "/reports", icon: FileText, category: "Reports" },
    { title: "Company Profile & GST", href: "/settings", icon: Settings, category: "Settings" },
  ];

  const filteredNav = quickNav.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-md px-4 sm:px-6">
        {/* Left: Company Profile badge */}
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="group flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 transition-all hover:bg-muted/60"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-primary font-bold text-white text-xs shadow-xs">
              {companyName.slice(0, 1).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {companyName}
                </span>
                <Badge variant="outline" className="h-4 px-1 text-[9px] font-medium text-emerald-600 border-emerald-300 dark:border-emerald-800">
                  <span className="size-1 rounded-full bg-emerald-500 mr-1 inline-block" />
                  GST Active
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {taxId ? `GSTIN: ${taxId}` : "Click to setup GSTIN"}
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Vyapar Iconic Action Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {/* + Add Sale (Red button, F8) */}
          <Link
            href="/invoices/new"
            className="inline-flex shrink-0 items-center justify-center bg-[#D32F2F] hover:bg-[#b71c1c] text-white font-medium shadow-xs px-3.5 h-8 gap-1.5 rounded-lg text-xs transition-all active:scale-[0.98] select-none"
          >
            <Plus className="size-3.5" />
            <span>Add Sale</span>
            <span className="hidden xl:inline-block ml-0.5 rounded bg-black/25 px-1 py-0.2 text-[9px] font-mono">
              F8
            </span>
          </Link>

          {/* + Add Purchase (Blue button, F9) */}
          <Link
            href="/purchases/new"
            className="inline-flex shrink-0 items-center justify-center bg-[#1976D2] hover:bg-[#1565c0] text-white font-medium shadow-xs px-3.5 h-8 gap-1.5 rounded-lg text-xs transition-all active:scale-[0.98] select-none"
          >
            <ShoppingBag className="size-3.5" />
            <span>Add Purchase</span>
            <span className="hidden xl:inline-block ml-0.5 rounded bg-black/25 px-1 py-0.2 text-[9px] font-mono">
              F9
            </span>
          </Link>

          {/* + Add More (Dropdown) */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="h-8 gap-1 rounded-lg border-border/70 text-xs font-medium">
                  <Plus className="size-3.5 text-primary" />
                  <span>Add More</span>
                  <ChevronDown className="size-3 opacity-60" />
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
              <DropdownMenuLabel>Purchase & Expenses</DropdownMenuLabel>
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
        </div>

        {/* Right Tools & Profile */}
        <div className="flex items-center gap-1.5">
          {/* Quick Search trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex h-8 items-center gap-2 rounded-lg border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground text-xs"
          >
            <Search className="size-3.5" />
            <span>Search...</span>
            <kbd className="rounded border border-border/70 bg-muted/60 px-1 py-0.2 font-mono text-[9px] text-muted-foreground">Ctrl+K</kbd>
          </Button>

          {/* Quick Calculator Dialog Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCalcOpen(true)}
            title="Vyapar Quick Calculator"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <Calculator className="size-4" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
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
                <span>Settings & Profile</span>
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
                className={btn === "=" ? "bg-[#D32F2F] hover:bg-[#B71C1C]" : ""}
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
