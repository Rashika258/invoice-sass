import Link from "next/link";
import { ArrowLeft, Download, FileCode, FileText, CheckCircle2 } from "lucide-react";
import { getBusinessSummary } from "@/actions/reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ExportTallyPage() {
  const summary = await getBusinessSummary();

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

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 mb-3">
              <FileCode className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Sales Vouchers (XML)</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Export {summary.sales.length} sale invoices formatted for Tally XML import. Includes party GSTIN, invoice lines, and CGST/SGST/IGST breakdown.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border/60">
            <Button className="w-full text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white">
              <Download className="mr-1.5 size-3.5" />
              Download Sales XML
            </Button>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 mb-3">
              <FileText className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Purchase Vouchers (XML)</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Export {summary.purchases.length} purchase vouchers for direct import into your accountant&apos;s Tally company file.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border/60">
            <Button variant="outline" className="w-full text-xs font-semibold rounded-xl border-border">
              <Download className="mr-1.5 size-3.5" />
              Download Purchases XML
            </Button>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 mb-3">
              <CheckCircle2 className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Master Ledgers (Excel)</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Export {summary.partiesCount} customer and vendor ledger accounts with opening balances, addresses, and GSTINs.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border/60">
            <Button variant="outline" className="w-full text-xs font-semibold rounded-xl border-border">
              <Download className="mr-1.5 size-3.5" />
              Export Ledgers
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
