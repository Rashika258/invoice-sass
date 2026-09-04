import Link from "next/link";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import type { DocumentType } from "@/generated/prisma/client";
import { getInvoices } from "@/actions/invoices";
import { getCompanyProfile } from "@/actions/settings";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
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
  const [documents, profile] = await Promise.all([
    getInvoices(documentType),
    getCompanyProfile(),
  ]);
  const currency = profile?.currency ?? "INR";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{meta.plural}</h1>
          <p className="text-muted-foreground">
            Create GST-ready {meta.plural.toLowerCase()} like Vyapar.
          </p>
        </div>
        <Button render={<Link href={`${meta.href}/new`} />}>
          <Plus className="mr-2 h-4 w-4" />
          New {meta.label}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All {meta.plural} ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No {meta.plural.toLowerCase()} yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>{meta.partyLabel}</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Link href={`/invoices/${doc.id}`} className="font-medium hover:underline">
                        {doc.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{doc.customer.name}</TableCell>
                    <TableCell>{format(doc.issueDate, "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Math.max(doc.total - doc.paidAmount, 0), currency)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(doc.total, currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
