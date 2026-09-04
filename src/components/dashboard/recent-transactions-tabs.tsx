"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, Eye } from "lucide-react";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/invoice-utils";

type TransactionItem = {
  id: string;
  invoiceNumber: string;
  documentType: string;
  issueDate: Date;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  total: number;
  paidAmount: number;
  customer?: { name: string } | null;
};

type ExpenseItem = {
  id: string;
  number: string;
  category: string;
  date: Date;
  amount: number;
  taxAmount: number;
};

export function RecentTransactionsTabs({
  sales,
  purchases,
  expenses,
  currency = "INR",
}: {
  sales: TransactionItem[];
  purchases: TransactionItem[];
  expenses: ExpenseItem[];
  currency?: string;
}) {
  const [activeTab, setActiveTab] = useState<"ALL" | "SALE" | "PURCHASE" | "EXPENSE">("ALL");

  const allTransactions = [
    ...sales.map((s) => ({ ...s, kind: "SALE" as const })),
    ...purchases.map((p) => ({ ...p, kind: "PURCHASE" as const })),
  ].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="inline-flex h-8 items-center rounded-lg bg-muted/50 p-1 text-xs text-muted-foreground border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs transition-all cursor-pointer font-medium ${
              activeTab === "ALL"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>All</span>
            <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px]">
              {allTransactions.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("SALE")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs transition-all cursor-pointer font-medium ${
              activeTab === "SALE"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Sales</span>
            <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px]">
              {sales.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PURCHASE")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs transition-all cursor-pointer font-medium ${
              activeTab === "PURCHASE"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Purchases</span>
            <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px]">
              {purchases.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("EXPENSE")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs transition-all cursor-pointer font-medium ${
              activeTab === "EXPENSE"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Expenses</span>
            <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px]">
              {expenses.length}
            </span>
          </button>
        </div>

        <Link
          href={
            activeTab === "PURCHASE"
              ? "/purchases"
              : activeTab === "EXPENSE"
                ? "/expenses"
                : "/invoices"
          }
          className="text-xs text-foreground font-medium hover:underline flex items-center gap-1"
        >
          View all &rarr;
        </Link>
      </div>

      {activeTab === "EXPENSE" ? (
        expenses.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No expenses recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">Ref No.</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Category</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                  <TableHead className="text-right text-muted-foreground text-xs">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.slice(0, 8).map((exp) => (
                  <TableRow key={exp.id} className="border-b border-border/60 hover:bg-muted/40">
                    <TableCell className="font-mono text-xs font-semibold text-foreground">{exp.number}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {exp.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(exp.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-medium font-mono text-xs text-rose-500">
                      -{formatCurrency(exp.amount + exp.taxAmount, currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : (
        (() => {
          const list =
            activeTab === "SALE"
              ? sales
              : activeTab === "PURCHASE"
                ? purchases
                : allTransactions;

          if (list.length === 0) {
            return (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No transactions recorded yet. Use &quot;Quick Create&quot; to issue an invoice.
              </div>
            );
          }

          return (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Type</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Bill No.</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Party</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground text-xs">Due</TableHead>
                    <TableHead className="text-right text-muted-foreground text-xs">Total</TableHead>
                    <TableHead className="text-right w-10 text-muted-foreground text-xs"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.slice(0, 8).map((tx) => {
                    const isSale = tx.documentType === "SALE";
                    const balance = Math.max(tx.total - tx.paidAmount, 0);

                    return (
                      <TableRow key={tx.id} className="group border-b border-border/60 hover:bg-muted/40 transition-colors">
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              isSale
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                            }`}
                          >
                            {isSale ? (
                              <ArrowDownLeft className="size-3" />
                            ) : (
                              <ArrowUpRight className="size-3" />
                            )}
                            {isSale ? "SALE" : "PURCHASE"}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold">
                          <Link
                            href={`/invoices/${tx.id}`}
                            className="text-foreground hover:underline transition-colors"
                          >
                            {tx.invoiceNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium text-xs text-foreground">
                          {tx.customer?.name || "Cash Customer"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(tx.issueDate), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          <InvoiceStatusBadge status={tx.status} />
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">
                          {balance > 0 ? (
                            <span className="text-rose-500 font-semibold">
                              {formatCurrency(balance, currency)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-normal">₹0.00</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-xs text-foreground tabular-nums">
                          {formatCurrency(tx.total, currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/invoices/${tx.id}`}
                            className="inline-flex size-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="View Bill"
                          >
                            <Eye className="size-3.5" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          );
        })()
      )}
    </div>
  );
}
