import { AppSidebar, MobileHeader } from "@/components/layout/app-sidebar";
import { AppTopHeader } from "@/components/layout/app-top-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { RoleOnboardingTour } from "@/components/common/role-onboarding-tour";
import { NetworkStatusBanner } from "@/components/common/network-status-banner";
import { QuickCreateMenu } from "@/components/common/quick-create-menu";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const companyName =
    user.organization.profile?.companyName || user.organization.name || "My Business";
  const taxId = user.organization.profile?.taxId;
  const phone = user.organization.profile?.phone;
  const logoUrl = user.organization.profile?.logoUrl;

  return (
    <div className="flex h-screen h-dvh w-full overflow-hidden bg-background">
      {/* Role Interactive Tour (Session #1, #2, #3) */}
      <RoleOnboardingTour userRole={user.role} />

      {/* Non-scrolling fixed sidebar */}
      <AppSidebar
        userName={user.name}
        companyName={companyName}
        userRole={user.role}
        logoUrl={logoUrl}
      />

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        {/* Mobile Header (small screens) */}
        <MobileHeader
          userName={user.name}
          companyName={companyName}
          userRole={user.role}
          logoUrl={logoUrl}
        />

        {/* Desktop Fixed Header */}
        <div className="hidden lg:block shrink-0 z-20 border-b border-border bg-background/95 backdrop-blur-xs">
          <AppTopHeader
            userName={user.name}
            companyName={companyName}
            taxId={taxId}
            phone={phone}
            logoUrl={logoUrl}
          />
        </div>

        {/* Network / Offline Status Banner — only visible when offline or sync pending */}
        <NetworkStatusBanner />

        {/* Only the main content area scrolls */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-20 lg:pb-7">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-7">{children}</div>
        {/* Quick Create Floating Action Button */}
        <QuickCreateMenu />
        </main>

        {/* Native Mobile Bottom Navigation Bar */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
