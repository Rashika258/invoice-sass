import { AppSidebar, MobileHeader } from "@/components/layout/app-sidebar";
import { VyaparHeader } from "@/components/layout/vyapar-header";
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
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Non-scrolling fixed sidebar */}
      <AppSidebar
        userName={user.name}
        companyName={companyName}
        userRole={user.role}
        logoUrl={logoUrl}
      />

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
        {/* Mobile Header (small screens) */}
        <MobileHeader
          userName={user.name}
          companyName={companyName}
          userRole={user.role}
          logoUrl={logoUrl}
        />

        {/* Desktop Fixed Header */}
        <div className="hidden lg:block shrink-0 z-20 border-b border-border bg-background/95 backdrop-blur-xs">
          <VyaparHeader
            userName={user.name}
            companyName={companyName}
            taxId={taxId}
            phone={phone}
            logoUrl={logoUrl}
          />
        </div>

        {/* Only the main content area scrolls */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-7">{children}</div>
        </main>
      </div>
    </div>
  );
}
