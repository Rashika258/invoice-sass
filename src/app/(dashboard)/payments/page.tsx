import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, Plus, Wallet } from "lucide-react";
import { getCustomers } from "@/actions/customers";
import { getInvoices } from "@/actions/invoices";
import { getBankAccounts, getPayments } from "@/actions/money";
import { getCompanyProfile } from "@/actions/settings";
import { DeletePaymentButton, PaymentFormDialog } from "@/components/money/payment-form-dialog";
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
import { formatCurrency } from "@/lib/invoice-utils";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const [payments, parties, accounts, sales, purchases, profile] = await Promise.all([
    getPayments(),
    getCustomers(),
    getBankAccounts(),
    getInvoices("SALE"),
    getInvoices("PURCHASE"),
    getCompanyProfile(),
  ]);
  const currency = profile?.currency ?? "INR";
  const bankAccounts = accounts.map(({ payments: _p, expenses: _e, ...account }) => account);
  const saleBills = sales.map((doc) => ({
    id: doc.id,
    invoiceNumber: doc.invoiceNumber,
    total: doc.total,
    paidAmount: doc.paidAmount,
    customerId: doc.customerId,
  }));
  const purchaseBills = purchases.map((doc) => ({
    id: doc.id,
    invoiceNumber: doc.invoiceNumber,
    total: doc.total,
    paidAmount: doc.paidAmount,
    customerId: doc.customerId,
  }));

  const totalIn = payments
    .filter((p) => p.direction === "IN")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOut = payments
    .filter((p) => p.direction === "OUT")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">Payments (Receipts &amp; Payouts)</h1>
            <Badge variant="outline" className="text-xs font-bold font-mono">
              {payments.length} Records
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Record customer receipts (Payment In) and vendor payouts (Payment Out) linked to invoices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PaymentFormDialog
            direction="IN"
            parties={parties}
            accounts={bankAccounts}
            invoices={saleBills}
            trigger={
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 px-4 gap-1.5 shadow-xs">
                <ArrowDownLeft className="size-4" />
                <span>+ Payment In</span>
              </Button>
            }
          />
          <PaymentFormDialog
            direction="OUT"
            parties={parties}
            accounts={bankAccounts}
            invoices={purchaseBills}
            trigger={
              <Button variant="outline" className="font-bold h-9 px-4 gap-1.5 shadow-xs border-border hover:bg-muted">
                <ArrowUpRight className="size-4" />
                <span>+ Payment Out</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Card className="border-l-4 border-l-emerald-600 bg-emerald-500/5">
          <CardContent className="p-4">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Total Payment In (Receipts)
            </span>
            <p className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {formatCurrency(totalIn, currency)}
            </p>
            <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
              Collected from customers
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-600 bg-rose-500/5">
          <CardContent className="p-4">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              Total Payment Out (Disbursed)
            </span>
            <p className="mt-2 text-2xl font-black text-rose-700 dark:text-rose-400">
              {formatCurrency(totalOut, currency)}
            </p>
            <p className="mt-1 text-[11px] text-rose-700/80 dark:text-rose-400/80">
              Paid to suppliers &amp; vendors
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#1976D2]">
          <CardContent className="p-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Net Cash Movement
            </span>
            <p className={`mt-2 text-2xl font-black ${totalIn >= totalOut ? "text-emerald-600" : "text-rose-600"}`}>
              {formatCurrency(totalIn - totalOut, currency)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Inward minus Outward cashflow
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-xl shadow-xs">
        <CardHeader className="p-4 pb-2 border-b bg-muted/20">
          <CardTitle className="text-sm font-black uppercase tracking-wider">
            All Payment Transactions ({payments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No payment transactions recorded yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Type</TableHead>
                  <TableHead>Receipt / Voucher No.</TableHead>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Account / Bank</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead className="text-right w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const isIn = payment.direction === "IN";

                  return (
                    <TableRow key={payment.id} className="group hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            isIn
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {isIn ? <ArrowDownLeft className="size-3" /> : <ArrowUpRight className="size-3" />}
                          {isIn ? "PAYMENT IN" : "PAYMENT OUT"}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold">
                        {payment.number}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {payment.party?.name || "Direct Party"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {payment.bankAccount.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {payment.mode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(payment.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell
                        className={`text-right font-black text-xs font-mono ${
                          isIn ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isIn ? "+" : "-"}
                        {formatCurrency(payment.amount, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeletePaymentButton id={payment.id} />
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
