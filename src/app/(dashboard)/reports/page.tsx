import {
  getBillWiseProfit,
  getBusinessSummary,
  getDayBook,
  getPartyBalances,
} from "@/actions/reports";
import { getCompanyProfile } from "@/actions/settings";
import { ReportsExplorer } from "@/components/reports/reports-explorer";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [summary, parties, profile, billWise, dayBook] = await Promise.all([
    getBusinessSummary(),
    getPartyBalances(),
    getCompanyProfile(),
    getBillWiseProfit(),
    getDayBook(),
  ]);

  const currency = profile?.currency ?? "INR";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Reports Directory
        </h1>
        <p className="text-xs text-muted-foreground">
          Financial statements, party ledgers, daybook entries, and GST returns.
        </p>
      </div>

      <ReportsExplorer
        summary={summary}
        parties={parties}
        billWise={billWise}
        dayBook={dayBook}
        currency={currency}
      />
    </div>
  );
}
