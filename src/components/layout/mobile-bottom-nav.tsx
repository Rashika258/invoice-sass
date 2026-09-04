"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  FileText,
  LayoutDashboard,
  Package,
  Plus,
} from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export function MobileBottomNav() {
  const pathname = usePathname();

  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Not running inside native mobile container or haptics unavailable
    }
  };

  const navItems = [
    {
      href: "/dashboard",
      label: "Home",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      href: "/invoices",
      label: "Bills",
      icon: FileText,
      isActive: pathname.startsWith("/invoices") && pathname !== "/invoices/new",
    },
    // Center Floating Action Button (+ Sale)
    {
      href: "/invoices/new",
      label: "+ Sale",
      isFab: true,
      icon: Plus,
      isActive: pathname === "/invoices/new",
    },
    {
      href: "/attendance",
      label: "Attendance",
      icon: CalendarClock,
      isActive: pathname.startsWith("/attendance"),
    },
    {
      href: "/items",
      label: "Items",
      icon: Package,
      isActive: pathname.startsWith("/items"),
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/80 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-lg select-none">
      <div className="flex items-center justify-around h-14 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isFab) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={triggerHaptic}
                className="relative -top-3 flex flex-col items-center group cursor-pointer"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform active:scale-95 border-2 border-background">
                  <Icon className="size-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-brand mt-0.5">
                  + Sale
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={triggerHaptic}
              className={`flex flex-col items-center justify-center w-14 py-1 transition-colors cursor-pointer ${
                item.isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              <Icon
                className={`size-5 transition-transform ${
                  item.isActive ? "scale-110 stroke-[2.25]" : "stroke-[1.75]"
                }`}
              />
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
