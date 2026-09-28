"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import {
  type CompanySummaryItem,
  getAvailableCompanies,
  switchActiveCompanyAction,
  createCompanyAction,
} from "@/actions/companies";
import { updateBrowserFavicon } from "@/lib/brand-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppName } from "@/hooks/use-app-name";

export function CompanySwitcher({
  currentCompanyName,
  className,
}: {
  currentCompanyName?: string;
  className?: string;
}) {
  const router = useRouter();
  const { appName } = useAppName();
  const [companies, setCompanies] = useState<CompanySummaryItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // New Company form
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newGstin, setNewGstin] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newState, setNewState] = useState("Karnataka");
  const [saving, setSaving] = useState(false);

  const loadCompanies = async () => {
    try {
      const list = await getAvailableCompanies();
      setCompanies(list);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleSwitch = (companyId: string, name: string) => {
    // 1. Instantly update local state so checkmark, name, and logo update immediately
    setCompanies((prev) =>
      prev.map((c) => ({
        ...c,
        isActive: c.id === companyId,
      }))
    );

    startTransition(async () => {
      try {
        const res = await switchActiveCompanyAction(companyId);
        if (res.logoUrl) {
          updateBrowserFavicon(res.logoUrl);
        } else {
          updateBrowserFavicon("/favicon.ico");
        }
        toast.success(`Switched active company to ${name}`);
        // 2. Immediately reload page so all dashboard KPIs, invoices, items, and ledgers fetch fresh
        window.location.reload();
      } catch (err: any) {
        toast.error(err.message || "Failed to switch company");
        loadCompanies();
      }
    });
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      toast.error("Company Name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await createCompanyAction({
        companyName: newCompanyName.trim(),
        taxId: newGstin.trim() || undefined,
        phone: newPhone.trim() || undefined,
        address: newAddress.trim() || undefined,
        state: newState,
        currency: "INR",
      });

      toast.success(`Registered company "${res.companyName}" successfully`);
      setAddDialogOpen(false);
      setNewCompanyName("");
      setNewGstin("");
      setNewPhone("");
      setNewAddress("");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to create company");
    } finally {
      setSaving(false);
    }
  };

  const activeCompany =
    companies.find((c) => c.isActive) ||
    (companies.length > 0 ? companies[0] : null);

  const displayName =
    activeCompany?.companyName ||
    currentCompanyName ||
    "Sri Manjunatha Engineering Works";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className={
                className ||
                "flex items-center gap-2 rounded-xl border border-border/80 bg-card px-2.5 py-1.5 text-xs text-foreground hover:bg-accent/60 transition-colors shadow-2xs max-w-[210px] sm:max-w-[240px] cursor-pointer shrink-0"
              }
            >
              {activeCompany?.logoUrl ? (
                <img
                  src={activeCompany.logoUrl}
                  alt=""
                  className="size-7 rounded-lg object-contain border border-border bg-background p-0.5 shrink-0"
                />
              ) : (
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Building2 className="size-4" />
                </div>
              )}
              <div className="min-w-0 text-left flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-bold text-foreground text-xs leading-tight">
                    {displayName}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                  <span className="text-primary font-semibold">{appName}</span>
                  <span>•</span>
                  <span>{activeCompany?.taxId ? "GSTIN Active" : "Regular"}</span>
                </div>
              </div>
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
              )}
            </button>
          }
        />

        <DropdownMenuContent align="start" className="w-72 p-1.5">
          <DropdownMenuLabel className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground">
            <span>Companies in {appName}</span>
            <Badge variant="secondary" className="text-[9px] font-mono px-1 py-0">
              {companies.length} Firms
            </Badge>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {companies.map((comp) => {
              const isSelected = comp.isActive;
              return (
                <DropdownMenuItem
                  key={comp.id}
                  onClick={() => handleSwitch(comp.id, comp.companyName)}
                  className="flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {comp.logoUrl ? (
                      <img
                        src={comp.logoUrl}
                        alt=""
                        className="size-6 shrink-0 rounded-md object-contain border border-border bg-background p-0.5"
                      />
                    ) : (
                      <div
                        className={`flex size-6 shrink-0 items-center justify-center rounded-md font-black text-[11px] ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        {comp.companyName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground text-xs">
                        {comp.companyName}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono truncate">
                        <span>{comp.taxId || comp.state || "India"}</span>
                        <span>•</span>
                        <span>{comp.itemsCount} items</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="size-4 text-emerald-600 shrink-0 ml-2" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setAddDialogOpen(true)}
            className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-bold text-primary hover:text-primary hover:bg-primary/10"
          >
            <Plus className="size-3.5" />
            <span>Add New Company / Firm</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add New Company Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              <span>Register New Company in {appName}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {appName} manages multiple business firms, GST books, inventory, and online stores under one account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCompany} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <DialogBody>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Company / Firm Legal Name *</Label>
                <Input
                  placeholder="e.g. Sri Manjunatha Agro Tech or Omkar Enterprises"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">GSTIN (Optional)</Label>
                  <Input
                    placeholder="29AAAAA0000A1Z5"
                    value={newGstin}
                    onChange={(e) => setNewGstin(e.target.value)}
                    className="h-9 text-xs font-mono uppercase"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Phone Number</Label>
                  <Input
                    placeholder="94480 12345"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Address</Label>
                  <Input
                    placeholder="Industrial Area, Peenya"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">State</Label>
                  <Input
                    placeholder="Karnataka"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {saving ? "Registering..." : "Create & Switch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
