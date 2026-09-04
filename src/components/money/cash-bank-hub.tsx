"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeftRight,
  Building2,
  Calendar,
  CreditCard,
  FileCheck,
  Landmark,
  MoreVertical,
  Plus,
  Printer,
  QrCode,
  Receipt,
  Search,
  Trash2,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  BankAccountFormDialog,
  DeleteBankAccountButton,
} from "@/components/money/bank-account-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/invoice-utils";

type CashBankTab = "banks" | "cash" | "cheques" | "loans";

export function CashBankHub({
  initialTab = "banks",
  accounts,
  cheques = [],
  currency = "INR",
}: {
  initialTab?: CashBankTab;
  accounts: any[];
  cheques?: any[];
  currency?: string;
}) {
  const [activeTab, setActiveTab] = useState<CashBankTab>(initialTab);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDate, setTransferDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const bankOnlyAccounts = accounts.filter((a) => a.accountType === "BANK");
  const cashAccounts = accounts.filter((a) => a.accountType === "CASH");
  const totalBankBalance = bankOnlyAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalCashBalance = cashAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferFrom || !transferTo || !transferAmount) {
      toast.error("Please fill all transfer fields");
      return;
    }
    toast.success(`Transferred ₹${transferAmount} successfully!`);
    setTransferOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching media_1788527453801.png */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {activeTab === "banks"
              ? "Banks"
              : activeTab === "cash"
              ? "Cash In Hand"
              : activeTab === "cheques"
              ? "Cheques"
              : "Loan Accounts"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "banks" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTransferOpen(true)}
              className="h-8 text-xs font-semibold rounded-xl"
            >
              <ArrowLeftRight className="mr-1.5 size-3.5" />
              Transfer Money
            </Button>
          )}

          <BankAccountFormDialog
            trigger={
              <Button className="h-8 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold px-3 text-xs shadow-xs cursor-pointer">
                <Plus className="mr-1.5 size-3.5" />
                Add Bank Account
              </Button>
            }
          />

          <button
            type="button"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>

      {/* Navigation Submenu Tabs matching left sidebar in Vyapar */}
      <div className="flex items-center gap-1 border-b border-border/60 pb-1 text-xs">
        {[
          { id: "banks", label: "Bank Accounts", count: bankOnlyAccounts.length, href: "/cash-bank/banks" },
          { id: "cash", label: "Cash In Hand", count: cashAccounts.length, href: "/cash-bank/cash" },
          { id: "cheques", label: "Cheques", count: cheques.length, href: "/cash-bank/cheques" },
          { id: "loans", label: "Loan Accounts", count: 1, href: "/cash-bank/loans" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as CashBankTab)}
            className={`flex items-center gap-1.5 px-4 py-2 font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? "border-[#ef4444] text-[#ef4444] bg-[#ef4444]/5"
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

      {/* TAB 1: BANK ACCOUNTS (Pixel-Perfect media_1788527453801.png) */}
      {activeTab === "banks" && (
        <div className="space-y-6">
          {/* Hero Box */}
          <div className="rounded-2xl border border-border/70 bg-card p-8 text-center space-y-6">
            <div className="space-y-1.5 max-w-xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Manage Multiple Bank Accounts
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                With Vyapar you can manage multiple banks and payment types like UPI, Net Banking and Credit Card
              </p>
            </div>

            {/* Bank Building Graphic with Flying Gold Coins */}
            <div className="relative mx-auto flex size-44 items-center justify-center">
              {/* Flying Gold Coins */}
              <div className="absolute top-2 left-6 size-7 rounded-full bg-amber-400 border-2 border-amber-500 shadow-md flex items-center justify-center text-amber-950 font-bold text-[10px]">
                ₹
              </div>
              <div className="absolute top-0 right-8 size-8 rounded-full bg-amber-400 border-2 border-amber-500 shadow-md flex items-center justify-center text-amber-950 font-bold text-xs">
                ₹
              </div>
              <div className="absolute bottom-6 left-2 size-6 rounded-full bg-amber-400 border-2 border-amber-500 shadow-md flex items-center justify-center text-amber-950 font-bold text-[9px]">
                ₹
              </div>
              <div className="absolute bottom-4 right-4 size-7 rounded-full bg-amber-400 border-2 border-amber-500 shadow-md flex items-center justify-center text-amber-950 font-bold text-[10px]">
                ₹
              </div>

              {/* Classical Bank Building Graphic */}
              <div className="relative flex flex-col items-center justify-end size-36 rounded-2xl bg-gradient-to-b from-muted/30 to-muted/80 p-2 border border-border/80 shadow-lg">
                {/* Triangular Pediment / Roof */}
                <div className="w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[26px] border-b-zinc-400 dark:border-b-zinc-600 mb-1 relative">
                  {/* Vyapar Red Emblem on roof */}
                  <div className="absolute -bottom-5 -left-2 size-4 rounded-full bg-[#ef4444] text-white flex items-center justify-center text-[8px] font-black">
                    V
                  </div>
                </div>

                {/* Roof Base Bar */}
                <div className="w-28 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-xs mb-1" />

                {/* 4 Pillars & Center Door */}
                <div className="flex items-end justify-between w-24 h-16 px-1">
                  <div className="w-2.5 h-full bg-zinc-300 dark:bg-zinc-500 rounded-xs" />
                  <div className="w-2.5 h-full bg-zinc-300 dark:bg-zinc-500 rounded-xs" />
                  <div className="w-6 h-10 bg-zinc-800 dark:bg-zinc-950 rounded-t-sm" />
                  <div className="w-2.5 h-full bg-zinc-300 dark:bg-zinc-500 rounded-xs" />
                  <div className="w-2.5 h-full bg-zinc-300 dark:bg-zinc-500 rounded-xs" />
                </div>

                {/* Building Base Steps */}
                <div className="w-32 h-2.5 bg-zinc-400 dark:bg-zinc-600 rounded-xs mt-1" />
              </div>
            </div>

            {/* 3 Feature Cards matching media_1788527453801.png */}
            <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto text-left">
              {/* Feature 1: Print Bank Details on Invoices */}
              <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-500 shrink-0">
                  <Printer className="size-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Print Bank Details on Invoices
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Print account details on invoices and get payments via NEFT/RTGS/IMPS.
                  </p>
                </div>
              </div>

              {/* Feature 2: Unlimited Payment Types */}
              <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-500 shrink-0">
                  <Landmark className="size-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Unlimited Payment Types
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Record transactions by methods like Banks, UPI, Net Banking and Cards.
                  </p>
                </div>
              </div>

              {/* Feature 3: Print UPI QR Code on Invoices */}
              <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-500 shrink-0">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Print UPI QR Code on Invoices
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Print QR code on your invoices or send payment links to your customers.
                  </p>
                </div>
              </div>
            </div>

            {/* Big Red Button matching media_1788527453801.png */}
            <div className="pt-2">
              <BankAccountFormDialog
                trigger={
                  <Button className="h-10 rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold px-8 text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer">
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
                Active Bank Accounts ({bankOnlyAccounts.length})
              </h3>
              <span className="text-xs font-mono font-bold text-foreground">
                Total Bank Balance: {formatCurrency(totalBankBalance, currency)}
              </span>
            </div>

            {bankOnlyAccounts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                No bank accounts registered yet. Click &quot;+ Add Bank Account&quot; above to link your first account.
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
              href="/payment-in"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#ef4444] text-white px-4 py-2 text-xs font-semibold shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Record Cash Receipt</span>
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

      {/* TAB 3: CHEQUES */}
      {activeTab === "cheques" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Cheque Payment Records ({cheques.length})
            </h3>
            <Link href="/payment-in" className="text-xs text-primary hover:underline font-semibold">
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

      {/* TAB 4: LOAN ACCOUNTS */}
      {activeTab === "loans" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Loan &amp; Overdraft Accounts</h3>
              <p className="text-xs text-muted-foreground">Track business loans, OD/CC limits, and EMI interest deductions.</p>
            </div>
            <Button size="sm" onClick={() => toast.info("Opening Loan Account setup...")} className="h-8 text-xs font-bold bg-[#ef4444] text-white">
              <Plus className="mr-1.5 size-3.5" />
              Add Loan Account
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">HDFC Term Loan (Machinery)</span>
                <Badge className="bg-sky-500/15 text-sky-500 border-none text-[10px]">TERM LOAN</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground font-sans">Principal</span>
                  <p className="font-bold">₹ 5,00,000</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-sans">Outstanding</span>
                  <p className="font-bold text-rose-500">₹ 3,24,500</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-sans">Interest Rate</span>
                  <p>9.5% p.a.</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-sans">Monthly EMI</span>
                  <p>₹ 14,200</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inter-Bank Transfer Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ArrowLeftRight className="size-4 text-primary" />
              Transfer Money Between Accounts
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransfer} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <Label>Transfer From *</Label>
              <select
                value={transferFrom}
                onChange={(e) => setTransferFrom(e.target.value)}
                className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs"
                required
              >
                <option value="">Select Account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Balance: ₹{a.balance || 0})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Transfer To *</Label>
              <select
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs"
                required
              >
                <option value="">Select Account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Balance: ₹{a.balance || 0})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Amount (₹) *</Label>
                <Input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-8 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="h-8 text-xs font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setTransferOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">
                Confirm Transfer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
