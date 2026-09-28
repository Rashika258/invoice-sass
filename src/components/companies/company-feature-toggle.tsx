"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Check,
  CheckCheck,
  FileText,
  HelpCircle,
  Loader2,
  Package,
  Receipt,
  Save,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { SidebarFeature } from "@/generated/prisma/client";
import { getCompanyFeatures, updateCompanyFeatures } from "@/actions/companies";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface FeatureInfo {
  key: SidebarFeature;
  title: string;
  description: string;
  category: string;
}

const FEATURE_METADATA: Record<SidebarFeature, { title: string; description: string; category: string }> = {
  [SidebarFeature.INVOICES]: {
    title: "Sale Invoices & Billing",
    description: "Create and manage tax invoices, quotations, proforma bills, and credit notes.",
    category: "Sales",
  },
  [SidebarFeature.PURCHASES]: {
    title: "Purchases & Vendor Bills",
    description: "Record supplier purchases, purchase orders, expenses, and debit notes.",
    category: "Purchases",
  },
  [SidebarFeature.ITEMS]: {
    title: "Items & Inventory",
    description: "Products catalog, inventory tracking, stock movements, and barcode labels.",
    category: "Inventory",
  },
  [SidebarFeature.CUSTOMERS]: {
    title: "Parties & Directory",
    description: "Customer and supplier accounts, ledger balances, and address books.",
    category: "Parties",
  },
  [SidebarFeature.PAYMENTS]: {
    title: "Cash & Bank Accounts",
    description: "Track money in/out, bank accounts, cheques, and payment receipts.",
    category: "Finance",
  },
  [SidebarFeature.REPORTS]: {
    title: "Reports & GST",
    description: "Tax audit reports, P&L, balance sheet, GSTR summaries, and ledger exports.",
    category: "Compliance",
  },
  [SidebarFeature.SETTINGS]: {
    title: "Settings & Profile",
    description: "Business profiles, invoice numbering, print layouts, and security rules.",
    category: "Administration",
  },
  [SidebarFeature.ANALYTICS]: {
    title: "Analytics & Trends",
    description: "Executive dashboards, sales charts, top customer reports, and growth insights.",
    category: "Insights",
  },
  [SidebarFeature.INVENTORY]: {
    title: "Warehouse & Godowns",
    description: "Multi-godown stock transfers, dispatch slips, and inventory reconciliation.",
    category: "Inventory",
  },
  [SidebarFeature.ATTENDANCE]: {
    title: "Attendance & Shifts",
    description: "Staff biometric check-in, daily attendance tracking, and overtime register.",
    category: "Staff",
  },
  [SidebarFeature.STAFF]: {
    title: "Employees & Payroll",
    description: "Employee directory, salary vouchers, advances, and payroll operations.",
    category: "Staff",
  },
};

export function CompanyFeatureToggle({ targetOrgId }: { targetOrgId?: string }) {
  const { organizationId: contextOrgId, userRole } = useActiveOrganization();
  const orgId = targetOrgId || contextOrgId;

  const [features, setFeatures] = useState<SidebarFeature[]>(Object.values(SidebarFeature));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isAdmin = userRole === "ADMIN" || !userRole;

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getCompanyFeatures(orgId)
      .then((data) => {
        setFeatures(data);
      })
      .catch((err) => {
        toast.error("Failed to load feature configuration");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orgId]);

  const toggleFeature = (key: SidebarFeature) => {
    if (!isAdmin) return;
    setFeatures((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    if (!isAdmin) return;
    setFeatures(Object.values(SidebarFeature));
  };

  const handleDeselectAll = () => {
    if (!isAdmin) return;
    // Always keep at least SETTINGS so admin doesn't lock themselves out
    setFeatures([SidebarFeature.SETTINGS]);
  };

  const handleSave = async () => {
    if (!orgId) {
      toast.error("No active organization found");
      return;
    }

    setSaving(true);
    try {
      await updateCompanyFeatures(orgId, features);
      toast.success("Sidebar feature configuration saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update company features");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-xs text-muted-foreground gap-2">
        <Loader2 className="size-4 animate-spin text-primary" />
        <span>Loading enterprise feature configuration...</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            <h3 className="font-bold text-foreground text-sm tracking-tight">
              Enterprise Feature Access Controls
            </h3>
            <Badge variant="outline" className="text-[10px] font-mono">
              Per-Company
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure which modules are visible in the navigation and accessible to members of this enterprise.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 text-xs"
            >
              <CheckCheck className="size-3.5 mr-1" />
              All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              className="h-8 text-xs"
            >
              <XCircle className="size-3.5 mr-1" />
              Minimal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="h-8 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="size-3.5 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-3.5 mr-1" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
          Viewing feature permissions in read-only mode. Only Enterprise Administrators can modify active modules.
        </div>
      )}

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.values(SidebarFeature).map((featureKey) => {
          const meta = FEATURE_METADATA[featureKey] || {
            title: featureKey,
            description: "Module functionality",
            category: "General",
          };
          const isEnabled = features.includes(featureKey);

          return (
            <div
              key={featureKey}
              onClick={() => toggleFeature(featureKey)}
              className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                isEnabled
                  ? "border-primary/40 bg-primary/5 shadow-2xs"
                  : "border-border/60 bg-muted/20 opacity-70 hover:opacity-90"
              }`}
            >
              <div className="space-y-1 pr-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-foreground truncate">
                    {meta.title}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[9px] font-mono uppercase px-1 py-0"
                  >
                    {meta.category}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {meta.description}
                </p>
              </div>

              <div className="pt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <Switch
                  id={`feature-${featureKey}`}
                  checked={isEnabled}
                  disabled={!isAdmin}
                  onCheckedChange={() => toggleFeature(featureKey)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {isAdmin && (
        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-4 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
          >
            {saving ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                Saving Configuration...
              </>
            ) : (
              <>
                <Save className="size-3.5 mr-1.5" />
                Apply Feature Settings
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default CompanyFeatureToggle;
