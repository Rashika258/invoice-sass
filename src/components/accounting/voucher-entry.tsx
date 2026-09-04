"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Save, ChevronDown, AlertCircle, CheckCircle2, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createVoucher } from "@/actions/accounting";

type VoucherType = "CONTRA" | "PAYMENT" | "RECEIPT" | "JOURNAL" | "SALES" | "PURCHASE";
type BalanceType = "DR" | "CR";

interface Ledger {
  id: string;
  name: string;
  group: string;
}

interface EntryRow {
  id: string;
  ledgerId: string;
  ledgerName: string;
  type: BalanceType;
  amount: string;
}

interface VoucherEntryProps {
  ledgers: Ledger[];
}

const VOUCHER_CONFIG: Record<VoucherType, {
  label: string; key: string; color: string; defaultDr: string; defaultCr: string;
}> = {
  CONTRA:   { label: "Contra",   key: "F4", color: "bg-zinc-700 text-zinc-200",        defaultDr: "Bank Account",     defaultCr: "Cash" },
  PAYMENT:  { label: "Payment",  key: "F5", color: "bg-rose-600 text-white",            defaultDr: "Sundry Creditors", defaultCr: "Cash" },
  RECEIPT:  { label: "Receipt",  key: "F6", color: "bg-emerald-600 text-white",         defaultDr: "Cash",             defaultCr: "Sundry Debtors" },
  JOURNAL:  { label: "Journal",  key: "F7", color: "bg-violet-600 text-white",          defaultDr: "",                 defaultCr: "" },
  SALES:    { label: "Sales",    key: "F8", color: "bg-brand text-white",               defaultDr: "Sundry Debtors",   defaultCr: "Sales Account" },
  PURCHASE: { label: "Purchase", key: "F9", color: "bg-amber-600 text-white",           defaultDr: "Purchase Account", defaultCr: "Sundry Creditors" },
};

const VOUCHER_ORDER: VoucherType[] = ["CONTRA", "PAYMENT", "RECEIPT", "JOURNAL", "SALES", "PURCHASE"];

function newRow(type: BalanceType = "DR"): EntryRow {
  return { id: Math.random().toString(36).slice(2), ledgerId: "", ledgerName: "", type, amount: "" };
}

