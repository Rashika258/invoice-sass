import { getCustomers } from "@/actions/customers";
import { getItems } from "@/actions/items";
import { getCompanyProfile } from "@/actions/settings";
import { PosView } from "@/components/pos/pos-view";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const [items, customers, profile] = await Promise.all([
    getItems(),
    getCustomers(),
    getCompanyProfile(),
  ]);

  return (
    <PosView
      items={items}
      customers={customers}
      currency={profile?.currency ?? "INR"}
      companyState={profile?.state}
    />
  );
}
