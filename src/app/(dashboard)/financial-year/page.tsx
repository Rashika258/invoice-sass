import type { Metadata } from "next";
import { FinancialYearView } from "@/components/accounting/financial-year-view";

export const metadata: Metadata = {
  title: "Financial Year Management | Billora ERP",
  description:
    "Manage Indian financial years (April 1 – March 31), period locking, year-end closing checklist, and opening balance carry-forward.",
};

export default function FinancialYearPage() {
  return <FinancialYearView />;
}
