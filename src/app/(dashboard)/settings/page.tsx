import { getCompanyProfile } from "@/actions/settings";
import { getTeamMembers } from "@/actions/team";
import { requireUser } from "@/lib/auth";
import { SettingsForm } from "@/components/settings/settings-form";
import { TeamManagement } from "@/components/settings/team-management";

export default async function SettingsPage() {
  const user = await requireUser();
  const [profile, members] = await Promise.all([
    getCompanyProfile(),
    getTeamMembers(),
  ]);

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings &amp; Administration</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure business details, custom logo, tax parameters, and manage team member access roles.
        </p>
      </div>

      <TeamManagement
        members={members}
        currentUserId={user.id}
        isAdmin={isAdmin}
      />

      <SettingsForm profile={profile} />
    </div>
  );
}
