import { Metadata } from "next";
import { getTrialBalance } from "@/actions/accounting";
import { TrialBalanceView } from "@/components/accounting/trial-balance-view";

export const metadata: Metadata = {
  title: "Trial Balance | Billora Accounting",
  description: "View closing Dr/Cr balances for every ledger account.",
};

export const dynamic = "force-dynamic";

export default async function TrialBalancePage() {
  const rows = await getTrialBalance();
  return <TrialBalanceView rows={rows} />;
}
