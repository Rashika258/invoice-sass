import { getItems } from "@/actions/items";
import { getCompanyProfile } from "@/actions/settings";
import { ItemsView } from "@/components/items/items-view";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const [items, profile] = await Promise.all([getItems(), getCompanyProfile()]);
  const currency = profile?.currency ?? "INR";

  return <ItemsView items={items as any} currency={currency} />;
}
