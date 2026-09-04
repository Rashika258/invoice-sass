import { Metadata } from "next";
import { VerifyDataView } from "@/components/utilities/verify-data-view";

export const metadata: Metadata = {
  title: "Verify Business Data | Billora",
  description: "Automated business audit and data integrity check for GST, stock, and ledger consistency.",
};

export const dynamic = "force-dynamic";

export default async function VerifyDataPage() {
  return <VerifyDataView />;
}
