"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Calculator,
  CalendarClock,
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
  Sparkles,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { logoutUser } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { CompanySwitcher } from "@/components/layout/company-switcher";
import { BrandThemePicker } from "@/components/layout/brand-theme-picker";
import { AlertsNotificationBell } from "@/components/layout/alerts-notification-bell";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { AiChatDrawer } from "@/components/ai/ai-chat-drawer";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

type AppTopHeaderProps = {
  userName: string;
  companyName: string;
  taxId?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
};

export function AppTopHeader({
  userName,
  companyName,
  taxId,
  logoUrl,
}: AppTopHeaderProps) {
  const router = useRouter();
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

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
    { title: "Attendance & OT", href: "/attendance", icon: CalendarClock, category: "Operations" },
    { title: "Payment In / Out", href: "/payments", icon: Wallet, category: "Cash & Bank" },
    { title: "Cash & Bank Accounts", href: "/cash-bank", icon: Wallet, category: "Cash & Bank" },
    { title: "Expenses", href: "/expenses", icon: Banknote, category: "Cash & Bank" },
    { title: "Staff Directory", href: "/employees", icon: Users, category: "Staff" },
    { title: "Reports & GST", href: "/reports", icon: FileText, category: "Reports" },
    { title: "Settings & Company", href: "/settings", icon: Settings, category: "Settings" },
  ];

  const filteredNav = quickNav.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <header className="flex h-14 w-full items-center justify-between px-6 border-b border-border bg-background">
        {/* Left: Multi-Company Switcher in Billora */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-1.5 shrink-0" title="Billora — Business OS">
            <img
              src="/icon.png"
              alt="Billora OS"
              className="size-7 rounded-lg object-contain border border-border/60 shadow-2xs"
            />
          </Link>
          <CompanySwitcher currentCompanyName={companyName} />
        </div>

        {/* Center: Command Palette */}
        <div className="flex items-center justify-center max-w-md w-full px-4">
          <CommandPalette />
        </div>

        {/* Right: Quick Action Buttons, Calculator, User */}
        <div className="flex items-center gap-2">
          {/* + Add Sale (Primary action) */}
          <Link
            href="/invoices/new"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-8 px-3 text-xs font-medium gap-1.5 shadow-2xs"
            )}
          >
            <Plus className="size-3.5" />
            <span>Add Sale</span>
            <kbd className="hidden xl:inline-block ml-1 rounded bg-background/20 px-1 text-[9px] font-mono">
              F8
            </kbd>
          </Link>

          {/* + Add Purchase (Outline action) */}
          <Link
            href="/purchases/new"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 px-3 text-xs font-medium gap-1.5 shadow-2xs"
            )}
          >
            <Plus className="size-3.5" />
            <span>Add Purchase</span>
            <kbd className="hidden xl:inline-block ml-1 rounded bg-muted px-1 text-[9px] font-mono">
              F9
            </kbd>
          </Link>

          {/* Quick Create Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8" title="Quick Actions">
                  <ChevronDown className="size-4 text-muted-foreground" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">More Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push("/estimates/new")}
                className="flex items-center gap-2 cursor-pointer text-xs"
              >
                <FileSpreadsheet className="size-3.5" />
                <span>Estimate / Quotation</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/payments")}
                className="flex items-center gap-2 cursor-pointer text-xs"
              >
                <ArrowDownLeft className="size-3.5 text-emerald-600" />
                <span>Payment In (Receipt)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/payments")}
                className="flex items-center gap-2 cursor-pointer text-xs"
              >
                <ArrowUpRight className="size-3.5 text-rose-600" />
                <span>Payment Out</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/challans/new")}
                className="flex items-center gap-2 cursor-pointer text-xs"
              >
                <FileCheck className="size-3.5" />
                <span>Delivery Challan</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/expenses/new")}
                className="flex items-center gap-2 cursor-pointer text-xs"
              >
                <Banknote className="size-3.5" />
                <span>Record Expense</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/attendance")}
                className="flex items-center gap-2 cursor-pointer text-xs"
              >
                <CalendarClock className="size-3.5 text-indigo-500" />
                <span>Log Attendance & OT</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Calculator Tool */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => setCalcOpen(true)}
            title="Calculator"
          >
            <Calculator className="size-4" />
          </Button>

          {/* Alerts & Reminders Notification Bell */}
          <AlertsNotificationBell />

          {/* Brand & Theme Color Customizer */}
          <BrandThemePicker />

          {/* AI Business Brain Quick Drawer */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAiDrawerOpen(true)}
            className="size-8 relative text-brand hover:bg-brand-light transition-colors cursor-pointer"
            title="AI Business Brain & Autopilot"
          >
            <Sparkles className="size-4" />
          </Button>

          <AiChatDrawer isOpen={aiDrawerOpen} onClose={() => setAiDrawerOpen(false)} />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8 rounded-full border border-border">
                  <span className="font-semibold text-xs">
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <p className="text-xs font-semibold text-foreground">{userName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{companyName}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")} className="text-xs cursor-pointer">
                <Settings className="size-3.5 mr-2" />
                Company Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/attendance")} className="text-xs cursor-pointer">
                <CalendarClock className="size-3.5 mr-2" />
                Attendance & Payroll
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/reports")} className="text-xs cursor-pointer">
                <FileText className="size-3.5 mr-2" />
                Reports & GST
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => logoutUser()}
                className="text-xs text-rose-600 hover:bg-destructive/10 rounded-sm cursor-pointer"
              >
                <LogOut className="size-3.5 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="flex items-center border-b border-border px-3">
            <Search className="size-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections, bills, inventory..."
              suppressHydrationWarning
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {filteredNav.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No matching pages or features found.</p>
            ) : (
              <div className="space-y-1">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        router.push(item.href);
                      }}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="size-4 text-muted-foreground" />
                        <span>{item.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{item.category}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Calculator Dialog */}
      <Dialog open={calcOpen} onOpenChange={setCalcOpen}>
        <DialogContent className="sm:max-w-[280px] p-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Quick Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="rounded-md border border-input bg-muted/30 p-2.5 text-right font-mono text-base">
              <div className="text-[10px] text-muted-foreground min-h-[14px]">
                {calcResult !== null ? calcInput : ""}
              </div>
              <div className="text-lg font-bold text-foreground">
                {calcResult !== null ? calcResult : calcInput || "0"}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
              {["C", "(", ")", "/"].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleCalcButton(btn)}
                  className="rounded-md bg-muted p-2 hover:bg-muted/80 text-foreground transition-colors"
                >
                  {btn}
                </button>
              ))}
              {["7", "8", "9", "*"].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleCalcButton(btn)}
                  className="rounded-md bg-card border border-border p-2 hover:bg-accent text-foreground transition-colors"
                >
                  {btn}
                </button>
              ))}
              {["4", "5", "6", "-"].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleCalcButton(btn)}
                  className="rounded-md bg-card border border-border p-2 hover:bg-accent text-foreground transition-colors"
                >
                  {btn}
                </button>
              ))}
              {["1", "2", "3", "+"].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleCalcButton(btn)}
                  className="rounded-md bg-card border border-border p-2 hover:bg-accent text-foreground transition-colors"
                >
                  {btn}
                </button>
              ))}
              {["0", ".", "="].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleCalcButton(btn)}
                  className={`rounded-md p-2 transition-colors ${
                    btn === "="
                      ? "col-span-2 bg-primary text-primary-foreground font-bold"
                      : "bg-card border border-border hover:bg-accent text-foreground"
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
