"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRightLeft,
  Wallet,
  Receipt,
  BookOpen,
  CircleDollarSign,
  ShoppingBag,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  Keyboard,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { InfoTooltip, SimpleTooltip } from "@/components/ui/tooltip";
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

const VOUCHER_CONFIG: Record<
  VoucherType,
  {
    label: string;
    key: string;
    icon: any;
    defaultDr: string;
    defaultCr: string;
    help: string;
  }
> = {
  CONTRA: {
    label: "Contra",
    key: "F4",
    icon: ArrowRightLeft,
    defaultDr: "Bank Account",
    defaultCr: "Cash",
    help: "Internal transfers between Cash and Bank accounts without affecting profit.",
  },
  PAYMENT: {
    label: "Payment",
    key: "F5",
    icon: Wallet,
    defaultDr: "Sundry Creditors",
    defaultCr: "Cash",
    help: "Cash or bank outflow to suppliers, vendors, or expenses.",
  },
  RECEIPT: {
    label: "Receipt",
    key: "F6",
    icon: Receipt,
    defaultDr: "Cash",
    defaultCr: "Sundry Debtors",
    help: "Cash or bank inflow from customers, debtors, or miscellaneous income.",
  },
  JOURNAL: {
    label: "Journal",
    key: "F7",
    icon: BookOpen,
    defaultDr: "",
    defaultCr: "",
    help: "Non-cash adjustments, depreciation, accruals, or asset transfers.",
  },
  SALES: {
    label: "Sales",
    key: "F8",
    icon: CircleDollarSign,
    defaultDr: "Sundry Debtors",
    defaultCr: "Sales Account",
    help: "Direct accounting entry for credit or cash sales billing.",
  },
  PURCHASE: {
    label: "Purchase",
    key: "F9",
    icon: ShoppingBag,
    defaultDr: "Purchase Account",
    defaultCr: "Sundry Creditors",
    help: "Direct accounting entry for vendor purchases.",
  },
};

const VOUCHER_ORDER: VoucherType[] = ["CONTRA", "PAYMENT", "RECEIPT", "JOURNAL", "SALES", "PURCHASE"];

function newRow(type: BalanceType = "DR"): EntryRow {
  return { id: Math.random().toString(36).slice(2), ledgerId: "", ledgerName: "", type, amount: "" };
}

