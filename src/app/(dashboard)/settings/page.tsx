import { getCompanyProfile } from "@/actions/settings";
import { BusinessSettingsView } from "@/components/settings/business-settings-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getCompanyProfile();

  return <BusinessSettingsView profile={profile} />;
}
