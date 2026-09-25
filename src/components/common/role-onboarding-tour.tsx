"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Check, X, Compass, Shield, Store, BookOpen, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TourStep {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  icon: React.ElementType;
}

const ROLE_TOURS: Record<string, TourStep[]> = {
  ADMIN: [
    {
      title: "1. Actionable Executive Dashboard",
      description: "Monitor real-time revenue, overdue invoice dues, low-stock reorders, and 1-click sticky quick actions.",
      href: "/dashboard",
      actionLabel: "Explore Dashboard",
      icon: Compass,
    },
    {
      title: "2. Zero-Navigation GST Invoicing & POS",
      description: "Create GST compliant sale bills, launch retail POS, and auto-generate WhatsApp payment links.",
      href: "/invoices/new",
      actionLabel: "Create First Invoice",
      icon: Store,
    },
    {
      title: "3. Double-Entry Accounting & Daybook",
      description: "Manage chart of accounts, post journal vouchers, and audit trial balance, cash-flow & P&L.",
      href: "/accounting",
      actionLabel: "Open Accounting Hub",
      icon: BookOpen,
    },
    {
      title: "4. Automated Compliance & Backups",
      description: "Reconcile GSTR-1 / GSTR-3B filings and export/restore encrypted JSON database backups.",
      href: "/compliance",
      actionLabel: "View Compliance Tools",
      icon: Shield,
    },
  ],
  SALES: [
    {
      title: "1. Touch Point-of-Sale (POS) Terminal",
      description: "High-speed barcode scanner checkout, cash/UPI collection, and instant receipt printing.",
      href: "/pos",
      actionLabel: "Launch POS Terminal",
      icon: Store,
    },
    {
      title: "2. Fast GST Invoice Billing",
      description: "Draft customer bills with automatic HSN tax lookup and instant PDF generation.",
      href: "/invoices/new",
      actionLabel: "New Sale Invoice",
      icon: Store,
    },
    {
      title: "3. Customer Ledgers & Balances",
      description: "Lookup client payment history and send 1-click WhatsApp payment reminders with QR links.",
      href: "/customers",
      actionLabel: "View Customers",
      icon: Compass,
    },
  ],
  ACCOUNTANT: [
    {
      title: "1. Journal Vouchers & Daybook",
      description: "Post DR/CR journal vouchers with automatic balancing validation and reference numbers.",
      href: "/accounting/vouchers",
      actionLabel: "Post Journal Voucher",
      icon: BookOpen,
    },
    {
      title: "2. Chart of Accounts & Ledgers",
      description: "Maintain asset, liability, expense, and revenue ledgers with full transaction drilldowns.",
      href: "/accounting/ledgers",
      actionLabel: "Master Ledgers",
      icon: BookOpen,
    },
    {
      title: "3. Trial Balance & Profit & Loss",
      description: "Audit trial balance accuracy, verify voucher debits vs credits, and view live P&L reports.",
      href: "/accounting/trial-balance",
      actionLabel: "Check Trial Balance",
      icon: Compass,
    },
  ],
  WAREHOUSE: [
    {
      title: "1. Inventory Item Master & Stock",
      description: "Track stock quantities, HSN codes, purchase/sale prices, and min-stock reorder buffers.",
      href: "/items",
      actionLabel: "View Inventory Master",
      icon: Package,
    },
    {
      title: "2. Godown Stock Transfers",
      description: "Shift inventory between godowns and warehouses with multi-warehouse transit tracking.",
      href: "/items/stock-transfer",
      actionLabel: "Stock Transfer Hub",
      icon: Package,
    },
    {
      title: "3. Dispatch & Delivery Challans",
      description: "Generate delivery challans for goods dispatched to job-workers or clients.",
      href: "/challans",
      actionLabel: "Delivery Challans",
      icon: Compass,
    },
  ],
};

export function RoleOnboardingTour({ userRole = "ADMIN" }: { userRole?: string }) {
  const [open, setOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loginSessionCount, setLoginSessionCount] = useState<number>(1);

  const storageKey = `billora_onboarding_login_count_${userRole}`;
  const dismissedKey = `billora_onboarding_dismissed_${userRole}`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const isDismissed = localStorage.getItem(dismissedKey);
      if (isDismissed === "true") return;

      const rawCount = localStorage.getItem(storageKey);
      const count = rawCount ? parseInt(rawCount, 10) + 1 : 1;
      localStorage.setItem(storageKey, count.toString());
      setLoginSessionCount(count);

      // Show tour only for the first 3 login sessions!
      if (count <= 3) {
        setOpen(true);
      }
    } catch {
      // Storage unavailable
    }
  }, [storageKey, dismissedKey]);

  if (!open) return null;

  const steps = ROLE_TOURS[userRole.toUpperCase()] || ROLE_TOURS.ADMIN;
  const activeStep = steps[currentStepIndex] || steps[0];
  const StepIcon = activeStep.icon;

  const handleDismissForever = () => {
    try {
      localStorage.setItem(dismissedKey, "true");
    } catch {
      // Ignore
    }
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-brand-light text-brand">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                <span>Guided Feature Tour</span>
                <Badge className="bg-brand text-white text-[9px] font-mono font-bold">
                  Login Session {loginSessionCount} of 3
                </Badge>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Tailored onboarding workflow for role: <strong>{userRole}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Step Card Content */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand/10 text-brand">
              <StepIcon className="size-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">{activeStep.title}</h4>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed pl-1">
            {activeStep.description}
          </p>

          <div className="pt-2">
            <Link
              href={activeStep.href}
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white font-bold text-xs shadow-xs hover:opacity-90 transition-all"
            >
              <span>{activeStep.actionLabel}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            type="button"
            onClick={handleDismissForever}
            className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
          >
            Don&apos;t show again
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStepIndex((i) => i - 1)}
                className="h-8 text-xs"
              >
                Back
              </Button>
            )}

            {currentStepIndex < steps.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentStepIndex((i) => i + 1)}
                className="h-8 text-xs font-bold bg-foreground text-background"
              >
                <span>Next ({currentStepIndex + 1}/{steps.length})</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setOpen(false)}
                className="h-8 text-xs font-bold bg-emerald-600 text-white"
              >
                <Check className="size-3.5 mr-1" />
                <span>Got It! Finish Tour</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
