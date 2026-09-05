import { Metadata } from "next";
import { getLedgers } from "@/actions/accounting";
import { LedgerMaster } from "@/components/accounting/ledger-master";

export const metadata: Metadata = {
  title: "Ledger Master | Billora Accounting",
  description: "Manage Chart of Accounts and groups (Assets, Liabilities, Income, Expenses, Taxes).",
};

export const dynamic = "force-dynamic";

export default async function LedgersPage() {
  const ledgers = await getLedgers();
  return <LedgerMaster ledgers={ledgers} />;
}
