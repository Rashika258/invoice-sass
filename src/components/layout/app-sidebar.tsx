"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  BarChart3,
  CalendarClock,
  FileCheck,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";
import { logoutUser } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    title: "General",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Parties & Inventory",
    items: [
      { href: "/customers", label: "Parties", icon: Users },
      { href: "/items", label: "Items", icon: Package },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/invoices", label: "Sale Invoices", icon: FileText },
      { href: "/estimates", label: "Estimates / Quotations", icon: FileSpreadsheet },
      { href: "/payments", label: "Payment In / Out", icon: Wallet },
      { href: "/challans", label: "Delivery Challan", icon: FileCheck },
      { href: "/credit-notes", label: "Sale Return (Cr Note)", icon: Receipt },
    ],
  },
  {
    title: "Purchases",
    items: [
      { href: "/purchases", label: "Purchase Bills", icon: ShoppingBag },
      { href: "/purchase-orders", label: "Purchase Orders", icon: ShoppingBag },
      { href: "/debit-notes", label: "Purchase Return (Dr Note)", icon: Receipt },
    ],
  },
  {
    title: "Cash & Expenses",
    items: [
      { href: "/cash-bank", label: "Cash & Bank", icon: Wallet },
      { href: "/expenses", label: "Expenses", icon: Banknote },
    ],
  },
  {
    title: "Business Reports",
    items: [{ href: "/reports", label: "Reports & GST", icon: BarChart3 }],
  },
  {
    title: "Staff & Payroll",
    items: [
      { href: "/employees", label: "Employees", icon: UserCircle },
      { href: "/attendance", label: "Attendance", icon: CalendarClock },
    ],
  },
  {
    title: "Settings",
    items: [{ href: "/settings", label: "Company Profile & GST", icon: Settings }],
  },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-2.5 py-3">
      {navGroups.map((group) => (
        <div key={group.title}>
          <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            {group.title}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-150",
                    isActive
                      ? "bg-[#D32F2F] text-white font-medium shadow-xs"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AppSidebar({
  userName,
  companyName,
}: {
  userName: string;
  companyName: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      {/* Vyapar Logo & Header */}
      <div className="border-b border-sidebar-border px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D32F2F] text-white shadow-xs font-bold text-sm tracking-wider">
            V
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-white">Vyapar</span>
              <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-medium text-emerald-400">
                PRO
              </span>
            </div>
            <p className="truncate text-[10px] text-sidebar-foreground/60 font-normal">
              GST Billing & Inventory
            </p>
          </div>
        </Link>
      </div>

      <NavLinks pathname={pathname} />

      {/* Footer / User card */}
      <div className="mt-auto border-t border-sidebar-border p-2.5">
        <div className="mb-2 rounded-lg border border-sidebar-border/60 bg-sidebar-accent/50 px-2.5 py-2">
          <p className="text-[9px] uppercase tracking-wider text-sidebar-foreground/40 font-medium">Business</p>
          <p className="truncate text-xs font-medium text-white">{companyName}</p>
          <p className="truncate text-[10px] text-sidebar-foreground/60">{userName}</p>
        </div>
        <form action={logoutUser}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white h-8 text-xs rounded-lg font-normal"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}

export function MobileHeader({
  userName,
  companyName,
}: {
  userName: string;
  companyName: string;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-card px-4 py-2.5 lg:hidden shadow-xs">
      <div className="flex items-center gap-2.5">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="size-8">
                <Menu className="h-4 w-4" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground">
            <div className="border-b border-sidebar-border px-4 py-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D32F2F] text-white font-black">
                  V
                </div>
                <div>
                  <p className="text-sm font-black text-white">Vyapar</p>
                  <p className="truncate text-[10px] text-sidebar-foreground/60">{companyName}</p>
                </div>
              </div>
            </div>
            <NavLinks
              pathname={pathname}
              onNavigate={() => {
                document.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "Escape" }),
                );
              }}
            />
            <div className="mt-auto border-t border-sidebar-border p-3">
              <p className="mb-1.5 truncate text-xs font-medium text-white">{userName}</p>
              <form action={logoutUser}>
                <Button type="submit" variant="outline" size="sm" className="w-full h-8 text-xs">
                  Sign out
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#D32F2F] text-white font-black text-xs">
            V
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">Vyapar</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{companyName}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Link href="/invoices/new" className="inline-flex items-center justify-center h-7 px-2.5 text-xs bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold rounded-md">
          + Sale
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
