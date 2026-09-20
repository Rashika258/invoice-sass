import Link from "next/link";
import { ArrowLeft, Download, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/invoice-utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GstrReportPage() {
  const org = await requireOrganization();
  const invoices = await db.invoice.findMany({
    where: { organizationId: org.id, status: { not: "CANCELLED" } },
    include: { customer: true, items: true },
    orderBy: { issueDate: "desc" },
  });

  const b2bInvoices = invoices.filter((i) => i.customer?.taxId);
  const b2cInvoices = invoices.filter((i) => !i.customer?.taxId);

  const totalTaxable = invoices.reduce((sum, i) => sum + i.subtotal, 0);
  const totalCgst = invoices.reduce((sum, i) => sum + i.cgstAmount, 0);
  const totalSgst = invoices.reduce((sum, i) => sum + i.sgstAmount, 0);
  const totalIgst = invoices.reduce((sum, i) => sum + i.igstAmount, 0);
  const totalTax = totalCgst + totalSgst + totalIgst;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ShieldCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
              <span>GSTR-1 &amp; GSTR-3B Tax Summary</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              GST Portal compliant outward supplies liability report with B2B vs B2C breakdown.
            </p>
          </div>
        </div>
      </div>

      {/* Tax Summary Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-slate-600 bg-card">
          <div className="text-xs font-medium text-muted-foreground">Total Taxable Value</div>
          <div className="text-xl font-bold font-mono mt-1 text-foreground">
            {formatCurrency(totalTaxable)}
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-indigo-600 bg-card">
          <div className="text-xs font-medium text-muted-foreground">Central Tax (CGST)</div>
          <div className="text-xl font-bold font-mono mt-1 text-indigo-600 dark:text-indigo-400">
            {formatCurrency(totalCgst)}
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-600 bg-card">
          <div className="text-xs font-medium text-muted-foreground">State Tax (SGST)</div>
          <div className="text-xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalSgst)}
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-rose-600 bg-card">
          <div className="text-xs font-medium text-muted-foreground">Integrated Tax (IGST)</div>
          <div className="text-xl font-bold font-mono mt-1 text-rose-600 dark:text-rose-400">
            {formatCurrency(totalIgst)}
          </div>
        </Card>
      </div>

      {/* B2B Supplies Table */}
      <Card className="rounded-xl border border-border/60 shadow-xs">
        <CardHeader className="p-4 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="size-4 text-emerald-600" />
            <span>Table 4A - B2B Registered Outward Supplies ({b2bInvoices.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {b2bInvoices.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No B2B invoices recorded in this period.
              </div>
            ) : (
              b2bInvoices.map((inv) => (
                <div key={inv.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-muted/10 transition-colors">
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <span>{inv.customer?.name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                        GSTIN: {inv.customer?.taxId}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground text-[11px] mt-0.5 font-mono">
                      Inv #{inv.invoiceNumber} • {new Date(inv.issueDate).toLocaleDateString("en-IN")}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="font-bold text-foreground">{formatCurrency(inv.total)}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Tax: {formatCurrency(inv.cgstAmount + inv.sgstAmount + inv.igstAmount)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
