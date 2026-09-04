import { format } from "date-fns";
import { Plus } from "lucide-react";
import { getBankAccounts, getExpenses } from "@/actions/money";
import { getCompanyProfile } from "@/actions/settings";
import { DeleteExpenseButton, ExpenseFormDialog } from "@/components/money/expense-form-dialog";
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

export default async function ExpensesPage() {
  const [expenses, accounts, profile] = await Promise.all([
    getExpenses(),
    getBankAccounts(),
    getCompanyProfile(),
  ]);
  const currency = profile?.currency ?? "INR";
  const bankAccounts = accounts.map(({ payments: _p, expenses: _e, ...account }) => account);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track shop expenses by category, GST, and cash/bank.</p>
        </div>
        <ExpenseFormDialog
          accounts={bankAccounts}
          trigger={<Button><Plus className="mr-2 h-4 w-4" />Add Expense</Button>}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All expenses ({expenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No expenses yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Paid from</TableHead>
                  <TableHead className="text-right">GST</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.number}</TableCell>
                    <TableCell>{expense.category}{expense.description ? ` · ${expense.description}` : ""}</TableCell>
                    <TableCell>{format(expense.date, "dd MMM yyyy")}</TableCell>
                    <TableCell>{expense.bankAccount.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.taxAmount, currency)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(expense.amount + expense.taxAmount, currency)}</TableCell>
                    <TableCell className="text-right"><DeleteExpenseButton id={expense.id} /></TableCell>
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
