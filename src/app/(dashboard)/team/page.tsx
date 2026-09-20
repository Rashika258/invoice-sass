import { Suspense } from "react";
import { Metadata } from "next";
import { getTeamMembers } from "@/actions/team";
import { getCurrentUser } from "@/lib/auth";
import { TeamManagement } from "@/components/settings/team-management";

export const metadata: Metadata = {
  title: "Team Management | Billora",
  description: "Manage team members, roles, permissions, and staff access in Billora OS.",
};

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const [currentUser, members] = await Promise.all([
    getCurrentUser(),
    getTeamMembers(),
  ]);

  return (
    <div className="space-y-6 max-w-5xl select-none">
      <div className="border-b border-border/80 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Team &amp; Role Management</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Invite employees, managers, CA auditors, and sales staff with role-based access controls.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="p-6 text-xs text-muted-foreground">Loading team directory...</div>}>
        <TeamManagement
          members={members}
          currentUserId={currentUser?.id ?? ""}
          isAdmin={currentUser?.role === "ADMIN"}
        />
      </Suspense>
    </div>
  );
}
