import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe,
  MapPin,
  Package,
  Phone,
  Plus,
  Receipt,
  ShieldCheck,
  Store,
} from "lucide-react";
import { getAvailableCompanies } from "@/actions/companies";
import { CompanySwitcher } from "@/components/layout/company-switcher";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
                Manage multiple business entities, GSTIN profiles &amp; dedicated e-commerce stores under Billora
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
                Billora Platform Architecture
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                Independent Ledgers
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              <strong>Billora</strong> is your business operating system. You can operate multiple distinct companies
              (e.g., <em>Sri Manjunatha Engineering Works</em>, retail hardware branches, or agro supply divisions)
              each having its own GST registration, invoice series, inventory, and online e-commerce storefront.
            </p>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((comp) => {
          return (
            <Card
              key={comp.id}
              className={`rounded-2xl shadow-xs transition-all ${
                comp.isActive ? "border-emerald-500/50 bg-emerald-500/[0.03]" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-black text-sm ${
                        comp.isActive
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {comp.companyName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-bold text-foreground truncate">
                        {comp.companyName}
                      </CardTitle>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">
                        {comp.taxId ? `GSTIN: ${comp.taxId}` : "Regular / Unregistered"}
                      </p>
                    </div>
                  </div>

                  {comp.isActive && (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none text-[10px] font-bold shrink-0">
                      ACTIVE
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3.5 text-xs">
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

                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <Link
                    href={`/store/${comp.storeSlug}`}
                    target="_blank"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "h-8 text-xs font-semibold gap-1.5 flex-1"
                    )}
                  >
                    <Store className="size-3 text-emerald-600" />
                    <span>E-Commerce Store</span>
                    <ExternalLink className="size-3 text-muted-foreground" />
                  </Link>

                  <Link
                    href="/settings"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
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
    </div>
  );
}
