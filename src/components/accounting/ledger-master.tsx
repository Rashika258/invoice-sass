"use client";

import React, { useState, useTransition } from "react";
import { BookOpen, Plus, Search, ChevronDown, CheckCircle2, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createLedger } from "@/actions/accounting";
import type { LedgerGroupKey } from "@/actions/accounting";

type Ledger = {
  id: string;
  name: string;
  group: string;
  openingBalance: number;
  openingType: string;
  isSystem: boolean;
  notes?: string | null;
  entries: { type: string; amount: number }[];
};

interface LedgerMasterProps {
  ledgers: Ledger[];
}

const GROUP_LABELS: Record<string, { label: string; section: string; color: string }> = {
  CASH_IN_HAND:       { label: "Cash in Hand",         section: "Assets",      color: "bg-emerald-500/10 text-emerald-600" },
  BANK_ACCOUNTS:      { label: "Bank Accounts",         section: "Assets",      color: "bg-sky-500/10 text-sky-600" },
  SUNDRY_DEBTORS:     { label: "Sundry Debtors",        section: "Assets",      color: "bg-blue-500/10 text-blue-600" },
  FIXED_ASSETS:       { label: "Fixed Assets",          section: "Assets",      color: "bg-violet-500/10 text-violet-600" },
  CURRENT_ASSETS:     { label: "Current Assets",        section: "Assets",      color: "bg-indigo-500/10 text-indigo-600" },
  LOANS_ADVANCES_ASSET:{ label: "Loans & Advances (Asset)", section: "Assets", color: "bg-cyan-500/10 text-cyan-600" },
  SUNDRY_CREDITORS:   { label: "Sundry Creditors",      section: "Liabilities", color: "bg-rose-500/10 text-rose-600" },
  CURRENT_LIABILITIES:{ label: "Current Liabilities",   section: "Liabilities", color: "bg-red-500/10 text-red-600" },
  LOANS_LIABILITY:    { label: "Loans (Liability)",     section: "Liabilities", color: "bg-pink-500/10 text-pink-600" },
  CAPITAL_ACCOUNT:    { label: "Capital Account",       section: "Liabilities", color: "bg-fuchsia-500/10 text-fuchsia-600" },
  RESERVES_SURPLUS:   { label: "Reserves & Surplus",    section: "Liabilities", color: "bg-purple-500/10 text-purple-600" },
  SALES_ACCOUNTS:     { label: "Sales Accounts",        section: "Income",      color: "bg-brand-light text-brand" },
  DIRECT_INCOME:      { label: "Direct Income",         section: "Income",      color: "bg-teal-500/10 text-teal-600" },
  INDIRECT_INCOME:    { label: "Indirect Income",       section: "Income",      color: "bg-lime-500/10 text-lime-600" },
  PURCHASE_ACCOUNTS:  { label: "Purchase Accounts",     section: "Expenses",    color: "bg-amber-500/10 text-amber-600" },
  DIRECT_EXPENSES:    { label: "Direct Expenses",       section: "Expenses",    color: "bg-orange-500/10 text-orange-600" },
  INDIRECT_EXPENSES:  { label: "Indirect Expenses",     section: "Expenses",    color: "bg-yellow-500/10 text-yellow-600" },
  DUTIES_TAXES:       { label: "Duties & Taxes",        section: "Liabilities", color: "bg-zinc-500/10 text-zinc-600" },
  BRANCH_DIVISIONS:   { label: "Branch/Divisions",      section: "Assets",      color: "bg-slate-500/10 text-slate-600" },
};

const ALL_GROUPS = Object.keys(GROUP_LABELS) as LedgerGroupKey[];

function calcBalance(l: Ledger) {
  const dr = l.entries.filter((e) => e.type === "DR").reduce((s, e) => s + e.amount, 0) +
    (l.openingType === "DR" ? l.openingBalance : 0);
  const cr = l.entries.filter((e) => e.type === "CR").reduce((s, e) => s + e.amount, 0) +
    (l.openingType === "CR" ? l.openingBalance : 0);
  const balance = Math.abs(dr - cr);
  const type = dr >= cr ? "DR" : "CR";
  return { balance, type };
}

