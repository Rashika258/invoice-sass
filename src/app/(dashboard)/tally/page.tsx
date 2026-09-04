import { Metadata } from "next";
import { getBusinessSummary } from "@/actions/reports";
import { getCompanyProfile } from "@/actions/settings";
import { TallyHubView } from "@/components/utilities/tally-hub-view";

export const metadata: Metadata = {
  title: "Tally Integration Hub | Billora",
  description: "Export sales, purchase & ledger vouchers to Tally ERP 9 / Tally Prime, or import master data from Tally XML.",
};

export const dynamic = "force-dynamic";

export default async function TallyHubPage() {
  const [summary, profile] = await Promise.all([
    getBusinessSummary(),
    getCompanyProfile(),
  ]);

  return (
    <TallyHubView
      companyName={profile?.companyName || "My Business"}
      sales={summary.sales}
      purchases={summary.purchases}
      partiesCount={summary.partiesCount}
    />
  );
}
