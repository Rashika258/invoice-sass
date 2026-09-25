import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { getCompanyProfile } from "@/actions/settings";
import { formatCurrency } from "@/lib/invoice-utils";
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
import {
  ArrowLeft,
  Building2,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Receipt,
  User,
  Wallet,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await requireOrganization();
  const profile = await getCompanyProfile();
  const currency = profile?.currency ?? "INR";

  const customer = await db.customer.findFirst({
    where: { id, organizationId: organization.id },
    include: {
      invoices: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { issueDate: "desc" },
      },
      payments: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  // Calculate balances
  const sales = customer.invoices
    .filter((doc: any) => doc.documentType === "SALE")
    .reduce((sum: number, doc: any) => sum + doc.total, 0);
  const credits = customer.invoices
    .filter((doc: any) => doc.documentType === "CREDIT_NOTE")
    .reduce((sum: number, doc: any) => sum + doc.total, 0);
  const purchases = customer.invoices
    .filter((doc: any) => doc.documentType === "PURCHASE")
    .reduce((sum: number, doc: any) => sum + doc.total, 0);
  const debits = customer.invoices
    .filter((doc: any) => doc.documentType === "DEBIT_NOTE")
    .reduce((sum: number, doc: any) => sum + doc.total, 0);
  const received = customer.payments
    .filter((p: any) => p.direction === "IN")
    .reduce((sum: number, p: any) => sum + p.amount, 0);
  const paid = customer.payments
    .filter((p: any) => p.direction === "OUT")
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  const receivable = customer.openingBalance + sales - credits - received;
  const payable = purchases - debits - paid;
  const netBalance = receivable - payable;

  // Build combined transactions statement
  const transactions: Array<{
    id: string;
    date: Date;
    type: string;
    reference: string;
    docType: string;
    debit: number;
    credit: number;
    href: string;
    status?: string;
  }> = [];

  customer.invoices.forEach((inv: any) => {
    let debit = 0;
    let credit = 0;
    let href = `/invoices/${inv.id}`;

    if (inv.documentType === "SALE") {
      debit = inv.total;
      href = `/invoices/${inv.id}`;
    } else if (inv.documentType === "CREDIT_NOTE") {
      credit = inv.total;
      href = `/credit-notes/${inv.id}`;
    } else if (inv.documentType === "PURCHASE") {
      credit = inv.total;
      href = `/purchases/${inv.id}`;
    } else if (inv.documentType === "DEBIT_NOTE") {
      debit = inv.total;
      href = `/debit-notes/${inv.id}`;
    } else if (inv.documentType === "ESTIMATE") {
      href = `/estimates/${inv.id}`;
    } else if (inv.documentType === "PROFORMA") {
      href = `/proforma/${inv.id}`;
    } else if (inv.documentType === "CHALLAN") {
      href = `/challans/${inv.id}`;
    } else if (inv.documentType === "PURCHASE_ORDER") {
      href = `/purchase-orders/${inv.id}`;
    }

    transactions.push({
      id: inv.id,
      date: inv.issueDate,
      type: inv.documentType.replace(/_/g, " "),
      reference: inv.invoiceNumber,
      docType: inv.documentType,
      debit,
      credit,
      href,
      status: inv.status,
    });
  });

  customer.payments.forEach((pay: any) => {
    transactions.push({
      id: pay.id,
      date: pay.date,
      type: pay.direction === "IN" ? "PAYMENT IN" : "PAYMENT OUT",
      reference: pay.reference || pay.number,
      docType: "PAYMENT",
      debit: pay.direction === "OUT" ? pay.amount : 0,
      credit: pay.direction === "IN" ? pay.amount : 0,
      href: "/payments",
      status: "COMPLETED",
    });
  });

  transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  // WhatsApp reminder message
  const waText = encodeURIComponent(
    `Dear ${customer.name}, your current outstanding balance with ${profile?.companyName || "us"} is ${formatCurrency(
      Math.abs(netBalance),
      currency
    )}. Kindly settle at your earliest convenience. Thank you!`
  );
  const waUrl = customer.phone ? `https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}?text=${waText}` : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/customers">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{customer.name}</h1>
              <Badge variant="secondary" className="font-semibold text-xs">
                {customer.partyType}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              GSTIN / PAN: {customer.taxId || "Unregistered / Consumer"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {waUrl && (
            <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/20" asChild>
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4 mr-1.5" />
                WhatsApp Reminder
              </a>
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <Link href="/payment-in">
              <Wallet className="size-4 mr-1.5" />
              Record Payment
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/invoices/new">
              <Plus className="size-4 mr-1.5" />
              Create Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Receivable (To Collect)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(Math.max(0, receivable), currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pending payments from party</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Payable (To Pay)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(Math.max(0, payable), currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Purchases awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance > 0 ? "text-amber-600" : netBalance < 0 ? "text-emerald-600" : "text-foreground"}`}>
              {formatCurrency(Math.abs(netBalance), currency)}
              <span className="text-xs font-normal text-muted-foreground ml-1.5">
                {netBalance > 0 ? "(Dr / You Receive)" : netBalance < 0 ? "(Cr / You Pay)" : "(Settled)"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Opening Balance: {formatCurrency(customer.openingBalance, currency)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {transactions.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {customer.invoices.length} invoices, {customer.payments.length} payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Party Details & Contact Info */}
      <Card className="border-border/60 bg-card">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="size-4 text-brand" />
            Contact & Registration Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2.5">
            <Phone className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Phone Number</p>
              <p className="font-medium text-foreground">{customer.phone || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Email Address</p>
              <p className="font-medium text-foreground">{customer.email || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Billing Address</p>
              <p className="font-medium text-foreground">
                {[customer.address, customer.city, customer.state, customer.zipCode, customer.country]
                  .filter(Boolean)
                  .join(", ") || "No address on file"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Statement / Khata */}
      <Card className="border-border/60 bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Receipt className="size-4 text-brand" />
              Party Khata Ledger Statement
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chronological log of invoices, bills, credit/debit notes, and payments
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No transactions recorded for this party yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/60 bg-muted/40 hover:bg-muted/40">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Reference #</TableHead>
                  <TableHead className="font-semibold text-right">Debit (+)</TableHead>
                  <TableHead className="font-semibold text-right">Credit (-)</TableHead>
                  <TableHead className="font-semibold text-right">Status</TableHead>
                  <TableHead className="font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={`${tx.docType}-${tx.id}`}>
                    <TableCell className="font-medium text-xs">{format(tx.date, "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px] font-medium">
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground font-medium">
                      {tx.reference}
                    </TableCell>
                    <TableCell className="text-right text-xs font-semibold text-foreground">
                      {tx.debit > 0 ? formatCurrency(tx.debit, currency) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {tx.credit > 0 ? formatCurrency(tx.credit, currency) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {tx.status && (
                        <Badge
                          variant={tx.status === "PAID" || tx.status === "COMPLETED" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {tx.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
                        <Link href={tx.href}>View</Link>
                      </Button>
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
