import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Package,
  Plus,
  Wallet,
} from "lucide-react";
import { getBusinessSummary } from "@/actions/reports";
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
import { formatCurrency } from "@/lib/invoice-utils";

export default async function DashboardPage() {
  const [summary, profile] = await Promise.all([
    getBusinessSummary(),
    getCompanyProfile(),
  ]);
  const currency = profile?.currency ?? "INR";

  const stats = [
    { label: "Sale", value: summary.saleTotal, href: "/invoices" },
    { label: "Purchase", value: summary.purchaseTotal, href: "/purchases" },
    { label: "To collect", value: summary.toCollect, href: "/customers" },
    { label: "To pay", value: summary.toPay, href: "/purchases" },
    { label: "Expense", value: summary.expenseTotal, href: "/expenses" },
    { label: "Cash in hand", value: summary.cashInHand, href: "/cash-bank" },
    { label: "Bank", value: summary.bankBalance, href: "/cash-bank" },
    { label: "Profit", value: summary.profit, href: "/reports" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Sale, purchase, stock, GST, and cash — the same daily view as Vyapar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button render={<Link href="/invoices/new" />}>
            <Plus className="mr-2 h-4 w-4" />
            Sale Invoice
          </Button>
          <Button variant="outline" render={<Link href="/purchases/new" />}>
            Purchase
          </Button>
          <Button variant="outline" render={<Link href="/payments" />}>
            Payment
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:border-primary/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(stat.value, currency)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {summary.lowStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Low stock alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {summary.lowStock.map((item) => (
              <span key={item.id} className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900">
                {item.name}: {item.stockQty} {item.unit || ""}
              </span>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-6">
            <Wallet className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Payment in</p>
              <p className="text-xl font-semibold">{formatCurrency(summary.paymentIn, currency)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-6">
            <Banknote className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Payment out</p>
              <p className="text-xl font-semibold">{formatCurrency(summary.paymentOut, currency)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-6">
            <ArrowUpRight className="h-8 w-8 text-emerald-600" />
            <ArrowDownLeft className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Net GST</p>
              <p className="text-xl font-semibold">
                {formatCurrency(summary.gstOutward.totalTax - summary.gstInward.totalTax, currency)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent sales</CardTitle>
          <Button variant="outline" size="sm" render={<Link href="/invoices" />}>View all</Button>
        </CardHeader>
        <CardContent>
          {summary.recentSales.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">Create your first sale invoice to see activity here.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.recentSales.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link href={`/invoices/${invoice.id}`} className="font-medium hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{format(invoice.issueDate, "dd MMM yyyy")}</TableCell>
                    <TableCell><InvoiceStatusBadge status={invoice.status} /></TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.total, currency)}</TableCell>
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
