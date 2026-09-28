"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ExternalLink,
  ImageIcon,
  MapPin,
  Package,
  Phone,
  Plus,
  Receipt,
  Sparkles,
  Store,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import type { CompanySummaryItem } from "@/actions/companies";
import { switchActiveCompanyAction } from "@/actions/companies";
import { updateBrowserFavicon } from "@/lib/brand-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyLogoDialog } from "@/components/companies/company-logo-dialog";
import { cn } from "@/lib/utils";

interface CompaniesListViewProps {
  initialCompanies: CompanySummaryItem[];
}

export function CompaniesListView({ initialCompanies }: CompaniesListViewProps) {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanySummaryItem[]>(initialCompanies);
  const [selectedCompanyForLogo, setSelectedCompanyForLogo] = useState<CompanySummaryItem | null>(null);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState<string | null>(null);

  const activeCompany = companies.find((c) => c.isActive) || companies[0];

  const handleOpenLogoDialog = (company: CompanySummaryItem) => {
    setSelectedCompanyForLogo(company);
    setLogoDialogOpen(true);
  };

  const handleSwitchCompany = async (company: CompanySummaryItem) => {
    if (company.isActive) return;
    setIsSwitching(company.id);
    try {
      const res = await switchActiveCompanyAction(company.id);
      if (res.logoUrl) {
        updateBrowserFavicon(res.logoUrl);
      } else {
        updateBrowserFavicon("/favicon.ico");
      }
      toast.success(`Switched active firm to ${company.companyName}`);
      setCompanies((prev) =>
        prev.map((c) => ({
          ...c,
          isActive: c.id === company.id,
        }))
      );
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to switch firm");
    } finally {
      setIsSwitching(null);
    }
  };

  const handleLogoSuccess = (newLogoUrl: string | null) => {
    if (!selectedCompanyForLogo) return;
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === selectedCompanyForLogo.id ? { ...c, logoUrl: newLogoUrl } : c
      )
    );
  };

  return (
    <>
      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((comp) => {
          return (
            <Card
              key={comp.id}
              className={`rounded-2xl shadow-xs transition-all relative overflow-hidden ${
                comp.isActive
                  ? "border-emerald-500/50 bg-emerald-500/[0.03] ring-1 ring-emerald-500/20"
                  : "hover:border-border"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Logo or Letter Fallback */}
                    <div className="relative group shrink-0">
                      {comp.logoUrl ? (
                        <img
                          src={comp.logoUrl}
                          alt={comp.companyName}
                          className="size-11 rounded-xl object-contain border border-border bg-background p-1 shadow-2xs group-hover:opacity-85 transition-opacity"
                        />
                      ) : (
                        <div
                          className={`flex size-11 shrink-0 items-center justify-center rounded-xl font-black text-sm shadow-2xs ${
                            comp.isActive
                              ? "bg-emerald-600 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {comp.companyName.charAt(0)}
                        </div>
                      )}

                      {/* Quick upload icon badge on hover */}
                      <button
                        type="button"
                        onClick={() => handleOpenLogoDialog(comp)}
                        title="Upload / Change Logo"
                        className="absolute -bottom-1 -right-1 size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Upload className="size-2.5" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm font-bold text-foreground truncate">
                        {comp.companyName}
                      </CardTitle>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">
                        {comp.taxId ? `GSTIN: ${comp.taxId}` : "Regular / Unregistered"}
                      </p>
                    </div>
                  </div>

                  {comp.isActive ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none text-[10px] font-bold shrink-0">
                      ACTIVE FIRM
                    </Badge>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isSwitching === comp.id}
                      onClick={() => handleSwitchCompany(comp)}
                      className="h-6 text-[10px] font-bold text-muted-foreground hover:text-foreground px-2"
                    >
                      {isSwitching === comp.id ? "Switching..." : "Switch"}
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3.5 text-xs">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-xl border border-border/60 bg-card">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Package className="size-3" />
                      <span>Items</span>
                    </span>
                    <div className="font-mono font-bold text-sm mt-0.5">
                      {comp.itemsCount} products
                    </div>
                  </div>
                  <div className="p-2 rounded-xl border border-border/60 bg-card">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Receipt className="size-3" />
                      <span>Invoices</span>
                    </span>
                    <div className="font-mono font-bold text-sm mt-0.5">
                      {comp.invoicesCount} bills
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{comp.address || comp.state || "Karnataka, India"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="size-3 shrink-0" />
                    <span className="font-mono">{comp.phone || "9483374137"}</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenLogoDialog(comp)}
                    className="h-8 text-xs font-semibold gap-1.5 flex-1"
                  >
                    <ImageIcon className="size-3 text-primary" />
                    <span>Upload Logo &amp; Favicon</span>
                  </Button>

                  <Link
                    href={`/store/${comp.storeSlug}`}
                    target="_blank"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "h-8 text-xs font-semibold text-muted-foreground hover:text-foreground px-2"
                    )}
                    title="View Online Store"
                  >
                    <Store className="size-3" />
                  </Link>

                  <Link
                    href="/settings"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "h-8 text-xs font-semibold text-muted-foreground hover:text-foreground px-2"
                    )}
                  >
                    Manage
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reusable Logo & Favicon Dialog */}
      {selectedCompanyForLogo && (
        <CompanyLogoDialog
          companyId={selectedCompanyForLogo.id}
          companyName={selectedCompanyForLogo.companyName}
          currentLogoUrl={selectedCompanyForLogo.logoUrl}
          isActive={selectedCompanyForLogo.isActive}
          open={logoDialogOpen}
          onOpenChange={setLogoDialogOpen}
          onSuccess={handleLogoSuccess}
        />
      )}
    </>
  );
}
