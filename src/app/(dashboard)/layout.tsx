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
    <div className="flex h-screen h-dvh w-full overflow-hidden bg-background print:h-auto print:overflow-visible print:bg-white">
      {/* Role Interactive Tour (Session #1, #2, #3) */}
      <div className="print:hidden">
        <RoleOnboardingTour userRole={user.role} />
      </div>

      {/* Non-scrolling fixed sidebar */}
      <div className="print:hidden">
        <AppSidebar
          userName={user.name}
          companyName={companyName}
          userRole={user.role}
          logoUrl={logoUrl}
        />
      </div>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden print:h-auto print:overflow-visible">
        {/* Mobile Header (small screens) */}
        <div className="print:hidden">
          <MobileHeader
            userName={user.name}
            companyName={companyName}
            userRole={user.role}
            logoUrl={logoUrl}
          />
        </div>

        {/* Desktop Fixed Header */}
        <div className="hidden lg:block shrink-0 z-20 border-b border-border bg-background/95 backdrop-blur-xs print:hidden">
          <AppTopHeader
            userName={user.name}
            companyName={companyName}
            taxId={taxId}
            phone={phone}
            logoUrl={logoUrl}
          />
        </div>

        {/* Network / Offline Status Banner — only visible when offline or sync pending */}
        <div className="print:hidden">
          <NetworkStatusBanner />
        </div>

        {/* Only the main content area scrolls */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-20 lg:pb-7 print:p-0 print:m-0 print:overflow-visible print:h-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-7 print:max-w-none print:p-0 print:m-0">{children}</div>
          {/* Quick Create Floating Action Button */}
          <div className="print:hidden">
            <QuickCreateMenu />
          </div>
        </main>

        {/* Native Mobile Bottom Navigation Bar */}
        <div className="print:hidden">
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
}
