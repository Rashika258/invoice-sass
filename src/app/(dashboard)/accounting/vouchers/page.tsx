import { Metadata } from "next";
import { getLedgers } from "@/actions/accounting";
import { VoucherEntry } from "@/components/accounting/voucher-entry";

export const metadata: Metadata = {
  title: "Voucher Entry | Billora Accounting",
  description: "Create and post accounting vouchers (Contra, Payment, Receipt, Journal, Sales, Purchase) with Dr/Cr double-entry bookkeeping.",
};

export const dynamic = "force-dynamic";

export default async function VoucherEntryPage() {
  const ledgers = await getLedgers();
  return <VoucherEntry ledgers={ledgers} />;
}
