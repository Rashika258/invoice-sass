"use client";

import { useState } from "react";
import { ShoppingBag, Pill, Scissors, Utensils, Briefcase, Check, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export type BusinessVertical = 
  | "RETAIL_WHOLESALE"
  | "PHARMACY"
  | "SALON_CLINIC"
  | "RESTAURANT"
  | "GENERAL_SERVICES"
  | "OTHER";

interface VerticalOption {
  id: BusinessVertical;
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  defaultBatchExpiry: boolean;
  defaultBarcodes: boolean;
  defaultStaffCommission: boolean;
  defaultItemType: "PRODUCT" | "SERVICE";
}

export const VERTICAL_OPTIONS: VerticalOption[] = [
  {
    id: "RETAIL_WHOLESALE",
    title: "Retail & Wholesale Traders",
    badge: "Core ERP",
    description: "Fast counter POS billing, barcode scanning, stock alerts, and Tally accounting.",
    icon: ShoppingBag,
    defaultBatchExpiry: false,
    defaultBarcodes: true,
    defaultStaffCommission: false,
    defaultItemType: "PRODUCT",
  },
  {
    id: "PHARMACY",
    title: "Retail Pharmacies & Chemists",
    badge: "Rx Ready",
    description: "Batch & expiry date tracking, HSN/GST compliance, low-stock drug alerts.",
    icon: Pill,
    defaultBatchExpiry: true,
    defaultBarcodes: true,
    defaultStaffCommission: false,
    defaultItemType: "PRODUCT",
  },
  {
    id: "SALON_CLINIC",
    title: "Salons, Spas & Clinics",
    badge: "Staff & Services",
    description: "Service-item billing, stylist commission tracking, 8-hour shift attendance.",
    icon: Scissors,
    defaultBatchExpiry: false,
    defaultBarcodes: false,
    defaultStaffCommission: true,
    defaultItemType: "SERVICE",
  },
  {
    id: "RESTAURANT",
    title: "Restaurants & Cafes",
    badge: "POS & KOT",
    description: "Fast ticket billing, item menu catalog, kitchen staff attendance & expense tracking.",
    icon: Utensils,
    defaultBatchExpiry: false,
    defaultBarcodes: false,
    defaultStaffCommission: false,
    defaultItemType: "PRODUCT",
  },
  {
    id: "GENERAL_SERVICES",
    title: "Services & Consultants",
    badge: "GST Billing",
    description: "Quotations, proforma invoices, party balance CRM, and simple GST compliance.",
    icon: Briefcase,
    defaultBatchExpiry: false,
    defaultBarcodes: false,
    defaultStaffCommission: false,
    defaultItemType: "SERVICE",
  },
];

interface VerticalSelectorProps {
  selectedVertical: BusinessVertical;
  onVerticalChange: (vertical: BusinessVertical, presets: {
    batchExpiry: boolean;
    barcodes: boolean;
    staffCommission: boolean;
    itemType: "PRODUCT" | "SERVICE";
  }) => void;
}

export function VerticalSelector({ selectedVertical, onVerticalChange }: VerticalSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Select Business Industry Vertical
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Choosing your industry preset configures Billora&apos;s UI, inventory rules, and billing workflows for your exact business model.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {VERTICAL_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedVertical === opt.id;

          return (
            <Card
              key={opt.id}
              onClick={() =>
                onVerticalChange(opt.id, {
                  batchExpiry: opt.defaultBatchExpiry,
                  barcodes: opt.defaultBarcodes,
                  staffCommission: opt.defaultStaffCommission,
                  itemType: opt.defaultItemType,
                })
              }
              className={`cursor-pointer transition-all duration-200 border-2 relative overflow-hidden ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-lg ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {opt.title}
                      </h4>
                      <Badge variant="outline" className="mt-1 text-[11px] font-normal px-2 py-0 border-indigo-200 text-indigo-700 dark:border-indigo-900 dark:text-indigo-300">
                        {opt.badge}
                      </Badge>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {opt.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
