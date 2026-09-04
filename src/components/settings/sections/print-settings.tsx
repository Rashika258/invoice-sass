"use client";

import React, { useState } from "react";
import {
  Printer,
  QrCode,
  Image as ImageIcon,
  Building2,
  FileCheck,
  Check,
  Layers,
  Sparkles,
  Receipt,
  FileText,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppSettings } from "@/lib/settings-store";

interface PrintSettingsProps {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  profile?: any;
}

export function PrintSettings({
  settings,
  updateSetting,
  profile,
}: PrintSettingsProps) {
  const companyName = profile?.companyName || "Sri Manjunatha Engineering Works";
  const gstin = profile?.taxId || "29AABCU9603R1ZM";
  const address = profile?.address || "No. 42, Industrial Area, Peenya 3rd Phase, Bengaluru";
  const bankName = profile?.bankName || "State Bank of India";
  const accountNumber = profile?.accountNumber || "38291048291";
  const routingNumber = profile?.routingNumber || "SBIN0004128";

  const paperOptions = [
    {
      id: "A4",
      label: "A4 Sheet (Standard)",
      desc: "210 × 297 mm • Laser & Inkjet • Standard GST Invoice",
      icon: FileText,
    },
    {
      id: "A5",
      label: "A5 Sheet (Compact)",
      desc: "148 × 210 mm • Half-page saving • Wholesale delivery",
      icon: FileCheck,
    },
    {
      id: "THERMAL_3INCH",
      label: "3-Inch POS Roll (80mm)",
      desc: "80 mm Roll • Fast Counter Billing • Supermarkets",
      icon: Receipt,
    },
    {
      id: "THERMAL_2INCH",
      label: "2-Inch POS Roll (58mm)",
      desc: "58 mm Roll • Bluetooth Handheld • Field agents",
      icon: Receipt,
    },
  ];

  const templateOptions = [
    {
      id: "MODERN",
      name: "Modern Clean",
      desc: "Brand gradient accent header, clean borderless tables, high readability",
    },
    {
      id: "CLASSIC",
      name: "Classic Tally Style",
      desc: "Structured full grid borders, compact boxed totals, traditional Indian layout",
    },
    {
      id: "GST_TAX",
      name: "GST Tax Detailed",
      desc: "Itemized HSN/SAC code breakdown, dedicated CGST/SGST/IGST tax rate columns",
    },
    {
      id: "THERMAL",
      name: "POS Thermal Receipt",
      desc: "Monospace compact layout, auto-cut cutter marks, barcode & dynamic QR footer",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-light text-brand">
              <Printer className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Print &amp; Invoice Styling
              </h3>
              <p className="text-xs text-muted-foreground">
                Configure your print layout, paper dimensions, dynamic UPI payment QR, and custom branding for invoices.
              </p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
          Active: {settings.printerType.replace("_", " ")} • {settings.printTemplate}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Paper Size Selector */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="size-4 text-brand" />
              <span>Printer Format &amp; Paper Size</span>
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Select the printer format attached to your billing workstation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {paperOptions.map((opt) => {
                const isSelected = settings.printerType === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateSetting("printerType", opt.id as any)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand bg-brand-light shadow-xs ring-1 ring-brand font-medium"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`size-4 ${isSelected ? "text-brand" : "text-muted-foreground"}`} />
                        <span className="text-xs font-bold text-foreground">{opt.label}</span>
                      </div>
                      {isSelected && (
                        <div className="size-4 rounded-full bg-brand flex items-center justify-center text-white">
                          <Check className="size-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Style */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="size-4 text-brand" />
              <span>Invoice Design Template</span>
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {templateOptions.map((tpl) => {
                const isSelected = settings.printTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => updateSetting("printTemplate", tpl.id as any)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand bg-brand-light shadow-xs ring-1 ring-brand font-medium"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">{tpl.name}</span>
                      {isSelected && (
                        <div className="size-4 rounded-full bg-brand flex items-center justify-center text-white">
                          <Check className="size-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{tpl.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bill Inclusions & Toggles */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Bill Inclusions &amp; Elements
            </h4>

            <div className="space-y-3 divide-y divide-border/50 text-xs">
              {/* Dynamic UPI QR */}
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <QrCode className="size-4 text-brand" />
                    <span>Dynamic UPI Payment QR Code</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Generates a real UPI QR with exact invoice payable amount and VPA so customers can scan &amp; pay instantly.
                  </p>
                </div>
                <Switch
                  checked={settings.printUpiQrOnBill}
                  onCheckedChange={(val) => updateSetting("printUpiQrOnBill", val)}
                />
              </div>

              {/* Company Logo */}
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <ImageIcon className="size-4 text-brand" />
                    <span>Display Company Logo on Header</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Prints your high-resolution business emblem at the top left of the bill.
                  </p>
                </div>
                <Switch
                  checked={settings.showCompanyLogo}
                  onCheckedChange={(val) => updateSetting("showCompanyLogo", val)}
                />
              </div>

              {/* Bank Details */}
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <Building2 className="size-4 text-brand" />
                    <span>Bank &amp; IFSC Details for NEFT/RTGS</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Prints Bank Name, Account Number, and IFSC branch code for direct electronic bank wire.
                  </p>
                </div>
                <Switch
                  checked={settings.showBankDetails}
                  onCheckedChange={(val) => updateSetting("showBankDetails", val)}
                />
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <FileText className="size-4 text-brand" />
                    <span>Terms &amp; Conditions Clause</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Prints your standard return policy, interest rules, and jurisdiction clause.
                  </p>
                </div>
                <Switch
                  checked={settings.showTermsConditions}
                  onCheckedChange={(val) => updateSetting("showTermsConditions", val)}
                />
              </div>

              {/* Authorized Signatory */}
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <FileCheck className="size-4 text-brand" />
                    <span>Authorized Signatory &amp; Stamp Area</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Designates signature space for store manager or authorized partner.
                  </p>
                </div>
                <Switch
                  checked={settings.showAuthorizedSignature}
                  onCheckedChange={(val) => updateSetting("showAuthorizedSignature", val)}
                />
              </div>

              {/* Previous Balance */}
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <Receipt className="size-4 text-brand" />
                    <span>Show Previous Outstanding Balance</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Prints party's previous ledger balance + current bill total = net payable.
                  </p>
                </div>
                <Switch
                  checked={settings.showPreviousBalance}
                  onCheckedChange={(val) => updateSetting("showPreviousBalance", val)}
                />
              </div>
            </div>
          </div>

          {/* Terms Text Editor */}
          {settings.showTermsConditions && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
              <Label className="text-xs font-bold text-foreground">
                Invoice Terms &amp; Conditions (Printed on Bill Footer)
              </Label>
              <Textarea
                rows={4}
                value={settings.invoiceTermsText}
                onChange={(e) => updateSetting("invoiceTermsText", e.target.value)}
                placeholder="1. Goods once sold will not be taken back&#10;2. Interest @ 18% p.a. charged after due date&#10;3. Subject to local jurisdiction"
                className="text-xs font-mono"
              />
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Paper Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Live Invoice Paper Preview
            </Label>
            <Badge variant="secondary" className="text-[10px]">
              Real-time update
            </Badge>
          </div>

          {/* Paper Sheet Preview Container */}
          <div className="rounded-2xl border-2 border-border/80 bg-zinc-100 dark:bg-zinc-950 p-4 shadow-inner flex justify-center">
            <div
              className={`bg-white text-zinc-900 rounded-lg shadow-xl border border-zinc-200 transition-all ${
                settings.printerType.startsWith("THERMAL")
                  ? "w-full max-w-[280px] p-3 text-[10px] font-mono"
                  : "w-full p-5 text-[11px]"
              }`}
            >
              {/* Header */}
              <div className="border-b border-zinc-300 pb-3 mb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    {settings.showCompanyLogo && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand/10 text-brand font-bold text-[10px] mb-1">
                        <Building2 className="size-3" />
                        <span>BILLORA</span>
                      </div>
                    )}
                    <h4 className="font-extrabold text-xs text-zinc-900 leading-tight">
                      {companyName}
                    </h4>
                    <p className="text-[9px] text-zinc-500">{address}</p>
                    <p className="text-[9px] font-bold text-zinc-700">GSTIN: {gstin}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-1.5 py-0.5 bg-zinc-900 text-white font-bold rounded text-[9px]">
                      TAX INVOICE
                    </span>
                    <p className="text-[9px] font-bold mt-1 text-zinc-800">#INV-2026-0182</p>
                    <p className="text-[9px] text-zinc-500">Date: 04/09/2026</p>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="bg-zinc-50 p-2 rounded border border-zinc-200 mb-3 text-[10px]">
                <span className="text-[8px] font-bold text-zinc-400 uppercase">Billed To:</span>
                <p className="font-bold text-zinc-800">Venkateshwara Agro Precision Pvt Ltd</p>
                <p className="text-zinc-500 text-[9px]">GSTIN: 29AABCV9912Q1ZR • Bengaluru, KA</p>
              </div>

              {/* Items Table */}
              <table className="w-full text-[9px] border-collapse mb-3">
                <thead>
                  <tr className="border-b-2 border-zinc-800 text-zinc-700">
                    <th className="text-left py-1">Item Description</th>
                    <th className="text-center py-1">Qty</th>
                    <th className="text-right py-1">Rate</th>
                    <th className="text-right py-1">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  <tr>
                    <td className="py-1">
                      <div className="font-bold text-zinc-800">Precision Flange 120mm</div>
                      <div className="text-[8px] text-zinc-400">HSN: 8483 • GST 18%</div>
                    </td>
                    <td className="text-center py-1">10 Pcs</td>
                    <td className="text-right py-1">₹ 850.00</td>
                    <td className="text-right py-1 font-bold">₹ 8,500.00</td>
                  </tr>
                  <tr>
                    <td className="py-1">
                      <div className="font-bold text-zinc-800">Rotary Bush Bearing</div>
                      <div className="text-[8px] text-zinc-400">HSN: 8482 • GST 18%</div>
                    </td>
                    <td className="text-center py-1">4 Pcs</td>
                    <td className="text-right py-1">₹ 420.00</td>
                    <td className="text-right py-1 font-bold">₹ 1,680.00</td>
                  </tr>
                </tbody>
              </table>

              {/* Calculations */}
              <div className="border-t border-zinc-300 pt-2 space-y-1 text-[9px]">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal:</span>
                  <span>₹ 10,180.00</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>CGST (9%) + SGST (9%):</span>
                  <span>₹ 1,832.40</span>
                </div>
                {settings.showPreviousBalance && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>Previous Outstanding Balance:</span>
                    <span>₹ 4,200.00</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] font-extrabold text-zinc-900 border-t border-zinc-800 pt-1">
                  <span>Grand Total:</span>
                  <span>₹ {settings.showPreviousBalance ? "16,212.40" : "12,012.40"}</span>
                </div>
              </div>

              {/* Bank Details & QR */}
              {(settings.showBankDetails || settings.printUpiQrOnBill) && (
                <div className="mt-3 p-2 rounded bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-2">
                  {settings.showBankDetails && (
                    <div className="text-[8px] space-y-0.5 text-zinc-700">
                      <div className="font-bold uppercase text-zinc-500">Bank Transfer Details:</div>
                      <div>Bank: <strong>{bankName}</strong></div>
                      <div>A/C: <strong>{accountNumber}</strong></div>
                      <div>IFSC: <strong>{routingNumber}</strong></div>
                    </div>
                  )}

                  {settings.printUpiQrOnBill && (
                    <div className="flex flex-col items-center shrink-0">
                      <div className="size-14 border border-zinc-300 rounded bg-white p-1 flex items-center justify-center">
                        <QrCode className="size-11 text-zinc-900" />
                      </div>
                      <span className="text-[7px] font-bold text-zinc-600 mt-0.5">SCAN TO PAY UPI</span>
                    </div>
                  )}
                </div>
              )}

              {/* Terms & Conditions */}
              {settings.showTermsConditions && (
                <div className="mt-3 text-[8px] text-zinc-500 border-t border-zinc-200 pt-1.5">
                  <div className="font-bold text-zinc-700 uppercase">Terms &amp; Conditions:</div>
                  <p className="whitespace-pre-line leading-tight mt-0.5">
                    {settings.invoiceTermsText || "Goods once sold cannot be returned. Interest @ 18% charged on delayed payment."}
                  </p>
                </div>
              )}

              {/* Signature */}
              {settings.showAuthorizedSignature && (
                <div className="mt-4 pt-2 border-t border-dashed border-zinc-300 flex justify-between items-end">
                  <span className="text-[8px] text-zinc-400">Computer Generated Invoice</span>
                  <div className="text-right">
                    <div className="text-[8px] font-bold text-zinc-800">For {companyName}</div>
                    <div className="h-6"></div>
                    <div className="text-[7px] text-zinc-500 border-t border-zinc-400 pt-0.5">
                      Authorized Signatory
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
