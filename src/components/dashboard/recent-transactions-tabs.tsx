"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, Eye, FileText, ShoppingBag } from "lucide-react";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="inline-flex h-8 items-center rounded-lg bg-muted/60 p-0.5 text-xs text-muted-foreground border border-border/50">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all cursor-pointer ${
              activeTab === "ALL"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "hover:text-foreground font-medium"
            }`}
          >
            <span>All Transactions</span>
            <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
              {allTransactions.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("SALE")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all cursor-pointer ${
              activeTab === "SALE"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "hover:text-foreground font-medium"
            }`}
          >
            <span>Sales</span>
            <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
              {sales.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PURCHASE")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all cursor-pointer ${
              activeTab === "PURCHASE"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "hover:text-foreground font-medium"
            }`}
          >
            <span>Purchases</span>
            <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
              {purchases.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("EXPENSE")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all cursor-pointer ${
              activeTab === "EXPENSE"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "hover:text-foreground font-medium"
            }`}
          >
            <span>Expenses</span>
            <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
              {expenses.length}
            </span>
          </button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          render={
            <Link
              href={
                activeTab === "PURCHASE"
                  ? "/purchases"
                  : activeTab === "EXPENSE"
                    ? "/expenses"
                    : "/invoices"
              }
            />
          }
          className="h-8 text-xs text-muted-foreground hover:text-foreground font-medium"
        >
          View All →
        </Button>
      </div>

      {activeTab === "EXPENSE" ? (
        expenses.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No expenses logged yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Ref No.</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.slice(0, 8).map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="font-mono text-xs font-semibold">{exp.number}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      {exp.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(exp.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right font-bold text-rose-600">
                    -{formatCurrency(exp.amount + exp.taxAmount, currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              <div className="py-12 text-center text-sm text-muted-foreground">
                No transactions found. Click &quot;Add Sale&quot; or &quot;Add Purchase&quot; above to create one.
              </div>
            );
          }

          return (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Type</TableHead>
                  <TableHead>Bill No.</TableHead>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Balance Due</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right w-16">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.slice(0, 10).map((tx) => {
                  const isSale = tx.documentType === "SALE";
                  const balance = Math.max(tx.total - tx.paidAmount, 0);

                  return (
                    <TableRow key={tx.id} className="group hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            isSale
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
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
                          className="hover:text-primary hover:underline transition-colors"
                        >
                          {tx.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {tx.customer?.name || "Cash Customer"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(tx.issueDate), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={tx.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs tabular-nums">
                        {balance > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 font-medium">
                            {formatCurrency(balance, currency)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">₹ 0.00</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs tabular-nums">
                        {formatCurrency(tx.total, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/invoices/${tx.id}`}
                          className="inline-flex size-7 items-center justify-center rounded-md hover:bg-muted opacity-70 group-hover:opacity-100 transition-opacity"
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
          );
        })()
      )}
    </div>
  );
}
