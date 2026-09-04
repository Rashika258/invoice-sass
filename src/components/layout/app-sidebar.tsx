"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  BarChart3,
  Barcode,
  CalendarClock,
  Cloud,
  Crown,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  Store,
  UserCircle,
  Users,
  Wallet,
  Wrench,
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
      { href: "/expenses", label: "Expenses", icon: Banknote },
    ],
  },
  {
    title: "Grow Your Business",
    items: [
      { href: "/grow/online-store", label: "My Online Store", icon: Store },
      { href: "/grow/whatsapp-marketing", label: "WhatsApp Marketing", icon: MessageCircle },
      { href: "/grow/google-profile", label: "Google Profile Manager", icon: Globe },
    ],
  },
  {
    title: "Cash & Bank",
    items: [
      { href: "/cash-bank", label: "Banks & Cash", icon: Wallet },
    ],
  },
  {
    title: "Business Reports",
    items: [{ href: "/reports", label: "Reports Directory", icon: BarChart3 }],
  },
  {
    title: "Sync & Utilities",
    items: [
      { href: "/sync-share", label: "Sync, Share & Backup", icon: Cloud },
      { href: "/utilities/import-items", label: "Import Items", icon: Package },
      { href: "/utilities/barcode-generator", label: "Barcode Generator", icon: Barcode },
      { href: "/utilities/export-tally", label: "Exports To Tally", icon: Wrench },
    ],
  },
  {
    title: "Staff & Payroll",
    items: [
      { href: "/employees", label: "Employees", icon: UserCircle },
      { href: "/attendance", label: "Attendance & OT", icon: CalendarClock },
    ],
  },
  {
    title: "Settings",
    items: [{ href: "/settings", label: "Company Profile & GST", icon: Settings }],
  },
];

function NavLinks({
  pathname,
  userRole = "ADMIN",
  onNavigate,
}: {
  pathname: string;
  userRole?: string;
  onNavigate?: () => void;
}) {
  const filteredGroups = navGroups.filter((group) => {
    if (userRole === "STAFF") {
      return group.title === "General" || group.title === "Staff & Payroll";
    }
    return true;
  });

  return (
    <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-2.5 py-3">
      {filteredGroups.map((group) => (
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
                      ? "bg-primary text-primary-foreground font-medium shadow-xs"
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
  userRole = "ADMIN",
  logoUrl,
}: {
  userName: string;
  companyName: string;
  userRole?: string;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      {/* Brand / Company Header */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={companyName}
              className="size-8 rounded-lg object-contain bg-white/10 p-0.5 shadow-xs shrink-0"
            />
          ) : (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm shadow-xs">
              {companyName ? companyName.charAt(0).toUpperCase() : "V"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold leading-tight text-white">{companyName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-medium text-sidebar-foreground/60 truncate">Vyapar ERP</span>
              <span className="rounded bg-primary/25 px-1 py-0.2 text-[9px] font-semibold text-primary-foreground">
                {userRole}
              </span>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <NavLinks pathname={pathname} userRole={userRole} />

      {/* Bottom Trial & My Company Widget matching reference screenshots */}
      <div className="mt-auto border-t border-sidebar-border p-2.5 space-y-2">
        {/* Trial Card */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-300">
            <span>6 days Free Trial left</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-sidebar-accent overflow-hidden">
            <div className="h-full w-4/6 rounded-full bg-emerald-500" />
          </div>
          <Link
            href="/settings"
            className="flex items-center justify-between text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors pt-1"
          >
            <span className="flex items-center gap-1.5">
              <Crown className="size-3.5" />
              Get Vyapar Premium
            </span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* My Company Quick Row */}
        <Link
          href="/settings"
          className="flex items-center justify-between rounded-lg border border-sidebar-border/60 bg-sidebar-accent/50 px-2.5 py-1.5 text-xs text-sidebar-foreground hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[9px]">
              +
            </span>
            <span className="font-semibold truncate max-w-[120px]">
              {companyName}
            </span>
          </span>
          <span className="text-[10px] text-sidebar-foreground/60">&gt;</span>
        </Link>

        <form action={logoutUser}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white h-7 text-xs rounded-lg font-normal"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Sign out ({userName})
          </Button>
        </form>
      </div>
    </aside>
  );
}

export function MobileHeader({
  userName,
  companyName,
  userRole = "ADMIN",
  logoUrl,
}: {
  userName: string;
  companyName: string;
  userRole?: string;
  logoUrl?: string | null;
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
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={companyName}
                    className="size-8 rounded-lg object-contain bg-white/10 p-0.5 shadow-xs"
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                    {companyName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white truncate max-w-[140px]">{companyName}</p>
                  <p className="truncate text-[10px] text-sidebar-foreground/60">{userName} ({userRole})</p>
                </div>
              </div>
            </div>
            <NavLinks
              pathname={pathname}
              userRole={userRole}
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
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={companyName} className="size-7 rounded-md object-contain bg-primary/10 p-0.5" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-black text-xs">
              {companyName ? companyName.charAt(0).toUpperCase() : "V"}
            </div>
          )}
          <div>
            <p className="text-xs font-bold leading-tight">{companyName}</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{userRole}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {userRole === "ADMIN" && (
          <Link href="/invoices/new" className="inline-flex items-center justify-center h-7 px-2.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md shadow-xs">
            + Sale
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
