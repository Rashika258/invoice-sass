import type { DocumentType } from "@/generated/prisma/client";

export const DOCUMENT_META: Record<
  DocumentType,
  {
    label: string;
    plural: string;
    href: string;
    prefix: string;
    partyLabel: string;
    affectsStock: "out" | "in" | null;
    isPurchase: boolean;
  }
> = {
  SALE: {
    label: "Sale Invoice",
    plural: "Sale Invoices",
    href: "/invoices",
    prefix: "INV",
    partyLabel: "Customer",
    affectsStock: "out",
    isPurchase: false,
  },
  ESTIMATE: {
    label: "Estimate / Quotation",
    plural: "Estimates",
    href: "/estimates",
    prefix: "EST",
    partyLabel: "Customer",
    affectsStock: null,
    isPurchase: false,
  },
  PROFORMA: {
    label: "Proforma Invoice",
    plural: "Proforma Invoices",
    href: "/proforma",
    prefix: "PI",
    partyLabel: "Customer",
    affectsStock: null,
    isPurchase: false,
  },
  SALE_ORDER: {
    label: "Sale Order",
    plural: "Sale Orders",
    href: "/sale-orders",
    prefix: "SO",
    partyLabel: "Customer",
    affectsStock: null,
    isPurchase: false,
  },
  CREDIT_NOTE: {
    label: "Sale Return",
    plural: "Sale Returns",
    href: "/credit-notes",
    prefix: "CN",
    partyLabel: "Customer",
    affectsStock: "in",
    isPurchase: false,
  },
  DELIVERY_CHALLAN: {
    label: "Delivery Challan",
    plural: "Delivery Challans",
    href: "/challans",
    prefix: "DC",
    partyLabel: "Customer",
    affectsStock: "out",
    isPurchase: false,
  },
  PURCHASE: {
    label: "Purchase Bill",
    plural: "Purchase Bills",
    href: "/purchases",
    prefix: "PUR",
    partyLabel: "Supplier",
    affectsStock: "in",
    isPurchase: true,
  },
  DEBIT_NOTE: {
    label: "Purchase Return",
    plural: "Purchase Returns",
    href: "/debit-notes",
    prefix: "DN",
    partyLabel: "Supplier",
    affectsStock: "out",
    isPurchase: true,
  },
  PURCHASE_ORDER: {
    label: "Purchase Order",
    plural: "Purchase Orders",
    href: "/purchase-orders",
    prefix: "PO",
    partyLabel: "Supplier",
    affectsStock: null,
    isPurchase: true,
  },
};

export const GST_RATES = [0, 5, 12, 18, 28];

export { INDIAN_STATES } from "./geo-data";

export function isDocumentType(value: string): value is DocumentType {
  return value in DOCUMENT_META;
}
