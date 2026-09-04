"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Building2,
  CreditCard,
  FileCheck,
  Landmark,
  Plus,
  Printer,
  QrCode,
  Receipt,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  BankAccountFormDialog,
  DeleteBankAccountButton,
} from "@/components/money/bank-account-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/invoice-utils";

type CashBankTab = "banks" | "cash" | "cheques";

export function CashBankHub({
  accounts,
  cheques = [],
  currency = "INR",
}: {
  accounts: any[];
  cheques?: any[];
  currency?: string;
}) {
  const [activeTab, setActiveTab] = useState<CashBankTab>("banks");

  const bankOnlyAccounts = accounts.filter((a) => a.accountType === "BANK");
  const cashAccounts = accounts.filter((a) => a.accountType === "CASH");
  const totalBankBalance = bankOnlyAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalCashBalance = cashAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header matching media_1788511629988.png */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Banks &amp; Accounts</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage multiple bank accounts, cash registers, and payments in real-time.
          </p>
        </div>

        {/* Real working Add Account Dialog */}
        <BankAccountFormDialog
          trigger={
            <Button className="h-9 rounded-xl bg-primary text-primary-foreground font-semibold px-4 text-xs shadow-xs cursor-pointer">
              <Plus className="mr-1.5 size-4" />
              Add Bank Account
            </Button>
          }
        />
      </div>

      {/* Submenu Tabs matching left sidebar in media_1788511629988.png */}
      <div className="flex items-center gap-1 border-b border-border/60 pb-1">
        {[
          { id: "banks", label: "Bank Accounts", count: bankOnlyAccounts.length },
          { id: "cash", label: "Cash In Hand", count: cashAccounts.length },
          { id: "cheques", label: "Cheque Records", count: cheques.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as CashBankTab)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{tab.label}</span>
            <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-mono">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: BANK ACCOUNTS (Matching media_1788511629988.png) */}
      {activeTab === "banks" && (
        <div className="space-y-6">
          {/* Hero Illustration Box */}
          <div className="rounded-2xl border border-border/80 bg-card p-8 text-center space-y-6">
            <div className="relative mx-auto flex size-36 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl" />
              <div className="relative flex size-28 items-center justify-center rounded-2xl border border-border bg-gradient-to-b from-card to-muted shadow-md">
                <Building2 className="size-14 text-amber-500" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Manage Multiple Bank Accounts
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                With Vyapar you can manage multiple banks and payment types like UPI, Net Banking and Credit Card.
              </p>
            </div>

            {/* 2 Feature Cards from media_1788511629988.png */}
            <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto text-left">
              <div className="flex items-start gap-3.5 rounded-xl border border-border/80 bg-muted/30 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/15 text-sky-500 shrink-0">
                  <Printer className="size-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Print Bank Details on Invoices
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Print account details on invoices and get payments via NEFT / RTGS / IMPS / UPI QR code.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-border/80 bg-muted/30 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500 shrink-0">
                  <Landmark className="size-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Unlimited Payment Types
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Record transactions by methods like Banks, UPI, Net Banking and Cards with auto ledger sync.
                  </p>
                </div>
              </div>
            </div>

            {/* Big Action Button */}
            <div>
              <BankAccountFormDialog
                trigger={
                  <Button className="h-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 text-xs shadow-md cursor-pointer">
                    <Plus className="mr-1.5 size-4" />
                    + Add Bank Account
                  </Button>
                }
              />
            </div>
          </div>

          {/* Connected Bank Accounts List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Connected Bank Accounts ({bankOnlyAccounts.length})
              </h3>
              <span className="text-xs font-mono font-bold text-primary">
                Total: {formatCurrency(totalBankBalance, currency)}
              </span>
            </div>

            {bankOnlyAccounts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                No bank accounts registered yet. Click &quot;Add Bank Account&quot; above to link your first account.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {bankOnlyAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4 transition-all hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 font-bold text-sm">
                          <Building2 className="size-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{account.name}</h4>
                          <p className="font-mono text-xs text-muted-foreground mt-0.5">
                            {account.accountNumber ? `A/C: ${account.accountNumber}` : "No A/C number"}
                            {account.ifsc ? ` • IFSC: ${account.ifsc}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <BankAccountFormDialog
                          account={account}
                          trigger={
                            <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground">
                              Edit
                            </Button>
                          }
                        />
                        <DeleteBankAccountButton id={account.id} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase">Current Balance</span>
                        <p className="font-mono text-lg font-bold text-foreground">
                          {formatCurrency(account.balance, currency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground uppercase">Opening</span>
                        <p className="font-mono text-xs font-semibold text-muted-foreground">
                          {formatCurrency(account.openingBalance, currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CASH IN HAND */}
      {activeTab === "cash" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                <Wallet className="size-6" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Total Cash in Drawer</span>
                <p className="text-2xl font-bold font-mono text-foreground mt-0.5">
                  {formatCurrency(totalCashBalance, currency)}
                </p>
              </div>
            </div>
            <Link
              href="/payments"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Record Payment In/Out</span>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {cashAccounts.map((account) => (
              <div key={account.id} className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold">{account.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    Balance: {formatCurrency(account.balance, currency)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <BankAccountFormDialog
                    account={account}
                    trigger={
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                        Edit
                      </Button>
                    }
                  />
                  <DeleteBankAccountButton id={account.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CHEQUE RECORDS */}
      {activeTab === "cheques" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Cheque Payment Records ({cheques.length})
            </h3>
            <Link href="/payments" className="text-xs text-primary hover:underline font-semibold">
              + New Payment
            </Link>
          </div>

          {cheques.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
              No payments recorded with payment mode &quot;CHEQUE&quot;.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment No.</TableHead>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Reference / Cheque No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cheques.map((chq: any) => (
                  <TableRow key={chq.id}>
                    <TableCell className="font-mono text-xs font-semibold">{chq.number}</TableCell>
                    <TableCell className="text-xs font-medium">{chq.party?.name || "Cash / Direct"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{chq.reference || "CHEQUE"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(chq.date), "dd MMM yyyy")}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-emerald-500">
                      {formatCurrency(chq.amount, currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
