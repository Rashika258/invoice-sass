import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBusinessSummary } from "@/actions/reports";
import { getCompanyProfile } from "@/actions/settings";
import { TallyExporter } from "@/components/utilities/tally-exporter";

export const dynamic = "force-dynamic";

export default async function ExportTallyPage() {
  const [summary, profile] = await Promise.all([
    getBusinessSummary(),
    getCompanyProfile(),
  ]);

  const companyName = profile?.companyName || "My Business";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/utilities/import-items"
            className="flex size-8 items-center justify-center rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Exports To Tally
            </h1>
            <p className="text-xs text-muted-foreground">
              Export sales vouchers, purchase bills, and party ledgers directly into Tally ERP 9 / Tally Prime format.
            </p>
          </div>
        </div>
      </div>

      <TallyExporter
        companyName={companyName}
        sales={summary.sales}
        purchases={summary.purchases}
        partiesCount={summary.partiesCount}
      />
    </div>
  );
}
