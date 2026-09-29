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
  const companyName = profile?.companyName || "My Business";
  const taxId = profile?.taxId;
  const phone = profile?.phone;
  const address = [profile?.address, profile?.city, profile?.state, profile?.zipCode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="print:hidden">
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
        companyName={companyName}
        taxId={taxId}
        phone={phone}
        address={address}
      />
    </div>
  );
}
