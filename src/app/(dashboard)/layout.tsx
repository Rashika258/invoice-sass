import {
  AppSidebar,
  DesktopHeader,
  MobileHeader,
} from "@/components/layout/app-sidebar";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AppSidebar
        userName={user.name}
        companyName={user.organization.profile?.companyName ?? user.organization.name}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader
          userName={user.name}
          companyName={user.organization.profile?.companyName ?? user.organization.name}
        />
        <DesktopHeader />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
