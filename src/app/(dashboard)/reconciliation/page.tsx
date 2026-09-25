import { Metadata } from "next";
import { ReconciliationCenterView } from "@/components/reconciliation/reconciliation-center-view";

export const metadata: Metadata = {
  title: "Reconciliation Center | Billora ERP",
  description: "Unified financial checks: invoice totals, payments, stock movements, and Tally ledger balances.",
};

export default function ReconciliationPage() {
  return <ReconciliationCenterView />;
}
