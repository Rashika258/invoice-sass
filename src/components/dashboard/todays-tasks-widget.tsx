"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  PackageX,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/invoice-utils";

export interface TodaysTasksProps {
  overdueCount: number;
  overdueTotal: number;
  lowStockCount: number;
  pendingPaymentCount: number;
  currency?: string;
}

export function TodaysTasksWidget({
  overdueCount,
  overdueTotal,
  lowStockCount,
  pendingPaymentCount,
  currency = "INR",
}: TodaysTasksProps) {
  const totalTasks = overdueCount + lowStockCount + pendingPaymentCount;

  return (
    <Card className="rounded-xl border border-primary/20 shadow-xs bg-card">
      <CardHeader className="border-b bg-card/60 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
              <Clock className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Today&apos;s Action Plan
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {totalTasks > 0
                  ? `${totalTasks} urgent items require your attention today`
                  : "All business workflows are operating smoothly"}
              </p>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
            <Link href="/invoices/new">
              <Button size="sm" className="h-7 text-xs font-bold px-2.5">
                <Plus className="mr-1 size-3" /> New Invoice
              </Button>
            </Link>
            <Link href="/customers">
              <Button size="sm" variant="outline" className="h-7 text-xs font-semibold px-2.5">
                + Party
              </Button>
            </Link>
            <Link href="/items">
              <Button size="sm" variant="outline" className="h-7 text-xs font-semibold px-2.5">
                + Item
              </Button>
            </Link>
            <Link href="/payments">
              <Button size="sm" variant="outline" className="h-7 text-xs font-semibold px-2.5">
                + Payment
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Overdue Invoices Item */}
          <div className="flex flex-col justify-between p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5" /> Overdue Invoices
                </span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {overdueCount}
                </span>
              </div>
              <p className="text-base font-black font-mono text-foreground">
                {formatCurrency(overdueTotal, currency)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Outstanding dues past due date
              </p>
            </div>
            <Link href="/invoices?status=OVERDUE" className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs font-semibold text-rose-600 border-rose-500/40 hover:bg-rose-500/10 justify-between cursor-pointer"
              >
                <span>View Overdue Invoices</span>
                <ArrowRight className="size-3" />
              </Button>
            </Link>
          </div>

          {/* Low Stock Item */}
          <div className="flex flex-col justify-between p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <PackageX className="size-3.5" /> Low Inventory
                </span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {lowStockCount} items
                </span>
              </div>
              <p className="text-base font-black text-foreground">
                {lowStockCount > 0 ? `${lowStockCount} Items Below Min Stock` : "Stock Levels Healthy"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Reorder suggestions ready
              </p>
            </div>
            <Link href="/items" className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs font-semibold text-amber-600 border-amber-500/40 hover:bg-amber-500/10 justify-between cursor-pointer"
              >
                <span>Review Inventory</span>
                <ArrowRight className="size-3" />
              </Button>
            </Link>
          </div>

          {/* Pending Reconciliation Item */}
          <div className="flex flex-col justify-between p-3.5 rounded-xl border border-primary/30 bg-primary/5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <DollarSign className="size-3.5" /> Unpaid Payments
                </span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {pendingPaymentCount}
                </span>
              </div>
              <p className="text-base font-black text-foreground">
                {pendingPaymentCount > 0 ? `${pendingPaymentCount} Invoices Pending Pay` : "Fully Reconciled"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Log cash/bank payment entry
              </p>
            </div>
            <Link href="/payments" className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs font-semibold text-primary border-primary/40 hover:bg-primary/10 justify-between cursor-pointer"
              >
                <span>Reconcile Payments</span>
                <ArrowRight className="size-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
