import { Plus } from "lucide-react";
import { getBusinessSummary } from "@/actions/reports";
import { getCompanyProfile } from "@/actions/settings";
import {
  BankAccountFormDialog,
  DeleteBankAccountButton,
} from "@/components/money/bank-account-form-dialog";
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

export default async function CashBankPage() {
  const [summary, profile] = await Promise.all([getBusinessSummary(), getCompanyProfile()]);
  const currency = profile?.currency ?? "INR";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cash & Bank</h1>
          <p className="text-muted-foreground">Cash in hand and bank balances, updated from payments and expenses.</p>
        </div>
        <BankAccountFormDialog trigger={<Button><Plus className="mr-2 h-4 w-4" />Add Account</Button>} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cash in hand</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{formatCurrency(summary.cashInHand, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Bank balance</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{formatCurrency(summary.bankBalance, currency)}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Accounts</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Account / IFSC</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.cashBank.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.accountType}</TableCell>
                  <TableCell>{[account.accountNumber, account.ifsc].filter(Boolean).join(" · ") || "—"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(account.balance, currency)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <BankAccountFormDialog
                        account={account}
                        trigger={<Button variant="ghost" size="sm">Edit</Button>}
                      />
                      <DeleteBankAccountButton id={account.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
