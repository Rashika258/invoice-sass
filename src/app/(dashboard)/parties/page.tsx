import { getPartyBalances } from "@/actions/reports";
import { getCompanyProfile } from "@/actions/settings";
import { PartiesView } from "@/components/customers/parties-view";

export const dynamic = "force-dynamic";

export default async function PartiesPage() {
  const [parties, profile] = await Promise.all([
    getPartyBalances(),
    getCompanyProfile(),
  ]);
  const currency = profile?.currency ?? "INR";

  return <PartiesView parties={parties as any} currency={currency} />;
}
