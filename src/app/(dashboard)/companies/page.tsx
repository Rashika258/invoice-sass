import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Globe,
  Sparkles,
  Store,
} from "lucide-react";
import { getAvailableCompanies } from "@/actions/companies";
import { CompanySwitcher } from "@/components/layout/company-switcher";
import { CompaniesListView } from "@/components/companies/companies-list-view";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await getAvailableCompanies();

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                <span>Companies &amp; Multi-Firm Management</span>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">
                  MULTI-TENANT
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage multiple business entities, GSTIN profiles, custom brand logos &amp; browser favicons
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CompanySwitcher className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-3 py-2 text-xs font-bold shadow-xs hover:bg-primary/90" />
        </div>
      </div>

      {/* Billora Architecture Banner */}
      <div className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/5 via-card to-card p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">
                Billora Multi-Company Branding Engine
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                Independent Logos &amp; Favicons
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
              Every company or branch under your account can have its own custom brand logo and browser tab favicon.
              You can upload or change logos for <strong>your active firm</strong> or <strong>any other company</strong>.
              When you switch between firms, the sidebar logo, header, invoices, and browser tab icon update dynamically.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Companies Grid with Logo & Favicon Upload */}
      <CompaniesListView initialCompanies={companies} />
    </div>
  );
}
