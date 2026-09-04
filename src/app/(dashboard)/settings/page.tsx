import { getCompanyProfile } from "@/actions/settings";
import { VyaparSettingsView } from "@/components/settings/vyapar-settings-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getCompanyProfile();

  return <VyaparSettingsView profile={profile} />;
}
