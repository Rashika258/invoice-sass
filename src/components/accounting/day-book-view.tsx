"use client";

import React, { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type Voucher = {
  id: string;
  voucherNumber: string;
  voucherType: string;
  date: string;
  narration?: string | null;
  reference?: string | null;
  entries: {
    type: string;
    amount: number;
    ledger: { name: string; group: string };
  }[];
};

interface DayBookViewProps {
  initialDate: string;
  vouchers: Voucher[];
}

const VTYPE_COLORS: Record<string, string> = {
  PAYMENT:   "bg-rose-500/10 text-rose-600",
  RECEIPT:   "bg-emerald-500/10 text-emerald-600",
  JOURNAL:   "bg-violet-500/10 text-violet-600",
  CONTRA:    "bg-zinc-500/10 text-zinc-600",
  SALES:     "bg-brand-light text-brand",
  PURCHASE:  "bg-amber-500/10 text-amber-600",
  DEBIT_NOTE:"bg-orange-500/10 text-orange-600",
  CREDIT_NOTE:"bg-teal-500/10 text-teal-600",
};

export function DayBookView({ initialDate, vouchers }: DayBookViewProps) {
  const [date, setDate] = useState(initialDate);

  const totalDr = vouchers.flatMap((v) => v.entries).filter((e) => e.type === "DR").reduce((s, e) => s + e.amount, 0);
  const totalCr = vouchers.flatMap((v) => v.entries).filter((e) => e.type === "CR").reduce((s, e) => s + e.amount, 0);

  const prevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().slice(0, 10));
  };
  const nextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Date nav */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="size-5 text-brand" />
            Day Book
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">All posted vouchers for the selected date</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={prevDay} className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer">
            <ChevronLeft className="size-4" />
          </button>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 text-xs font-mono w-36"
          />
          <button type="button" onClick={nextDay} className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card">
          <FileText className="size-3.5 text-brand" />
          <span className="font-bold text-foreground">{vouchers.length}</span>
          <span className="text-muted-foreground">Vouchers</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5">
          <span className="font-bold text-rose-600">Dr ₹{totalDr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <span className="font-bold text-emerald-600">Cr ₹{totalCr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {vouchers.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-2">
          <CalendarDays className="size-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No entries for this date</h3>
          <p className="text-xs text-muted-foreground">Post a voucher from Voucher Entry to see it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vouchers.map((v) => {
            const drEntries = v.entries.filter((e) => e.type === "DR");
            const crEntries = v.entries.filter((e) => e.type === "CR");
            const total = drEntries.reduce((s, e) => s + e.amount, 0);
            return (
              <div key={v.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                {/* Voucher header */}
                <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${VTYPE_COLORS[v.voucherType] ?? "bg-muted text-muted-foreground"}`}>
                      {v.voucherType}
                    </span>
                    <span className="text-xs font-black text-foreground font-mono">{v.voucherNumber}</span>
                    {v.reference && (
                      <span className="text-[11px] text-muted-foreground">Ref: {v.reference}</span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-foreground">
                    ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {/* Entries */}
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-border/30">
                    {v.entries.map((e, i) => (
                      <tr key={i} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2 px-4">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                            e.type === "DR" ? "text-rose-600 bg-rose-500/10" : "text-emerald-600 bg-emerald-500/10"
                          }`}>{e.type}</span>
                        </td>
                        <td className="py-2 px-4 font-semibold text-foreground">{e.ledger.name}</td>
                        <td className={`py-2 px-4 text-right font-mono font-bold ${
                          e.type === "DR" ? "text-rose-600" : "text-emerald-600"
                        }`}>
                          ₹{e.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {v.narration && (
                  <div className="px-4 py-2 border-t border-border/50 text-[11px] text-muted-foreground italic">
                    {v.narration}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