export function VoucherEntry({ ledgers }: VoucherEntryProps) {
  const [voucherType, setVoucherType] = useState<VoucherType>("RECEIPT");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [narration, setNarration] = useState("");
  const [reference, setReference] = useState("");
  const [rows, setRows] = useState<EntryRow[]>([newRow("DR"), newRow("CR")]);
  const [saving, setSaving] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const narrationRef = useRef<HTMLInputElement>(null);

  // F4–F9 keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" && !["F4","F5","F6","F7","F8","F9"].includes(e.key)) return;
      const map: Record<string, VoucherType> = {
        F4: "CONTRA", F5: "PAYMENT", F6: "RECEIPT", F7: "JOURNAL", F8: "SALES", F9: "PURCHASE",
      };
      if (map[e.key]) {
        e.preventDefault();
        setVoucherType(map[e.key]);
      }
      if (e.altKey && e.key === "s") { e.preventDefault(); handleSave(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [rows, narration, date, voucherType, reference]);

  const drTotal = rows.filter((r) => r.type === "DR").reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const crTotal = rows.filter((r) => r.type === "CR").reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const isBalanced = Math.abs(drTotal - crTotal) < 0.01 && drTotal > 0;

  const updateRow = (id: string, patch: Partial<EntryRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = (type: BalanceType) => {
    setRows((prev) => [...prev, newRow(type)]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = async () => {
    if (!isBalanced) { toast.error("Voucher out of balance — Dr must equal Cr"); return; }
    const incomplete = rows.some((r) => !r.ledgerId || !r.amount || parseFloat(r.amount) <= 0);
    if (incomplete) { toast.error("All rows must have a ledger and amount"); return; }

    setSaving(true);
    try {
      await createVoucher({
        voucherType,
        date,
        narration,
        reference,
        entries: rows.map((r) => ({ ledgerId: r.ledgerId, type: r.type, amount: parseFloat(r.amount) })),
      });
      toast.success(`${VOUCHER_CONFIG[voucherType].label} voucher posted successfully!`);
      setRows([newRow("DR"), newRow("CR")]);
      setNarration("");
      setReference("");
    } catch (err: any) {
      toast.error(err.message || "Failed to post voucher");
    } finally {
      setSaving(false);
    }
  };

  const filteredLedgers = (search: string) =>
    ledgers.filter((l) => l.name.toLowerCase().includes((search || "").toLowerCase())).slice(0, 10);

  const cfg = VOUCHER_CONFIG[voucherType];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Voucher Type Switcher */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex border-b border-border bg-muted/30">
          {VOUCHER_ORDER.map((type) => {
            const c = VOUCHER_CONFIG[type];
            const isActive = type === voucherType;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setVoucherType(type)}
                className={`flex-1 py-2.5 text-center text-xs font-bold cursor-pointer transition-all relative ${
                  isActive ? c.color : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="hidden sm:inline">{c.label} </span>
                <span className="text-[10px] opacity-70 font-mono">({c.key})</span>
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-t" />}
              </button>
            );
          })}
        </div>

        <div className="p-5 space-y-5">
          {/* Voucher Meta */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Voucher Type</Label>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black ${cfg.color}`}>
                {cfg.label} Voucher
                <Badge variant="outline" className="border-current text-[9px] font-mono opacity-70">{cfg.key}</Badge>
              </div>
            </div>
            <div className="space-y-1 flex-1 min-w-[140px] max-w-[180px]">
              <Label className="text-xs font-semibold">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1 flex-1 min-w-[150px]">
              <Label className="text-xs font-semibold">Reference / Cheque No.</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. CHQ-004521"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Dr / Cr Entry Table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="py-2 px-3 text-left font-bold text-muted-foreground w-20">Dr / Cr</th>
                  <th className="py-2 px-3 text-left font-bold text-muted-foreground">Ledger Account</th>
                  <th className="py-2 px-3 text-right font-bold text-muted-foreground w-36">Amount (₹)</th>
                  <th className="py-2 px-3 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                    {/* Dr / Cr toggle */}
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() => updateRow(row.id, { type: row.type === "DR" ? "CR" : "DR" })}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-black cursor-pointer border transition-all ${
                          row.type === "DR"
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                        }`}
                      >
                        {row.type}
                      </button>
                    </td>
                    {/* Ledger selector */}
                    <td className="py-2 px-3 relative">
                      <Input
                        value={ledgerSearch[row.id] ?? row.ledgerName}
                        onChange={(e) => {
                          setLedgerSearch((p) => ({ ...p, [row.id]: e.target.value }));
                          setOpenDropdown(row.id);
                          if (!e.target.value) updateRow(row.id, { ledgerId: "", ledgerName: "" });
                        }}
                        onFocus={() => setOpenDropdown(row.id)}
                        placeholder="Search ledger..."
                        className="h-7 text-xs"
                      />
                      {openDropdown === row.id && (
                        <div className="absolute left-3 right-3 top-full z-50 rounded-xl border border-border bg-card shadow-xl mt-1 max-h-48 overflow-y-auto">
                          {filteredLedgers(ledgerSearch[row.id] || "").map((l) => (
                            <button
                              key={l.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                updateRow(row.id, { ledgerId: l.id, ledgerName: l.name });
                                setLedgerSearch((p) => ({ ...p, [row.id]: l.name }));
                                setOpenDropdown(null);
                              }}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-brand-light hover:text-brand transition-colors flex items-center justify-between"
                            >
                              <span className="font-semibold">{l.name}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{l.group.replace(/_/g, " ")}</span>
                            </button>
                          ))}
                          {filteredLedgers(ledgerSearch[row.id] || "").length === 0 && (
                            <div className="px-3 py-2 text-xs text-muted-foreground">No ledger found</div>
                          )}
                        </div>
                      )}
                    </td>
                    {/* Amount */}
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.amount}
                        onChange={(e) => updateRow(row.id, { amount: e.target.value })}
                        placeholder="0.00"
                        className="h-7 text-xs font-mono text-right"
                      />
                    </td>
                    {/* Remove */}
                    <td className="py-2 px-2">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length <= 2}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Totals row */}
              <tfoot className="bg-muted/40 border-t border-border">
                <tr>
                  <td className="py-2 px-3 text-xs font-black text-muted-foreground" colSpan={2}>
                    Total
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="text-[11px] font-mono space-y-0.5">
                      <div className="text-rose-600 font-bold">Dr ₹{drTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                      <div className="text-emerald-600 font-bold">Cr ₹{crTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                    </div>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Add row buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addRow("DR")}
              className="inline-flex items-center gap-1 text-xs text-rose-600 font-bold hover:underline cursor-pointer"
            >
              <Plus className="size-3.5" /> Add Dr Row
            </button>
            <span className="text-muted-foreground text-xs">·</span>
            <button
              type="button"
              onClick={() => addRow("CR")}
              className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
            >
              <Plus className="size-3.5" /> Add Cr Row
            </button>
          </div>

          {/* Narration */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Narration</Label>
            <Input
              ref={narrationRef}
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="e.g. Being payment received from Venkatesh Kumar against INV-2026-0048"
              className="h-8 text-xs"
            />
          </div>

          {/* Balance indicator + Save */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/50">
            <div className={`flex items-center gap-1.5 text-xs font-bold ${isBalanced ? "text-emerald-600" : "text-rose-500"}`}>
              {isBalanced ? (
                <><CheckCircle2 className="size-4" /> Voucher Balanced — Dr = Cr</>
              ) : (
                <><AlertCircle className="size-4" /> Out of Balance by ₹{Math.abs(drTotal - crTotal).toFixed(2)}</>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setRows([newRow("DR"), newRow("CR")]); setNarration(""); }}
                className="text-xs rounded-xl border-border"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !isBalanced}
                className="bg-brand text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-90 cursor-pointer"
              >
                <Save className="mr-1.5 size-3.5" />
                {saving ? "Posting..." : "Post Voucher (Alt+S)"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-2.5 flex items-center gap-2 text-xs text-muted-foreground">
        <Keyboard className="size-3.5 shrink-0" />
        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground font-mono text-[10px]">F4</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground font-mono text-[10px]">F9</kbd> to switch voucher type · <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground font-mono text-[10px]">Alt+S</kbd> to save · Click Dr/Cr cell to toggle</span>
      </div>
    </div>
  );
}
