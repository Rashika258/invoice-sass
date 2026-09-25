import { getBankAccounts } from "@/actions/money";
import { getCompanyProfile } from "@/actions/settings";
import { ExpenseFormPageClient } from "@/components/money/expense-form-page-client";

export default async function NewExpensePage() {
  const [accounts, profile] = await Promise.all([
    getBankAccounts(),
    getCompanyProfile(),
  ]);

  const bankAccounts = accounts.map(({ payments: _p, expenses: _e, ...account }) => account);

  return (
    <ExpenseFormPageClient
      bankAccounts={bankAccounts}
      currency={profile?.currency ?? "INR"}
    />
  );
}
