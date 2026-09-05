import { Suspense } from "react";
import { getCompanyProfile } from "@/actions/settings";
import { BusinessSettingsView } from "@/components/settings/business-settings-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getCompanyProfile();

  return (
    <Suspense fallback={<div className="p-6 text-xs text-muted-foreground">Loading settings...</div>}>
      <BusinessSettingsView profile={profile} />
    </Suspense>
  );
}
