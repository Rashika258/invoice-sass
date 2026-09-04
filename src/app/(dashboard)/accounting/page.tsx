import { getAccountingStats } from "@/actions/accounting";
import { AccountingDashboard } from "@/components/accounting/accounting-dashboard";

export const dynamic = "force-dynamic";

export default async function AccountingPage() {
  const stats = await getAccountingStats();
  return <AccountingDashboard stats={stats} />;
}
