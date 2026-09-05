import { Metadata } from "next";
import { getBalanceSheet } from "@/actions/accounting";
import { getCompanyProfile } from "@/actions/settings";
import { getAppSettings } from "@/lib/settings-store";
import { BalanceSheetView } from "@/components/accounting/balance-sheet-view";

export const metadata: Metadata = {
  title: "Balance Sheet | Billora Accounting",
  description: "Traditional two-column Balance Sheet showing Liabilities and Assets as on date.",
};

export const dynamic = "force-dynamic";

export default async function BalanceSheetPage() {
  const [data, profile] = await Promise.all([
    getBalanceSheet(),
    getCompanyProfile(),
  ]);

  const appSettings = getAppSettings();
  const companyName = profile?.companyName || "My Business";
  const financialYear = appSettings.currentFinancialYear || "2026-2027";

  return (
    <BalanceSheetView
      data={data}
      companyName={companyName}
      financialYear={financialYear}
    />
  );
}
