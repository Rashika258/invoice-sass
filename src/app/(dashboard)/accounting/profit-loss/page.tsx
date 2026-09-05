import { Metadata } from "next";
import { getProfitLoss } from "@/actions/accounting";
import { getCompanyProfile } from "@/actions/settings";
import { getAppSettings } from "@/lib/settings-store";
import { ProfitLossView } from "@/components/accounting/profit-loss-view";

export const metadata: Metadata = {
  title: "Profit & Loss Account | Billora Accounting",
  description: "Traditional Profit & Loss statement showing income, expenditures, gross and net profit margins.",
};

export const dynamic = "force-dynamic";

export default async function ProfitLossPage() {
  const [data, profile] = await Promise.all([
    getProfitLoss(),
    getCompanyProfile(),
  ]);

  const appSettings = getAppSettings();
  const companyName = profile?.companyName || "My Business";
  const financialYear = appSettings.currentFinancialYear || "2026-2027";

  return (
    <ProfitLossView
      data={data}
      companyName={companyName}
      financialYear={financialYear}
    />
  );
}