export function VoucherEntry({ ledgers }: VoucherEntryProps) {
  const [voucherType, setVoucherType] = useState<VoucherType>("PAYMENT");
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
      if (tag === "INPUT" && !["F4", "F5", "F6", "F7", "F8", "F9"].includes(e.key)) return;
      const map: Record<string, VoucherType> = {
        F4: "CONTRA",
        F5: "PAYMENT",
        F6: "RECEIPT",
        F7: "JOURNAL",
        F8: "SALES",
        F9: "PURCHASE",
      };
      if (map[e.key]) {
        e.preventDefault();
        setVoucherType(map[e.key]);
      }
      if (e.altKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [rows, narration, date, voucherType, reference]);

  const drTotal = rows.filter((r) => r.type === "DR").reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const crTotal = rows.filter((r) => r.type === "CR").reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const isBalanced = Math.abs(drTotal - crTotal) < 0.01 && drTotal > 0;
  const hasZeroAmounts = drTotal === 0 && crTotal === 0;

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
    if (!isBalanced) {
      toast.error("Voucher out of balance — Dr must equal Cr");
      return;
    }
    const incomplete = rows.some((r) => !r.ledgerId || !r.amount || parseFloat(r.amount) <= 0);
    if (incomplete) {
      toast.error("All rows must have a ledger and amount");
      return;
    }

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
  const ActiveIcon = cfg.icon;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Voucher Card Container */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Modern Segmented Tab Bar */}
        <div className="p-1.5 border-b border-border bg-muted/30">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
            {VOUCHER_ORDER.map((type) => {
              const c = VOUCHER_CONFIG[type];
              const isActive = type === voucherType;
              const TypeIcon = c.icon;
              return (
                <SimpleTooltip key={type} content={c.help}>
                  <button
                    type="button"
                    onClick={() => setVoucherType(type)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                      isActive
                        ? "bg-background text-foreground shadow-xs font-bold border border-border"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <TypeIcon className={`size-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{c.label}</span>
                    <kbd
                      className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                        isActive ? "bg-primary/10 text-primary font-bold" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.key}
                    </kbd>
                  </button>
                </SimpleTooltip>
              );
            })}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Voucher Header Meta */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Active Voucher</Label>
                <InfoTooltip text={cfg.help} />
              </div>
              <div className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold shadow-2xs">
                <ActiveIcon className="size-4 text-primary" />
                <span>{cfg.label} Voucher</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                  {cfg.key}
                </span>
              </div>
            </div>

            <div className="space-y-1 flex-1 min-w-[140px] max-w-[180px]">
              <Label className="text-xs font-semibold text-muted-foreground">Voucher Date</Label>
              <DatePicker value={date} onChange={setDate} className="h-9 text-xs font-mono rounded-xl border-border bg-background/50" />
            </div>

            <div className="space-y-1 flex-1 min-w-[160px]">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Reference / Cheque No.</Label>
                <InfoTooltip text="Cheque number, bank UTR reference, or external billing reference." />
              </div>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. CHQ-004521"
                className="h-9 text-xs rounded-xl border-border bg-background/50 focus:bg-background"
              />
            </div>
          </div>

          {/* Dr / Cr Entry Table */}
          <div className="rounded-xl border border-border/80 overflow-hidden shadow-2xs">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b border-border/80">
                <tr>
                  <th className="py-2.5 px-3 text-left font-bold text-muted-foreground w-24">
                    <div className="flex items-center gap-1">
                      <span>Dr / Cr</span>
                      <InfoTooltip text="Double-entry rule: Dr (Debit) accounts for what comes in or expenses; Cr (Credit) accounts for what goes out or income. Total Dr must equal Total Cr." />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 text-left font-bold text-muted-foreground">Ledger Account</th>
                  <th className="py-2.5 px-3 text-right font-bold text-muted-foreground w-40">Amount (₹)</th>
                  <th className="py-2.5 px-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                    {/* Dr / Cr toggle */}
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() => updateRow(row.id, { type: row.type === "DR" ? "CR" : "DR" })}
                        className={`w-14 py-1 rounded-lg text-[11px] font-black cursor-pointer border transition-all text-center ${
                          row.type === "DR"
                            ? "bg-sky-500/15 text-sky-400 border-sky-500/30 hover:bg-sky-500/25"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                        }`}
                        title="Click to toggle between Debit (DR) and Credit (CR)"
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
                        placeholder="Search ledger account..."
                        className="h-9 text-xs rounded-xl border-border bg-background/50 focus:bg-background"
                      />
                      {openDropdown === row.id && (
                        <div className="absolute left-3 right-3 top-full z-50 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-2xl p-1.5 mt-1 max-h-52 overflow-y-auto">
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
                              className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-between group cursor-pointer"
                            >
                              <span className="font-semibold text-foreground group-hover:text-primary">{l.name}</span>
                              <Badge
                                variant="outline"
                                className="text-[9px] font-mono px-1.5 py-0.5 text-muted-foreground group-hover:border-primary/30 group-hover:text-primary"
                              >
                                {l.group.replace(/_/g, " ")}
                              </Badge>
                            </button>
                          ))}
                          {filteredLedgers(ledgerSearch[row.id] || "").length === 0 && (
                            <div className="px-3 py-3 text-xs text-muted-foreground text-center">No ledger account found</div>
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
                        className="h-9 text-xs font-mono text-right rounded-xl border-border bg-background/50 focus:bg-background font-semibold"
                      />
                    </td>

                    {/* Remove */}
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length <= 2}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-20 cursor-pointer"
                        title="Remove row"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Totals row */}
              <tfoot className="bg-muted/30 border-t border-border/80">
                <tr>
                  <td className="py-2.5 px-3 text-xs font-bold text-muted-foreground" colSpan={2}>
                    <div className="flex items-center gap-2">
                      <span>Total Double-Entry Summary</span>
                      {hasZeroAmounts ? (
                        <span className="text-[11px] text-muted-foreground font-normal">(Enter amounts)</span>
                      ) : isBalanced ? (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="size-3" /> Balanced
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="size-3" /> Difference: ₹{Math.abs(drTotal - crTotal).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="text-xs font-mono space-y-0.5">
                      <div className="flex justify-between items-center text-sky-400">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Dr:</span>
                        <span className="font-bold">₹{drTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-400">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Cr:</span>
                        <span className="font-bold">₹{crTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Add row buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addRow("DR")}
              className="h-8 rounded-xl text-xs font-semibold gap-1.5 border-sky-500/30 text-sky-400 bg-sky-500/5 hover:bg-sky-500/10 cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>Add Debit (Dr) Row</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addRow("CR")}
              className="h-8 rounded-xl text-xs font-semibold gap-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>Add Credit (Cr) Row</span>
            </Button>
          </div>

          {/* Narration */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Narration / Remark</Label>
              <InfoTooltip text="Brief description explaining the transaction purpose for auditing, ledger statements, and accounts verification." />
            </div>
            <Input
              ref={narrationRef}
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="e.g. Being payment made to supplier against invoice #INV-2026-0048"
              className="h-9 text-xs rounded-xl border-border bg-background/50 focus:bg-background"
            />
          </div>

          {/* Balance indicator + Save Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/80">
            <div>
              {hasZeroAmounts ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <AlertCircle className="size-4 opacity-50" />
                  <span>Enter ledger debit and credit amounts to balance the voucher</span>
                </div>
              ) : isBalanced ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  <span>Voucher Balanced — Dr = Cr (₹{drTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })})</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold shadow-2xs">
                  <AlertCircle className="size-4 text-amber-400" />
                  <span>Out of balance by ₹{Math.abs(drTotal - crTotal).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRows([newRow("DR"), newRow("CR")]);
                  setNarration("");
                  setReference("");
                }}
                className="h-9 px-4 text-xs font-semibold rounded-xl border-border hover:bg-muted cursor-pointer"
              >
                Clear Form
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !isBalanced}
                className="h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="mr-1.5 size-3.5" />
                <span>{saving ? "Posting Voucher..." : "Post Voucher (Alt+S)"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcut Hint Banner */}
      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-2.5 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <Keyboard className="size-3.5 text-primary shrink-0" />
          <span>Quick shortcuts:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground font-mono text-[10px]">F4</kbd>–
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground font-mono text-[10px]">F9</kbd> to switch voucher type ·
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground font-mono text-[10px]">Alt+S</kbd> to save ·
          <span>Click Dr/Cr cell to toggle</span>
        </div>
      </div>
    </div>
  );
}
