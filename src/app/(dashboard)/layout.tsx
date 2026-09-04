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

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AppSidebar userName={user.name} companyName={companyName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader userName={user.name} companyName={companyName} />
        <div className="hidden lg:block">
          <VyaparHeader
            userName={user.name}
            companyName={companyName}
            taxId={taxId}
            phone={phone}
          />
        </div>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-7">{children}</div>
        </main>
      </div>
    </div>
  );
}
