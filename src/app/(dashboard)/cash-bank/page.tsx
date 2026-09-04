import { db } from "@/lib/db";
import { getBusinessSummary } from "@/actions/reports";
import { getCompanyProfile } from "@/actions/settings";
import { requireOrganization } from "@/lib/organization";
import { CashBankHub } from "@/components/money/cash-bank-hub";

export const dynamic = "force-dynamic";

export default async function CashBankPage() {
  const organization = await requireOrganization();
  const [summary, profile, cheques] = await Promise.all([
    getBusinessSummary(),
    getCompanyProfile(),
    db.payment.findMany({
      where: { organizationId: organization.id, mode: "CHEQUE" },
      include: { party: true, bankAccount: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const currency = profile?.currency ?? "INR";

  return (
    <CashBankHub
      accounts={summary.cashBank}
      cheques={cheques}
      currency={currency}
    />
  );
}
