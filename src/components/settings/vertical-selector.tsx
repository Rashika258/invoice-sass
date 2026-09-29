"use client";

import { useState } from "react";
import {
  Briefcase,
  Building,
  Check,
  GraduationCap,
  Layers,
  Pill,
  Scissors,
  ShoppingBag,
  Sparkles,
  Utensils,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BusinessVertical } from "@/generated/prisma/enums";
import { VERTICAL_CONFIGS, type VerticalMeta } from "@/lib/verticals";

export { BusinessVertical };

export interface VerticalOption {
  id: BusinessVertical;
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  defaultBatchExpiry: boolean;
  defaultBarcodes: boolean;
  defaultStaffCommission: boolean;
  defaultItemType: "PRODUCT" | "SERVICE";
  highlightUnits: string[];
  enabledTabsSummary: string;
}

export const VERTICAL_OPTIONS: VerticalOption[] = [
  {
    id: "RETAIL_WHOLESALE",
    title: "Retail & Wholesale Traders",
    badge: "Core POS & ERP",
    description: "Fast counter POS billing, barcode scanning, stock godowns, and GST compliance.",
    icon: ShoppingBag,
    defaultBatchExpiry: false,
    defaultBarcodes: true,
    defaultStaffCommission: false,
    defaultItemType: "PRODUCT",
    highlightUnits: ["PCS", "BOX", "KGS", "NOS", "PAC"],
    enabledTabsSummary: "POS Express Billing, Godowns, Barcodes",
  },
  {
    id: "PHARMACY",
    title: "Retail Pharmacies & Chemists",
    badge: "Rx & FEFO Batch",
    description: "Batch & expiry date tracking, HSN/GST compliance, low-stock & expiry drug alerts.",
    icon: Pill,
    defaultBatchExpiry: true,
    defaultBarcodes: true,
    defaultStaffCommission: false,
    defaultItemType: "PRODUCT",
    highlightUnits: ["STRIPS", "TABLETS", "BOTTLES", "VIALS"],
    enabledTabsSummary: "Drug Expiry Hub, Chemist Fast Bill, Alerts",
  },
  {
    id: "SALON_CLINIC",
    title: "Salons, Spas & Clinics",
    badge: "Appointments & Staff",
    description: "Service-item billing, stylist commission tracking, 8-hour shift attendance & bookings.",
    icon: Scissors,
    defaultBatchExpiry: false,
    defaultBarcodes: false,
    defaultStaffCommission: true,
    defaultItemType: "SERVICE",
    highlightUnits: ["SESSION", "SERVICE", "VISIT", "HOURS"],
    enabledTabsSummary: "Appointments, Staff Commissions, Shifts",
  },
  {
    id: "REAL_ESTATE",
    title: "Real Estate & Rentals",
    badge: "Lease & CAM Billing",
    description: "Monthly rent collection, tenant lease agreements, security deposits, and CAM maintenance.",
    icon: Building,
    defaultBatchExpiry: false,
    defaultBarcodes: false,
    defaultStaffCommission: true,
    defaultItemType: "SERVICE",
    highlightUnits: ["MONTH", "SQFT", "UNIT", "FLAT"],
    enabledTabsSummary: "Property Rent Invoices, Tenants, CAM Deposits",
  },
  {
    id: "EDUCATION",
    title: "Education & Coaching",
    badge: "Student Fees & Terms",
    description: "Student course fees, installment billing, exam fees, and teacher attendance payroll.",
    icon: GraduationCap,
    defaultBatchExpiry: false,
    defaultBarcodes: false,
    defaultStaffCommission: false,
    defaultItemType: "SERVICE",
    highlightUnits: ["TERM", "COURSE", "MONTH", "BATCH"],
    enabledTabsSummary: "Student Fee Receipts, Courses, Consultations",
  },
  {
    id: "RESTAURANT",
    title: "Restaurants & Cafes",
    badge: "Dining POS & KOT",
    description: "Fast ticket billing, item menu catalog, kitchen staff attendance & expense tracking.",
    icon: Utensils,
    defaultBatchExpiry: true,
    defaultBarcodes: false,
    defaultStaffCommission: false,
    defaultItemType: "PRODUCT",
    highlightUnits: ["PLATE", "PORTION", "SERVE", "BOWL"],
    enabledTabsSummary: "Dining POS Counter, Food Menu, Table KOT",
  },
  {
    id: "GENERAL_SERVICES",
    title: "Services & Consultants",
    badge: "Time & Retainer",
    description: "Quotations, proforma invoices, client retainers, party CRM, and simple GST compliance.",
    icon: Briefcase,
    defaultBatchExpiry: false,
    defaultBarcodes: false,
    defaultStaffCommission: true,
    defaultItemType: "SERVICE",
    highlightUnits: ["HRS", "DAYS", "PROJECT", "SESSION"],
    enabledTabsSummary: "Client Bookings, Proposals, Retainer Bills",
  },
  {
    id: "OTHER",
    title: "Custom / Other Enterprise",
    badge: "Flexible ERP",
    description: "Universal ERP workflows tailored for custom manufacturing, trading, or hybrid businesses.",
    icon: Layers,
    defaultBatchExpiry: false,
    defaultBarcodes: true,
    defaultStaffCommission: false,
    defaultItemType: "PRODUCT",
    highlightUnits: ["NOS", "PCS", "HRS", "SET"],
    enabledTabsSummary: "Express Invoicing, Item Inventory, CRM",
  },
];

interface VerticalSelectorProps {
  selectedVertical: BusinessVertical;
  onVerticalChange: (
    vertical: BusinessVertical,
    presets: {
      batchExpiry: boolean;
      barcodes: boolean;
      staffCommission: boolean;
      itemType: "PRODUCT" | "SERVICE";
    }
  ) => void;
  disabled?: boolean;
}

export function VerticalSelector({
  selectedVertical,
  onVerticalChange,
  disabled = false,
}: VerticalSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span>Select Business Industry Vertical</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Switching your industry preset automatically configures Billora&apos;s navigation tabs, default item types, unit dropdowns, and inventory rules.
          </p>
        </div>
        <Badge variant="outline" className="text-[11px] self-start sm:self-auto font-mono px-2 py-0.5">
          8 Industry Presets Available
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {VERTICAL_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedVertical === opt.id;

          return (
            <Card
              key={opt.id}
              onClick={() => {
                if (disabled) return;
                onVerticalChange(opt.id, {
                  batchExpiry: opt.defaultBatchExpiry,
                  barcodes: opt.defaultBarcodes,
                  staffCommission: opt.defaultStaffCommission,
                  itemType: opt.defaultItemType,
                });
              }}
              className={`cursor-pointer transition-all duration-200 border relative overflow-hidden select-none ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                  : "border-border/60 hover:border-border hover:bg-muted/30 bg-card"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <CardContent className="p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-foreground leading-tight">
                        {opt.title}
                      </h4>
                      <Badge
                        variant="secondary"
                        className="mt-0.5 text-[9px] font-mono uppercase px-1.5 py-0"
                      >
                        {opt.badge}
                      </Badge>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {opt.description}
                </p>

                {/* Auto-Enabled Tabs and Options info */}
                <div className="pt-2 border-t border-border/40 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Zap className="size-3 text-amber-500 shrink-0" />
                    <span className="truncate font-medium text-foreground">{opt.enabledTabsSummary}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="font-mono text-primary font-semibold">Units:</span>
                    <span className="truncate">{opt.highlightUnits.join(", ")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
