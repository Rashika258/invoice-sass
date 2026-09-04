"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  BarChart3,
  Barcode,
  Bell,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cloud,
  Crown,
  Database,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  FileUp,
  Globe,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Plus,
  Receipt,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Upload,
  UserCheck,
  UserCircle,
  Users,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { logoutUser } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandThemePicker } from "@/components/layout/brand-theme-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon?: any;
  plusHref?: string;
  badge?: string;
}

interface NavGroup {
  id: string;
  title: string;
  icon: any;
  collapsible?: boolean;
  defaultOpen?: boolean;
  items: NavItem[];
}

const navConfig: NavGroup[] = [
  {
    id: "home",
    title: "Home",
    icon: LayoutDashboard,
    collapsible: false,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/alerts", label: "Alerts & Reminders", icon: Bell, badge: "LIVE" },
    ],
  },
  {
    id: "companies",
    title: "Companies & Firms",
    icon: Building2,
    collapsible: false,
    items: [{ href: "/companies", label: "Multi-Firm Directory", icon: Building2, badge: "MULTI" }],
  },
  {
    id: "parties",
    title: "Parties",
    icon: Users,
    collapsible: true,
    defaultOpen: false,
    items: [
      { href: "/customers", label: "Parties Directory", icon: Users, plusHref: "/customers" },
    ],
  },
  {
    id: "items",
    title: "Items",
    icon: Package,
    collapsible: false,
    items: [{ href: "/items", label: "Items & Inventory", icon: Package, plusHref: "/items" }],
  },
  {
    id: "sale",
    title: "Sale",
    icon: FileText,
    collapsible: true,
    defaultOpen: true,
    items: [
      { href: "/invoices", label: "Sale Invoices", icon: FileText, plusHref: "/invoices/new" },
      { href: "/estimates", label: "Estimate/ Quotation", icon: FileSpreadsheet, plusHref: "/estimates/new" },
      { href: "/proforma", label: "Proforma Invoice", icon: FileText, plusHref: "/proforma/new" },
      { href: "/payment-in", label: "Payment-In", icon: Wallet, plusHref: "/payment-in" },
      { href: "/sale-orders", label: "Sale Order", icon: ShoppingBag, plusHref: "/sale-orders/new" },
      { href: "/challans", label: "Delivery Challan", icon: FileCheck, plusHref: "/challans/new" },
      { href: "/credit-notes", label: "Sale Return/ Credit Note", icon: Receipt, plusHref: "/credit-notes/new" },
      { href: "/pos", label: "Billora POS", icon: Zap, badge: "FAST" },
    ],
  },
  {
    id: "purchase",
    title: "Purchase & Expense",
    icon: ShoppingBag,
    collapsible: true,
    defaultOpen: true,
    items: [
      { href: "/purchases", label: "Purchase Bills", icon: ShoppingBag, plusHref: "/purchases/new" },
      { href: "/payment-out", label: "Payment-Out", icon: Wallet, plusHref: "/payment-out" },
      { href: "/expenses", label: "Expenses", icon: Banknote, plusHref: "/expenses" },
      { href: "/purchase-orders", label: "Purchase Order", icon: ShoppingBag, plusHref: "/purchase-orders/new" },
      { href: "/debit-notes", label: "Purchase Return/ Dr. Note", icon: Receipt, plusHref: "/debit-notes/new" },
    ],
  },
  {
    id: "ecommerce",
    title: "E-Commerce Store",
    icon: Store,
    collapsible: true,
    defaultOpen: true,
    items: [
      { href: "/grow/online-store", label: "Online Store Manager", icon: Store, badge: "STORE" },
      { href: "/grow/whatsapp-marketing", label: "WhatsApp Catalog", icon: MessageCircle },
      { href: "/grow/marketing-tools", label: "Marketing Campaigns", icon: Sparkles },
    ],
  },
  {
    id: "staff",
    title: "Staff & Attendance",
    icon: CalendarClock,
    collapsible: true,
    defaultOpen: false,
    items: [
      { href: "/attendance", label: "Attendance & OT", icon: CalendarClock, badge: "8H OT" },
      { href: "/attendance/kiosk", label: "Biometric Kiosk", icon: UserCheck, badge: "SCAN" },
    ],
  },
  {
    id: "cash-bank",
    title: "Cash & Bank",
    icon: Building2,
    collapsible: true,
    defaultOpen: false,
    items: [
      { href: "/cash-bank/banks", label: "Bank Accounts", icon: Building2, plusHref: "/cash-bank/banks" },
      { href: "/cash-bank/cash", label: "Cash In Hand", icon: Wallet, plusHref: "/cash-bank/cash" },
      { href: "/cash-bank/cheques", label: "Cheques", icon: Receipt },
      { href: "/cash-bank/loans", label: "Loan Accounts", icon: Banknote, plusHref: "/cash-bank/loans" },
    ],
  },
  {
    id: "reports",
    title: "Reports & Compliance",
    icon: BarChart3,
    collapsible: true,
    defaultOpen: false,
    items: [
      { href: "/reports", label: "Reports Directory", icon: BarChart3 },
      { href: "/ca-portal", label: "CA & Tax Portal", icon: FileSpreadsheet, badge: "AUDIT" },
      { href: "/compliance", label: "GST & DPDP Compliance", icon: CheckCircle2, badge: "GOVT" },
    ],
  },
  {
    id: "sync-backup",
    title: "Sync, Share & Backup",
    icon: Cloud,
    collapsible: true,
    defaultOpen: false,
    items: [
      { href: "/sync-share", label: "Sync & Share", icon: Cloud },
      { href: "/sync-share/auto-backup", label: "Auto Backup", icon: History },
      { href: "/sync-share/computer", label: "Backup To Computer", icon: Download },
      { href: "/sync-share/drive", label: "Backup To Drive", icon: Cloud },
      { href: "/sync-share/restore", label: "Restore Backup", icon: Upload },
    ],
  },
  {
    id: "utilities",
    title: "Utilities",
    icon: Wrench,
    collapsible: true,
    defaultOpen: false,
    items: [
      { href: "/utilities/import-items", label: "Import Items", icon: Package },
      { href: "/utilities/setup-business", label: "Set Up My Business", icon: Sparkles },
      { href: "/utilities/accountant-access", label: "Accountant Access", icon: UserCheck },
      { href: "/utilities/barcode-generator", label: "Barcode Generator", icon: Barcode },
      { href: "/utilities/bulk-update", label: "Update Items In Bulk", icon: Database },
      { href: "/utilities/import-parties", label: "Import Parties", icon: Users },
      { href: "/utilities/track-salesmen", label: "Track Your Salesmen", icon: UserCircle },
      { href: "/utilities/export-items", label: "Export Items", icon: Download },
      { href: "/utilities/verify-data", label: "Verify My Data", icon: CheckCircle2 },
      { href: "/utilities/close-fy", label: "Close Financial Year", icon: CalendarClock },
    ],
  },
  {
    id: "tally",
    title: "Tally Integration",
    icon: FileSpreadsheet,
    collapsible: false,
    items: [{ href: "/tally", label: "Tally Integration Hub", icon: FileSpreadsheet, badge: "NEW" }],
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    collapsible: false,
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
  {
    id: "plans",
    title: "Plans & Pricing",
    icon: Crown,
    collapsible: false,
    items: [{ href: "/plans", label: "Plans & Pricing", icon: Crown, badge: "SAVE 40%" }],
  },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {
      sale: true,
      purchase: true,
    };
    navConfig.forEach((grp) => {
      if (grp.items.some((it) => pathname.startsWith(it.href))) {
        initial[grp.id] = true;
      }
    });
    return initial;
  });

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-0.5 px-2 py-1 select-none">
      {navConfig.map((group) => {
        const GroupIcon = group.icon;
        const isOpen = openGroups[group.id] ?? false;
        const hasSubItems = group.collapsible && group.items.length > 0;
        const isGroupActive = group.items.some(
          (it) => pathname === it.href || (it.href !== "/dashboard" && pathname.startsWith(`${it.href}/`))
        );

        if (!hasSubItems && group.items.length === 1) {
          const singleItem = group.items[0];
          const isActive =
            singleItem.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === singleItem.href || pathname.startsWith(`${singleItem.href}/`);

          return (
            <div
              key={group.id}
              className={cn(
                "group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-brand-light text-brand font-bold border-l-3 border-brand rounded-l-none"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Link
                href={singleItem.href}
                onClick={onNavigate}
                className="flex items-center gap-2.5 flex-1 min-w-0"
              >
                <GroupIcon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive ? "text-brand" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="truncate">{group.title}</span>
                {singleItem.badge && (
                  <Badge className="ml-auto text-[9px] px-1 py-0 h-4 bg-brand-light text-brand border-none font-bold">
                    {singleItem.badge}
                  </Badge>
                )}
              </Link>
              {singleItem.plusHref && (
                <Link
                  href={singleItem.plusHref}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate?.();
                  }}
                  className="flex size-5 items-center justify-center rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                  title={`Add ${singleItem.label}`}
                >
                  <Plus className="size-3.5" />
                </Link>
              )}
            </div>
          );
        }

        return (
          <div key={group.id} className="space-y-0.5">
            <div
              onClick={() => toggleGroup(group.id)}
              className={cn(
                "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors",
                isGroupActive && !isOpen
                  ? "text-brand bg-brand-light border-l-3 border-brand rounded-l-none font-bold"
                  : "text-foreground/90 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <GroupIcon className={cn("size-4 shrink-0", isGroupActive ? "text-brand" : "text-muted-foreground")} />
                <span className="truncate">{group.title}</span>
              </div>
              <ChevronDown
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform duration-150",
                  isOpen && "rotate-180"
                )}
              />
            </div>

            {isOpen && (
              <div className="space-y-0.5 pl-3 pt-0.5">
                {group.items.map((item) => {
                  const SubIcon = item.icon;
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

                  return (
                    <div
                      key={item.href}
                      className={cn(
                        "group flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-all",
                        isActive
                          ? "bg-brand-light text-brand font-bold border-l-3 border-brand rounded-l-none"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className="flex items-center gap-2 flex-1 min-w-0"
                      >
                        {SubIcon && (
                          <SubIcon
                            className={cn(
                              "size-3.5 shrink-0 transition-colors",
                              isActive ? "text-brand" : "text-muted-foreground/80 group-hover:text-foreground"
                            )}
                          />
                        )}
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <Badge className="ml-auto text-[9px] px-1 py-0 h-4 bg-brand-light text-brand border-none font-bold">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>

                      {item.plusHref && (
                        <Link
                          href={item.plusHref}
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate?.();
                          }}
                          className="flex size-5 items-center justify-center rounded hover:bg-background/80 text-muted-foreground hover:text-foreground shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                          title={`Add new`}
                        >
                          <Plus className="size-3" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AppSidebar({
  userName,
  companyName,
  userRole = "ADMIN",
}: {
  userName: string;
  companyName: string;
  userRole?: string;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-[#0f1117] text-white lg:flex sticky top-0 z-30 select-none">
      {/* Billora Brand Header with Logo */}
      <div className="p-3 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/logo.png"
            alt="Billora Logo"
            className="size-8 rounded-lg object-contain shadow-xs border border-white/10 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-white">Billora</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px] font-bold px-1 py-0">
                ERP
              </Badge>
            </div>
            <p className="text-[10px] text-zinc-400 truncate max-w-[140px]" title={companyName}>
              {companyName || "Sri Manjunatha Engineering Works"}
            </p>
          </div>
        </div>
      </div>

      {/* Top Search: Open Anything (Ctrl+F) matching media_1788527179966.png */}
      <div className="p-3 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Open Anything (Ctrl+F)"
            className="w-full h-8 pl-8 pr-3 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-700"
          />
        </div>
      </div>

      {/* Nav List (clean scrolling) */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none py-1.5">
        <NavLinks pathname={pathname} />
      </div>

      {/* Bottom Section matching Vyapar desktop */}
      <div className="shrink-0 border-t border-border/40 p-3 space-y-2.5 bg-[#0b0d13]">
        {/* 6 days Free Trial Left Card */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
            <span>6 days Free Trial left</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-emerald-500" />
          </div>
          <Link
            href="/plans"
            className="flex items-center justify-between rounded-lg bg-brand hover:opacity-90 text-white px-2.5 py-1.5 text-xs font-bold transition-colors shadow-xs"
          >
            <div className="flex items-center gap-1.5">
              <Crown className="size-3.5" />
              <span>Get Billora Premium</span>
            </div>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {/* Company profile selector */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs">
              M
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-zinc-200 leading-tight">
                {companyName || "My Company"}
              </p>
              <p className="truncate text-[10px] text-zinc-400">{userRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <BrandThemePicker />
            <ThemeToggle />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => logoutUser()}
              className="size-7 text-zinc-400 hover:text-white"
              title="Sign Out"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </div>
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
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-xs px-4 py-2.5 lg:hidden">
      <div className="flex items-center gap-2.5">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="size-8">
                <Menu className="size-4" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-72 p-0 flex flex-col h-full bg-sidebar border-r border-border text-sidebar-foreground">
            {/* Drawer Header */}
            <div className="border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/icon.png"
                  alt="Billora"
                  className="size-8 rounded-lg object-contain border border-border shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Billora ERP</h3>
                  <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">{companyName}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {userRole}
              </Badge>
            </div>

            {/* Scrollable Nav Links */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none py-2">
              <NavLinks
                pathname={pathname}
                onNavigate={() => {
                  document.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "Escape" }),
                  );
                }}
              />
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{userName}</span>
                <div className="flex items-center gap-1">
                  <BrandThemePicker />
                  <ThemeToggle />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => logoutUser()}
                suppressHydrationWarning
                className="w-full text-xs cursor-pointer"
              >
                <LogOut className="size-3.5 mr-2" />
                Sign out
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <img
            src="/icon.png"
            alt="Billora"
            className="size-6 rounded-md object-contain shrink-0"
          />
          <span className="text-sm font-bold text-foreground">Billora</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/invoices/new"
          className="inline-flex items-center justify-center h-8 px-3 text-xs bg-primary text-primary-foreground font-medium rounded-md shadow-xs"
        >
          + Sale
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
