"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import { logoutUser } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/items", label: "Items", icon: Package },
  { href: "/employees", label: "Employees", icon: UserCircle },
  { href: "/attendance", label: "Attendance", icon: CalendarClock },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
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
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r bg-card lg:flex">
      <div className="border-b px-6 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">InvoiceFlow</p>
            <p className="truncate text-xs text-muted-foreground">{companyName}</p>
          </div>
        </Link>
      </div>

      <NavLinks pathname={pathname} />

      <div className="mt-auto border-t p-4">
        <div className="mb-3 rounded-lg bg-muted/60 px-3 py-2">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="truncate text-sm font-medium">{userName}</p>
        </div>
        <form action={logoutUser}>
          <Button type="submit" variant="outline" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
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
    <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="size-9">
                <Menu className="h-4 w-4" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-72 p-0">
            <div className="border-b px-6 py-5">
              <p className="text-sm font-semibold">InvoiceFlow</p>
              <p className="truncate text-xs text-muted-foreground">{companyName}</p>
            </div>
            <NavLinks
              pathname={pathname}
              onNavigate={() => {
                document.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "Escape" }),
                );
              }}
            />
            <div className="mt-auto border-t p-4">
              <p className="mb-2 truncate text-sm font-medium">{userName}</p>
              <form action={logoutUser}>
                <Button type="submit" variant="outline" className="w-full">
                  Sign out
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
        <div>
          <p className="text-sm font-semibold">InvoiceFlow</p>
          <p className="text-xs text-muted-foreground">{companyName}</p>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}

export function DesktopHeader() {
  return (
    <header className="hidden items-center justify-end border-b bg-background/80 px-6 py-3 backdrop-blur lg:flex">
      <ThemeToggle />
    </header>
  );
}
