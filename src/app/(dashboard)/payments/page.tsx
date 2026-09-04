import { format } from "date-fns";
import { Plus } from "lucide-react";
import { getCustomers } from "@/actions/customers";
import { getInvoices } from "@/actions/invoices";
import { getBankAccounts, getPayments } from "@/actions/money";
import { getCompanyProfile } from "@/actions/settings";
import { DeletePaymentButton, PaymentFormDialog } from "@/components/money/payment-form-dialog";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Record payment in and payment out against parties and bills.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PaymentFormDialog
            direction="IN"
            parties={parties}
            accounts={bankAccounts}
            invoices={saleBills}
            trigger={<Button><Plus className="mr-2 h-4 w-4" />Payment In</Button>}
          />
          <PaymentFormDialog
            direction="OUT"
            parties={parties}
            accounts={bankAccounts}
            invoices={purchaseBills}
            trigger={<Button variant="outline"><Plus className="mr-2 h-4 w-4" />Payment Out</Button>}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All payments ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No payments yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.number}</TableCell>
                    <TableCell>{payment.direction === "IN" ? "Payment In" : "Payment Out"}</TableCell>
                    <TableCell>{payment.party?.name || "—"}</TableCell>
                    <TableCell>{format(payment.date, "dd MMM yyyy")}</TableCell>
                    <TableCell>{payment.mode}</TableCell>
                    <TableCell>{payment.bankAccount.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.amount, currency)}</TableCell>
                    <TableCell className="text-right"><DeletePaymentButton id={payment.id} /></TableCell>
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
