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
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div className="inline-flex h-8 items-center rounded-lg bg-zinc-950 p-1 text-xs text-zinc-400 border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs transition-all cursor-pointer ${
              activeTab === "ALL"
                ? "bg-zinc-800 text-white shadow-xs font-semibold border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200 font-medium"
            }`}
          >
            <span>All Transactions</span>
            <span className="rounded bg-zinc-900 border border-zinc-750 px-1.5 py-0.2 font-mono text-[10px] text-zinc-300">
              {allTransactions.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("SALE")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs transition-all cursor-pointer ${
              activeTab === "SALE"
                ? "bg-zinc-800 text-white shadow-xs font-semibold border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200 font-medium"
            }`}
          >
            <span>Sales</span>
            <span className="rounded bg-zinc-900 border border-zinc-750 px-1.5 py-0.2 font-mono text-[10px] text-zinc-300">
              {sales.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PURCHASE")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs transition-all cursor-pointer ${
              activeTab === "PURCHASE"
                ? "bg-zinc-800 text-white shadow-xs font-semibold border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200 font-medium"
            }`}
          >
            <span>Purchases</span>
            <span className="rounded bg-zinc-900 border border-zinc-750 px-1.5 py-0.2 font-mono text-[10px] text-zinc-300">
              {purchases.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("EXPENSE")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs transition-all cursor-pointer ${
              activeTab === "EXPENSE"
                ? "bg-zinc-800 text-white shadow-xs font-semibold border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200 font-medium"
            }`}
          >
            <span>Expenses</span>
            <span className="rounded bg-zinc-900 border border-zinc-750 px-1.5 py-0.2 font-mono text-[10px] text-zinc-300">
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
          className="text-xs text-purple-400 hover:text-purple-300 font-medium hover:underline flex items-center gap-1"
        >
          View All &rarr;
        </Link>
      </div>

      {activeTab === "EXPENSE" ? (
        expenses.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            No expenses logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400 text-xs">Ref No.</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Category</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Date</TableHead>
                  <TableHead className="text-right text-zinc-400 text-xs">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.slice(0, 8).map((exp) => (
                  <TableRow key={exp.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
                    <TableCell className="font-mono text-xs font-semibold text-zinc-200">{exp.number}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[11px]">
                        {exp.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400">
                      {format(new Date(exp.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-bold text-rose-400 font-mono text-xs">
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
              <div className="py-12 text-center text-xs text-zinc-400">
                No transactions found. Click &quot;Quick Create&quot; above to add one.
              </div>
            );
          }

          return (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 text-xs">Type</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Bill No.</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Party Name</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Date</TableHead>
                    <TableHead className="text-zinc-400 text-xs">Status</TableHead>
                    <TableHead className="text-right text-zinc-400 text-xs">Balance Due</TableHead>
                    <TableHead className="text-right text-zinc-400 text-xs">Total Amount</TableHead>
                    <TableHead className="text-right w-12 text-zinc-400 text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.slice(0, 8).map((tx) => {
                    const isSale = tx.documentType === "SALE";
                    const balance = Math.max(tx.total - tx.paidAmount, 0);

                    return (
                      <TableRow key={tx.id} className="group border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                              isSale
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-sky-500/15 text-sky-400 border border-sky-500/30"
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
                            className="text-zinc-200 hover:text-purple-400 hover:underline transition-colors"
                          >
                            {tx.invoiceNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium text-xs text-zinc-300">
                          {tx.customer?.name || "Cash Customer"}
                        </TableCell>
                        <TableCell className="text-xs text-zinc-400">
                          {format(new Date(tx.issueDate), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          <InvoiceStatusBadge status={tx.status} />
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">
                          {balance > 0 ? (
                            <span className="text-rose-400 font-semibold">
                              {formatCurrency(balance, currency)}
                            </span>
                          ) : (
                            <span className="text-zinc-500 font-normal">₹ 0.00</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-xs text-white tabular-nums">
                          {formatCurrency(tx.total, currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/invoices/${tx.id}`}
                            className="inline-flex size-7 items-center justify-center rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
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
