import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Eye, Plus, Search } from "lucide-react";
import type { DocumentType } from "@/generated/prisma/client";
import { getInvoices } from "@/actions/invoices";
import { getCompanyProfile } from "@/actions/settings";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DOCUMENT_META } from "@/lib/documents";
import { formatCurrency } from "@/lib/invoice-utils";

export async function DocumentListPage({ documentType }: { documentType: DocumentType }) {
  const meta = DOCUMENT_META[documentType];
  const isPurchase = meta.isPurchase;

  const [documents, profile] = await Promise.all([
    getInvoices(documentType),
    getCompanyProfile(),
  ]);
  const currency = profile?.currency ?? "INR";

  const totalAmount = documents.reduce((acc, doc) => acc + doc.total, 0);
  const totalBalanceDue = documents.reduce(
    (acc, doc) => acc + Math.max(doc.total - doc.paidAmount, 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{meta.plural}</h1>
            <Badge
              variant="outline"
              className={
                isPurchase
                  ? "border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  : "border-[#D32F2F]/30 text-[#D32F2F] bg-[#D32F2F]/10 text-[11px] font-medium px-2 py-0.5 rounded-full"
              }
            >
              {documents.length} Records
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            GST-compliant {meta.plural.toLowerCase()} with invoice tracking, PDF printing, and balances.
          </p>
        </div>

        <Link
          href={`${meta.href}/new`}
          className={
            isPurchase
              ? "inline-flex items-center justify-center bg-[#1976D2] hover:bg-[#1565c0] text-white font-medium h-8 px-3.5 gap-1.5 shadow-xs rounded-lg text-xs transition-all active:scale-[0.98] select-none"
              : "inline-flex items-center justify-center bg-[#D32F2F] hover:bg-[#b71c1c] text-white font-medium h-8 px-3.5 gap-1.5 shadow-xs rounded-lg text-xs transition-all active:scale-[0.98] select-none"
          }
        >
          <Plus className="size-3.5" />
          <span>Create {meta.label}</span>
        </Link>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Card className={`border-border/60 border-l-4 ${isPurchase ? "border-l-[#1976D2]" : "border-l-[#D32F2F]"} shadow-xs`}>
          <CardContent className="p-4">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Total {meta.label} Volume
            </span>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {formatCurrency(totalAmount, currency)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Across all {documents.length} {meta.plural.toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 border-l-4 border-l-rose-600 bg-rose-500/[0.03] dark:bg-rose-500/[0.06] shadow-xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              Outstanding Balance Due
            </span>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-rose-700 dark:text-rose-400">
              {formatCurrency(totalBalanceDue, currency)}
            </p>
            <p className="mt-1 text-[11px] text-rose-700/80 dark:text-rose-400/80">
              {documents.filter((d) => d.total > d.paidAmount).length} pending payments
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 border-l-4 border-l-emerald-600 shadow-xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Settled Amount
            </span>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatCurrency(Math.max(totalAmount - totalBalanceDue, 0), currency)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Collected / Paid receipts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-xl shadow-xs">
        <CardContent className="p-0">
          {documents.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground space-y-3">
              <p>No {meta.plural.toLowerCase()} created yet.</p>
              <Link
                href={`${meta.href}/new`}
                className={
                  isPurchase
                    ? "inline-flex items-center justify-center rounded-md bg-[#1976D2] hover:bg-[#1565C0] text-white font-semibold h-8 px-3 text-xs shadow-xs"
                    : "inline-flex items-center justify-center rounded-md bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold h-8 px-3 text-xs shadow-xs"
                }
              >
                <Plus className="size-4 mr-1.5" />
                <span>Create First {meta.label}</span>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Bill No.</TableHead>
                  <TableHead>{meta.partyLabel}</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Balance Due</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right w-20">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => {
                  const balance = Math.max(doc.total - doc.paidAmount, 0);

                  return (
                    <TableRow key={doc.id} className="group hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs font-bold">
                        <Link
                          href={`/invoices/${doc.id}`}
                          className="hover:text-primary hover:underline transition-colors"
                        >
                          {doc.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {doc.customer.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(doc.issueDate), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={doc.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs">
                        {balance > 0 ? (
                          <span className="text-rose-600 font-bold">
                            {formatCurrency(balance, currency)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">₹ 0.00</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-black text-xs">
                        {formatCurrency(doc.total, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/invoices/${doc.id}`}
                          className="inline-flex size-7 items-center justify-center rounded-md hover:bg-muted opacity-70 group-hover:opacity-100 transition-opacity"
                          title="View Bill"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