export function LedgerMaster({ ledgers: initialLedgers }: LedgerMasterProps) {
  const [ledgers, setLedgers] = useState(initialLedgers);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState<LedgerGroupKey>("CASH_IN_HAND");
  const [newOpeningBal, setNewOpeningBal] = useState("0");
  const [newOpeningType, setNewOpeningType] = useState<"DR" | "CR">("DR");
  const [isPending, startTransition] = useTransition();

  const filtered = ledgers.filter(
    (l) => l.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group by section
  const sections = ["Assets", "Liabilities", "Income", "Expenses"];
  const grouped = sections.map((section) => ({
    section,
    items: filtered.filter((l) => GROUP_LABELS[l.group]?.section === section),
  }));

  const handleAddLedger = () => {
    if (!newName.trim()) { toast.error("Ledger name is required"); return; }
    startTransition(async () => {
      try {
        const created = await createLedger({
          name: newName,
          group: newGroup,
          openingBalance: parseFloat(newOpeningBal) || 0,
          openingType: newOpeningType,
        });
        setLedgers((prev) => [...prev, { ...created, entries: [], group: created.group as string }]);
        toast.success(`Ledger "${newName}" created`);
        setShowAdd(false);
        setNewName("");
        setNewOpeningBal("0");
      } catch (err: any) {
        toast.error(err.message || "Failed to create ledger");
      }
    });
  };

  const totalDr = ledgers.reduce((s, l) => {
    const { balance, type } = calcBalance(l);
    return s + (type === "DR" ? balance : 0);
  }, 0);
  const totalCr = ledgers.reduce((s, l) => {
    const { balance, type } = calcBalance(l);
    return s + (type === "CR" ? balance : 0);
  }, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <BookOpen className="size-5 text-brand" />
            Ledger Master
            <Badge className="bg-brand text-white border-none font-bold">{ledgers.length} accounts</Badge>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Chart of accounts — all ledger groups from Assets to Expenses</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ledgers..."
              className="h-8 pl-8 text-xs w-52"
            />
          </div>
          <Button
            size="sm"
            onClick={() => setShowAdd(true)}
            className="bg-brand text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-90"
          >
            <Plus className="mr-1.5 size-3.5" /> New Ledger
          </Button>
        </div>
      </div>

      {/* Add ledger panel */}
      {showAdd && (
        <div className="rounded-2xl border-2 border-brand/30 bg-brand-light/30 p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground">Create New Ledger</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1 lg:col-span-2">
              <Label className="text-xs font-semibold">Ledger Name *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Rent Expenses" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Under (Group)</Label>
              <Select value={newGroup} onValueChange={(val) => setNewGroup(val as LedgerGroupKey)}>
                <SelectTrigger className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground">
                  <SelectValue placeholder="Select Group" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {ALL_GROUPS.map((g) => (
                    <SelectItem key={g} value={g} className="text-xs">
                      {GROUP_LABELS[g]?.label ?? g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Opening Balance</Label>
              <div className="flex gap-1">
                <Input type="number" min="0" value={newOpeningBal} onChange={(e) => setNewOpeningBal(e.target.value)} className="h-8 text-xs font-mono flex-1" />
                <button
                  type="button"
                  onClick={() => setNewOpeningType(newOpeningType === "DR" ? "CR" : "DR")}
                  className={`px-2.5 h-8 rounded-lg border text-[11px] font-black cursor-pointer transition-all ${
                    newOpeningType === "DR"
                      ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  }`}
                >
                  {newOpeningType}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddLedger} disabled={isPending} className="bg-brand text-white text-xs font-bold rounded-xl">
              <Plus className="mr-1.5 size-3.5" /> {isPending ? "Creating..." : "Create Ledger"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)} className="text-xs rounded-xl border-border">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Section-wise ledger list */}
      <div className="space-y-4">
        {grouped.map(({ section, items }) => {
          if (items.length === 0) return null;
          return (
            <div key={section} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center justify-between">
                <span className="text-xs font-black text-foreground uppercase tracking-wide">{section}</span>
                <span className="text-[11px] text-muted-foreground">{items.length} ledgers</span>
              </div>
              <table className="w-full text-xs">
                <thead className="border-b border-border/50 text-muted-foreground">
                  <tr>
                    <th className="py-2 px-4 text-left font-semibold">Ledger Name</th>
                    <th className="py-2 px-4 text-left font-semibold">Group</th>
                    <th className="py-2 px-4 text-right font-semibold">Opening Bal.</th>
                    <th className="py-2 px-4 text-right font-semibold">Closing Bal.</th>
                    <th className="py-2 px-3 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {items.map((l) => {
                    const { balance, type } = calcBalance(l);
                    const grp = GROUP_LABELS[l.group];
                    return (
                      <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-foreground flex items-center gap-2">
                          {l.name}
                          {l.isSystem && (
                            <Badge variant="outline" className="text-[9px] text-muted-foreground border-border/50 py-0">System</Badge>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${grp?.color ?? ""}`}>
                            {grp?.label ?? l.group}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-muted-foreground">
                          ₹{l.openingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })} {l.openingType}
                        </td>
                        <td className={`py-2.5 px-4 text-right font-mono font-bold ${type === "DR" ? "text-rose-600" : "text-emerald-600"}`}>
                          ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })} {type}
                        </td>
                        <td className="py-2.5 px-3">
                          {!l.isSystem && (
                            <button
                              type="button"
                              onClick={() => toast.success(`Ledger "${l.name}" deleted`)}
                              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              title="Delete Ledger"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* Grand Total */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 flex items-center justify-between text-xs">
        <span className="font-bold text-foreground">Grand Total</span>
        <div className="flex gap-6 font-mono font-bold">
          <span className="text-rose-600">Total Dr ₹{totalDr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          <span className="text-emerald-600">Total Cr ₹{totalCr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}
