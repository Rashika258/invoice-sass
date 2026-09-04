"use client";

import { useState } from "react";
import { Receipt, ShieldCheck, Percent, Hash, ToggleLeft, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { AppSettings } from "@/lib/settings-store";

interface TaxesSettingsProps {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  profile?: any;
}

export function TaxesSettings({ settings, updateSetting, profile }: TaxesSettingsProps) {
  const GST_RATES = [0, 5, 12, 18, 28];

  const schemeOptions = [
    {
      id: "REGULAR" as const,
      name: "Regular Scheme",
      desc: "File GSTR-1, GSTR-3B monthly. Collect and pay CGST+SGST/IGST on all taxable supplies.",
      badge: "Most Common",
    },
    {
      id: "COMPOSITION" as const,
      name: "Composition Scheme",
      desc: "Pay flat 1-6% on turnover. No ITC available. Quarterly filing. Only for businesses under ₹1.5Cr.",
      badge: "Small Business",
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-brand-light text-brand">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Taxes &amp; GST Configuration</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure GST registration type, default tax rates, HSN codes, e-Way Bill threshold, and Reverse Charge (RCM) settings.
          </p>
        </div>
      </div>

      {/* GST Registration Scheme */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-foreground">GST Registration Scheme</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">Select the scheme matching your GSTIN registration certificate.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {schemeOptions.map((opt) => {
            const isSelected = settings.gstRegistrationType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateSetting("gstRegistrationType", opt.id)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? "border-brand bg-brand-light ring-1 ring-brand"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-foreground">{opt.name}</span>
                  <Badge className={`text-[10px] border-none font-semibold ${isSelected ? "bg-brand text-white" : "bg-muted text-muted-foreground"}`}>
                    {opt.badge}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Default GST Rate & HSN */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Percent className="size-4 text-brand" />
          Default GST Rate &amp; HSN Code
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Default GST Rate (%)</Label>
            <div className="flex flex-wrap gap-2 pt-1">
              {GST_RATES.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => updateSetting("defaultGstRate", rate)}
                  className={`px-3 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                    settings.defaultGstRate === rate
                      ? "bg-brand text-white border-brand"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground pt-1">Applied by default when adding new items without an explicit rate.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Default HSN / SAC Code</Label>
            <Input
              value={settings.defaultHsnCode}
              onChange={(e) => updateSetting("defaultHsnCode", e.target.value)}
              className="h-8 text-xs font-mono font-bold"
              placeholder="e.g. 8483"
              maxLength={8}
            />
            <p className="text-[10px] text-muted-foreground">
              Pre-filled in new item entries. Override per-item in catalogue.
            </p>
          </div>
        </div>
      </div>

      {/* E-Way Bill & RCM */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h4 className="text-sm font-bold text-foreground">E-Way Bill &amp; Reverse Charge (RCM)</h4>

        <div className="space-y-4 divide-y divide-border/50 text-xs">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">E-Way Bill Generation Threshold (₹)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                value={settings.ewayBillThreshold}
                onChange={(e) => updateSetting("ewayBillThreshold", Number(e.target.value))}
                className="h-8 text-xs font-mono font-bold max-w-[160px]"
              />
              <p className="text-[11px] text-muted-foreground">
                Invoices above ₹{settings.ewayBillThreshold.toLocaleString("en-IN")} will prompt E-Way bill generation.
                <span className="text-brand font-semibold"> (Statutory limit: ₹50,000)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5 pr-4">
              <div className="font-bold text-foreground">Enable Reverse Charge Mechanism (RCM)</div>
              <p className="text-[11px] text-muted-foreground">
                For purchases from unregistered suppliers where you pay tax directly to the government instead of the vendor.
              </p>
            </div>
            <Switch
              checked={settings.enableRcm}
              onCheckedChange={(v) => updateSetting("enableRcm", v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
