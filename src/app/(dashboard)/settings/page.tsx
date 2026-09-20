import { Suspense } from "react";
import { getCompanyProfile } from "@/actions/settings";
import { getTeamMembers } from "@/actions/team";
import { getCurrentUser } from "@/lib/auth";
import { BusinessSettingsView } from "@/components/settings/business-settings-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [profile, currentUser, teamMembers] = await Promise.all([
    getCompanyProfile(),
    getCurrentUser(),
    getTeamMembers(),
  ]);

  return (
    <Suspense fallback={<div className="p-6 text-xs text-muted-foreground">Loading settings...</div>}>
      <BusinessSettingsView
        profile={profile}
        teamMembers={teamMembers}
        currentUserId={currentUser?.id ?? ""}
        isAdmin={currentUser?.role === "ADMIN"}
        totpEnabled={(currentUser as any)?.totpEnabled ?? false}
      />
    </Suspense>
  );
}
