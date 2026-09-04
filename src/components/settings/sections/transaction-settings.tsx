"use client";

import { ArrowRight, Hash, ToggleLeft, Receipt, Calendar, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { AppSettings } from "@/lib/settings-store";

interface TransactionSettingsProps {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export function TransactionSettings({ settings, updateSetting }: TransactionSettingsProps) {
  const prefixes = [
    { key: "invoicePrefix" as const, label: "Sales Invoice Prefix", example: "INV-2026-0001", icon: Receipt },
    { key: "estimatePrefix" as const, label: "Estimate / Quotation Prefix", example: "EST-2026-0001", icon: Hash },
    { key: "challanPrefix" as const, label: "Delivery Challan Prefix", example: "DC-2026-0001", icon: Hash },
    { key: "paymentPrefix" as const, label: "Payment Receipt Prefix", example: "REC-2026-0001", icon: Hash },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-brand-light text-brand">
          <Receipt className="size-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Transaction Configuration</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customize document numbering prefixes, credit policies, rounding, and discount behaviour for all transactions.
          </p>
        </div>
      </div>

      {/* Voucher Prefix Numbering */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Hash className="size-4 text-brand" />
            Document Numbering Prefixes
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Prefixes appear before the auto-incremented sequence number on every printed document.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prefixes.map(({ key, label, example }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">{label}</Label>
              <Input
                value={settings[key] as string}
                onChange={(e) => updateSetting(key, e.target.value)}
                className="h-8 text-xs font-mono font-bold"
                placeholder={example.split("-")[0] + "-"}
              />
              <p className="text-[10px] text-muted-foreground">Preview: <span className="font-mono font-bold">{settings[key] as string}2026-0001</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Days */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="size-4 text-brand" />
            Default Credit Period &amp; Due Date
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Set the default payment due window applied automatically to every new invoice.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="space-y-1.5 flex-1 max-w-xs">
            <Label className="text-xs font-semibold text-foreground">Credit Days (0 = Due on Receipt)</Label>
            <Input
              type="number"
              min="0"
              max="365"
              value={settings.defaultCreditDays}
              onChange={(e) => updateSetting("defaultCreditDays", Number(e.target.value))}
              className="h-8 text-xs font-mono font-bold"
            />
            <p className="text-[10px] text-muted-foreground">
              {settings.defaultCreditDays === 0
                ? "Payment due immediately on invoice date"
                : `Payment due ${settings.defaultCreditDays} days after invoice date`}
            </p>
          </div>
        </div>
      </div>

      {/* Rounding & Discounts */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <ToggleLeft className="size-4 text-brand" />
          Calculation Rules
        </h4>

        <div className="space-y-4 divide-y divide-border/50 text-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="font-bold text-foreground">Auto Round-Off Grand Total</div>
              <p className="text-[11px] text-muted-foreground">
                Automatically round the invoice payable to the nearest rupee (e.g. ₹1,234.60 → ₹1,235). Round-off difference posted to Round-Off ledger.
              </p>
            </div>
            <Switch
              checked={settings.enableRoundOff}
              onCheckedChange={(v) => updateSetting("enableRoundOff", v)}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5 pr-4">
              <div className="font-bold text-foreground">Show Item-Level Discount Column</div>
              <p className="text-[11px] text-muted-foreground">
                Adds a per-line discount percentage column in invoice billing tables (e.g. "10% off" on one specific SKU).
              </p>
            </div>
            <Switch
              checked={settings.enableItemDiscount}
              onCheckedChange={(v) => updateSetting("enableItemDiscount", v)}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <AlertCircle className="size-3.5 text-amber-500" />
                <span>Block Sale on Negative Stock</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Prevents saving an invoice if the billed quantity exceeds the current available stock quantity for any item.
              </p>
            </div>
            <Switch
              checked={settings.stopSaleOnNegativeStock}
              onCheckedChange={(v) => updateSetting("stopSaleOnNegativeStock", v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
