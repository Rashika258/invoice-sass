"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Camera,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  Edit2,
  FileText,
  Fingerprint,
  Globe,
  HardDrive,
  Info,
  Landmark,
  Layers,
  MessageSquare,
  Monitor,
  Package,
  Palette,
  PlayCircle,
  Printer,
  Receipt,
  Save,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAppSettings, saveAppSettingsAction } from "@/actions/store-ops";
import { updateCompanyProfile } from "@/actions/settings";
import {
  BRAND_THEME_PRESETS,
  applyBrandTheme,
  getStoredBrandTheme,
  type BrandThemePreset,
} from "@/lib/brand-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { AppSettings } from "@/lib/settings-store";
import { PrintSettings } from "@/components/settings/sections/print-settings";
import { TransactionSettings } from "@/components/settings/sections/transaction-settings";
import { TaxesSettings } from "@/components/settings/sections/taxes-settings";
import { BrandThemeSettings } from "@/components/settings/sections/brand-theme-settings";
import { TeamManagement } from "@/components/settings/team-management";
import { TwoFactorSetupDialog } from "@/components/auth/two-factor-dialog";
import { PaymentSettingsView } from "@/components/settings/payment-settings-view";

const SETTINGS_SECTIONS = [
  { id: "GENERAL", label: "General Settings", icon: Sliders },
  { id: "PAYMENT GATEWAY", label: "Payment Gateway", icon: CreditCard },
  { id: "TEAM", label: "Team Members & Roles", icon: UserCheck },
  { id: "BRAND & THEME", label: "Brand & Theme Studio", icon: Palette },
  { id: "ATTENDANCE & BIOMETRIC", label: "Attendance & Biometrics", icon: Fingerprint },
  { id: "TRANSACTION", label: "Transaction Controls", icon: FileText },
  { id: "PRINT", label: "Print & Invoices", icon: Printer },
  { id: "TAXES & GST", label: "Taxes & GST", icon: Receipt },
  { id: "TRANSACTION MESSAGE", label: "Transaction Messages", icon: MessageSquare },
  { id: "PARTY", label: "Party & Customers", icon: Users },
  { id: "ITEM", label: "Items & Inventory", icon: Package },
  { id: "SERVICE REMINDERS", label: "Service Reminders", icon: Clock },
  { id: "ACCOUNTING", label: "Accounting & Ledgers", icon: Landmark },
  { id: "MULTI CURRENCY", label: "Multi Currency", icon: Globe },
];

const ZOOM_LEVELS = [70, 80, 90, 100, 110, 115, 120, 130];

/**
 * Apply screen zoom. Uses CSS zoom property but ONLY for non-100% values.
 * At 100% we always remove zoom to ensure Floating UI (Select/Popover positioning)
 * works correctly — CSS zoom breaks getBoundingClientRect() coordinates.
 */
function applyScreenZoom(zoomLevel: number) {
  if (typeof document === "undefined") return;
  if (zoomLevel === 100) {
    document.documentElement.style.removeProperty("zoom");
    return;
  }
  // Only apply CSS zoom for non-100% — user explicitly chose a different scale
  (document.documentElement.style as any).zoom = `${zoomLevel}%`;
}



export function BusinessSettingsView({
  profile,
  teamMembers = [],
  currentUserId = "",
  isAdmin = true,
  totpEnabled = false,
}: {
  profile: any;
  teamMembers?: any[];
  currentUserId?: string;
  isAdmin?: boolean;
  totpEnabled?: boolean;
}) {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState("GENERAL");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [zoom, setZoom] = useState(100);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const secParam = searchParams.get("section") || searchParams.get("tab");
    if (secParam) {
      const upper = secParam.toUpperCase();
      if (upper === "BRAND" || upper === "THEME" || upper === "BRAND & THEME") {
        setActiveSection("BRAND & THEME");
      } else {
        const found = SETTINGS_SECTIONS.find(
          (s) => s.id.includes(upper) || s.label.toUpperCase().includes(upper)
        );
        if (found) setActiveSection(found.id);
      }
    }
  }, [searchParams]);

  // Brand Theme states
  const [selectedThemeColor, setSelectedThemeColor] = useState("#10b981");
  const [selectedThemeName, setSelectedThemeName] = useState("Emerald Green");
  const [customHexInput, setCustomHexInput] = useState("#10b981");

  // Form states matching media_1788527610985.png
  const [passcode, setPasscode] = useState(false);
  const [currency, setCurrency] = useState("INR");
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [gstinEnabled, setGstinEnabled] = useState(true);
  const [negativeStock, setNegativeStock] = useState(false);
  const [blockItems, setBlockItems] = useState(false);
  const [blockParties, setBlockParties] = useState(false);

  // More transactions
  const [enableEstimate, setEnableEstimate] = useState(true);
  const [enableProforma, setEnableProforma] = useState(true);
  const [enableOrder, setEnableOrder] = useState(true);
  const [enableOtherIncome, setEnableOtherIncome] = useState(false);
  const [enableFixedAssets, setEnableFixedAssets] = useState(false);
  const [enableChallan, setEnableChallan] = useState(true);
  const [enableReturnChallan, setEnableReturnChallan] = useState(true);

  // Multi firm & Godowns
  const [multiFirm, setMultiFirm] = useState(false);
  const [godowns, setGodowns] = useState(false);

  // Online store mode
  const [storeMode, setStoreMode] = useState<"SEPARATE" | "SHARED">("SEPARATE");

  // Backup & Audit
  const [autoBackup, setAutoBackup] = useState(false);
  const [auditTrail, setAuditTrail] = useState(true);

  // Attendance & Biometrics Configuration (Configurable Face, Fingerprint, or Manual)
  const [attendanceMode, setAttendanceMode] = useState<"HYBRID" | "FACE_SCAN" | "FINGERPRINT" | "MANUAL">("HYBRID");
  const [fingerprintProvider, setFingerprintProvider] = useState<"MANTRA_RD_SERVICE" | "WEBAUTHN">("MANTRA_RD_SERVICE");
  const [enableFaceCaptureSnapshot, setEnableFaceCaptureSnapshot] = useState(true);
  const [standardShiftHours, setStandardShiftHours] = useState(8);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(1.5);

  // Multi Currency editing state
  const [editingCurrency, setEditingCurrency] = useState<{
    code: string;
    name: string;
    symbol: string;
    rate: number;
    enabled: boolean;
  } | null>(null);
  const [addCurrencyModalOpen, setAddCurrencyModalOpen] = useState(false);
  const [newCurrCode, setNewCurrCode] = useState("");
  const [newCurrName, setNewCurrName] = useState("");
  const [newCurrSymbol, setNewCurrSymbol] = useState("");
  const [newCurrRate, setNewCurrRate] = useState(1);

  useEffect(() => {
    const stored = getStoredBrandTheme();
    setSelectedThemeColor(stored.primary);
    setSelectedThemeName(stored.name);
    setCustomHexInput(stored.primary);
  }, []);

  useEffect(() => {
    fetchAppSettings().then((data) => {
      setSettings(data);
      setPasscode(data.enablePasscode);
      setCurrency(data.businessCurrency);
      setDecimalPlaces(data.decimalPlaces);
      setGstinEnabled(data.gstinEnabled);
      setNegativeStock(data.stopSaleOnNegativeStock);
      setBlockItems(data.blockNewItemsFromTxn);
      setBlockParties(data.blockNewPartiesFromTxn);
      setEnableEstimate(data.enableEstimate);
      setEnableProforma(data.enableProforma);
      setEnableOrder(data.enableOrder);
      setEnableChallan(data.enableDeliveryChallan);
      setEnableReturnChallan(data.enableGoodsReturnOnChallan);
      setMultiFirm(data.multiFirmEnabled);
      setGodowns(data.enableGodownManagement);
      setStoreMode(data.storeInventoryMode || "SEPARATE");
      setAutoBackup(data.autoBackup);
      setAuditTrail(data.auditTrail);
      setZoom(data.screenZoom || 100);

      // Attendance Settings
      setAttendanceMode(data.attendanceMode || "HYBRID");
      setFingerprintProvider(data.fingerprintProvider || "MANTRA_RD_SERVICE");
      setEnableFaceCaptureSnapshot(data.enableFaceCaptureSnapshot ?? true);
      setStandardShiftHours(data.standardShiftHours || 8);
      setOvertimeMultiplier(data.overtimeMultiplier || 1.5);

      if (data.screenZoom && data.screenZoom !== 100 && typeof document !== "undefined") {
        applyScreenZoom(data.screenZoom);
      } else if (typeof document !== "undefined") {
        // Remove any previously applied zoom
        document.documentElement.style.removeProperty("zoom");
        document.documentElement.style.removeProperty("transform");
      }
    });
  }, []);

  const handleApplyZoom = async () => {
    if (typeof document !== "undefined") {
      if (zoom === 100) {
        document.documentElement.style.removeProperty("zoom");
        document.documentElement.style.removeProperty("transform");
      } else {
        applyScreenZoom(zoom);
      }
    }
    await saveAppSettingsAction({ screenZoom: zoom });
    toast.success(`Screen scale applied: ${zoom}%`);
  };

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      await saveAppSettingsAction({
        enablePasscode: passcode,
        businessCurrency: currency,
        decimalPlaces,
        gstinEnabled,
        stopSaleOnNegativeStock: negativeStock,
        blockNewItemsFromTxn: blockItems,
        blockNewPartiesFromTxn: blockParties,
        enableEstimate,
        enableProforma,
        enableOrder,
        enableDeliveryChallan: enableChallan,
        enableGoodsReturnOnChallan: enableReturnChallan,
        multiFirmEnabled: multiFirm,
        enableGodownManagement: godowns,
        storeInventoryMode: storeMode,
        autoBackup,
        auditTrail,
        screenZoom: zoom,
        attendanceMode,
        fingerprintProvider,
        enableFaceCaptureSnapshot,
        standardShiftHours,
        overtimeMultiplier,
      });
      toast.success("Settings updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Universal settings updater used by section sub-components
  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
    try {
      await saveAppSettingsAction({ [key]: value });
    } catch {
      // silent – user can still click Save Settings at top
    }
  };

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] min-h-[500px] rounded-2xl border border-border bg-card overflow-hidden shadow-sm select-none">
      {/* Left Sidebar Menu */}
      <div className="w-56 shrink-0 bg-muted/40 text-foreground flex flex-col border-r border-border">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-bold tracking-tight text-foreground">Settings</span>
          <Search className="size-4 text-muted-foreground cursor-pointer" />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {SETTINGS_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                suppressHydrationWarning
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-all rounded-xl flex items-center gap-2.5 cursor-pointer ${
                  isActive
                    ? "bg-brand-light text-brand font-bold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                }`}
              >
                <Icon className={`size-4 shrink-0 ${isActive ? "text-brand" : "text-muted-foreground"}`} />
                <span className="truncate">{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        {/* Top bar with Close (X) icon */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              {SETTINGS_SECTIONS.find((s) => s.id === activeSection)?.label || "Settings"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleSaveGeneral}
              disabled={saving}
              className="h-8 rounded-xl bg-brand hover:opacity-90 text-white font-bold text-xs shadow-xs"
            >
              <Save className="mr-1.5 size-3.5" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
            <Link
              href="/dashboard"
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="size-5" />
            </Link>
          </div>
        </div>

        {/* SECTION: GENERAL */}
        {activeSection === "GENERAL" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            {/* COLUMN 1: APPLICATION & TRANSACTION TYPES */}
            <div className="space-y-6">
              {/* Application Settings Card */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <Sliders className="size-4 text-brand" />
                    <span>Application Settings</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">General operational parameters and formatting.</p>
                </div>

                <div className="space-y-3.5 divide-y divide-border/40 text-xs">
                  <div className="flex items-center justify-between pt-1">
                    <div className="space-y-0.5 pr-2">
                      <Label htmlFor="passcode" className="font-medium text-foreground cursor-pointer block">Enable Passcode Security</Label>
                      <p className="text-[10px] text-muted-foreground">Require master PIN to access ledger reports.</p>
                    </div>
                    <Switch
                      id="passcode"
                      checked={passcode}
                      onCheckedChange={(val) => setPasscode(val)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div className="space-y-0.5">
                      <span className="font-medium text-foreground block">Business Currency</span>
                      <p className="text-[10px] text-muted-foreground">Default currency symbol on invoices.</p>
                    </div>
                    <Select value={currency} onValueChange={(val) => val && setCurrency(val)}>
                      <SelectTrigger className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-semibold text-foreground">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR" className="text-xs">₹ (INR)</SelectItem>
                        <SelectItem value="USD" className="text-xs">$ (USD)</SelectItem>
                        <SelectItem value="EUR" className="text-xs">€ (EUR)</SelectItem>
                        <SelectItem value="AED" className="text-xs">AED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div className="space-y-0.5">
                      <span className="font-medium text-foreground block">Amount Decimal Places</span>
                      <p className="text-[10px] text-muted-foreground">Precision for currency fields (e.g. 0.00)</p>
                    </div>
                    <input
                      type="number"
                      suppressHydrationWarning
                      min="0"
                      max="4"
                      value={decimalPlaces}
                      onChange={(e) => setDecimalPlaces(Number(e.target.value))}
                      className="h-8 w-14 rounded-lg border border-input bg-background px-2 font-mono text-center font-bold text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div className="space-y-0.5 pr-2">
                      <Label htmlFor="gstin" className="font-medium text-foreground cursor-pointer block">GSTIN Number Tracking</Label>
                      <p className="text-[10px] text-muted-foreground">Enables GST columns & tax split calculations.</p>
                    </div>
                    <Switch
                      id="gstin"
                      checked={gstinEnabled}
                      onCheckedChange={(val) => setGstinEnabled(val)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div className="space-y-0.5 pr-2">
                      <Label htmlFor="stopNeg" className="font-medium text-foreground cursor-pointer block">Stop Sale on Negative Stock</Label>
                      <p className="text-[10px] text-muted-foreground">Block invoice if item count &lt; 0.</p>
                    </div>
                    <Switch
                      id="stopNeg"
                      checked={negativeStock}
                      onCheckedChange={(val) => setNegativeStock(val)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div className="space-y-0.5 pr-2">
                      <Label htmlFor="blkItems" className="font-medium text-foreground cursor-pointer block">Block New Items in Billing</Label>
                      <p className="text-[10px] text-muted-foreground">Require items to exist in Catalogue first.</p>
                    </div>
                    <Switch
                      id="blkItems"
                      checked={blockItems}
                      onCheckedChange={(val) => setBlockItems(val)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div className="space-y-0.5 pr-2">
                      <Label htmlFor="blkParties" className="font-medium text-foreground cursor-pointer block">Block New Parties in Billing</Label>
                      <p className="text-[10px] text-muted-foreground">Require parties to be registered first.</p>
                    </div>
                    <Switch
                      id="blkParties"
                      checked={blockParties}
                      onCheckedChange={(val) => setBlockParties(val)}
                    />
                  </div>
                </div>
              </div>

              {/* Document Types Card */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <FileText className="size-4 text-brand" />
                    <span>Transaction Document Types</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Enable active transaction vouchers in navigation.</p>
                </div>

                <div className="space-y-3 divide-y divide-border/40 text-xs">
                  <div className="flex items-center justify-between pt-1">
                    <Label htmlFor="est" className="font-medium text-foreground cursor-pointer">Estimate / Quotation</Label>
                    <Switch id="est" checked={enableEstimate} onCheckedChange={setEnableEstimate} />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <Label htmlFor="prof" className="font-medium text-foreground cursor-pointer">Proforma Invoice</Label>
                    <Switch id="prof" checked={enableProforma} onCheckedChange={setEnableProforma} />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <Label htmlFor="ord" className="font-medium text-foreground cursor-pointer">Sale / Purchase Order</Label>
                    <Switch id="ord" checked={enableOrder} onCheckedChange={setEnableOrder} />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <Label htmlFor="othInc" className="font-medium text-foreground cursor-pointer">Other Income Vouchers</Label>
                    <Switch id="othInc" checked={enableOtherIncome} onCheckedChange={setEnableOtherIncome} />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <Label htmlFor="fa" className="font-medium text-foreground cursor-pointer">Fixed Assets (FA)</Label>
                    <Switch id="fa" checked={enableFixedAssets} onCheckedChange={setEnableFixedAssets} />
                  </div>

                  <div className="space-y-2 pt-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dc" className="font-medium text-foreground cursor-pointer">Delivery Challan</Label>
                      <Switch id="dc" checked={enableChallan} onCheckedChange={setEnableChallan} />
                    </div>

                    {enableChallan && (
                      <div className="flex items-center justify-between pl-4 pt-1 text-[11px]">
                        <Label htmlFor="dcRet" className="text-muted-foreground cursor-pointer">Goods return on Delivery Challan</Label>
                        <Switch id="dcRet" checked={enableReturnChallan} onCheckedChange={setEnableReturnChallan} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: MULTI FIRM, GODOWNS & ONLINE STORE INVENTORY MODE */}
            <div className="space-y-6">
              {/* Multi Firm Card */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <Building2 className="size-4 text-brand" />
                      <span>Multi Firm Management</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Manage multiple GST companies in one workspace.</p>
                  </div>
                  <Switch id="mf" checked={multiFirm} onCheckedChange={setMultiFirm} />
                </div>

                <div className="rounded-xl border border-brand/30 bg-brand-light/40 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-3 rounded-full bg-brand" />
                    <span className="font-bold text-foreground text-xs">
                      {profile?.companyName || "Sri Manjunatha Engineering Works"}
                    </span>
                    <Badge className="bg-brand text-white border-none text-[9px] px-1.5 py-0.5">
                      DEFAULT
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info("Editing Default Business Profile")}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                    title="Edit Business Profile"
                  >
                    <Edit2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Godowns Card */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 pr-2">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <Layers className="size-4 text-brand" />
                      <span>Godown &amp; Stock Transfer</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Transfer inventory between stores/warehouses seamlessly.
                    </p>
                  </div>
                  <Switch id="godown" checked={godowns} onCheckedChange={setGodowns} />
                </div>
              </div>

              {/* Configurable Online Store Mode Card */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-2xs">
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <Layers className="size-4 text-brand" />
                    <span>Online Store Inventory &amp; Billing</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Configure whether the digital store has dedicated stock or syncs with main B2B warehouse inventory.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div
                    onClick={() => setStoreMode("SEPARATE")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      storeMode === "SEPARATE"
                        ? "border-brand bg-brand-light shadow-2xs font-semibold text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Separate Mode (Independent Stock &amp; DB)</span>
                      <div className={`size-3.5 rounded-full border-2 ${storeMode === "SEPARATE" ? "border-brand bg-brand" : "border-muted"}`} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                      Online sales generate separate Store GST Bills and deduct only from online stock.
                    </p>
                  </div>

                  <div
                    onClick={() => setStoreMode("SHARED")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      storeMode === "SHARED"
                        ? "border-brand bg-brand-light shadow-2xs font-semibold text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Shared Mode (Unified Warehouse Stock)</span>
                      <div className={`size-3.5 rounded-full border-2 ${storeMode === "SHARED" ? "border-brand bg-brand" : "border-muted"}`} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                      Online sales draw directly from physical stock and appear in the main sale invoices list.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: BACKUP & SCREEN ZOOM / SCALE */}
            <div className="space-y-6">
              {/* Backup & History Card */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <HardDrive className="size-4 text-brand" />
                    <span>Backup &amp; Audit History</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Automated database snapshots and change logs.</p>
                </div>

                <div className="space-y-3.5 divide-y divide-border/40 text-xs">
                  <div className="flex items-center justify-between pt-1">
                    <div className="space-y-0.5 pr-2">
                      <Label htmlFor="autoBk" className="font-medium text-foreground cursor-pointer block">Auto Cloud Backup</Label>
                      <p className="text-[10px] text-muted-foreground">Daily encrypted backup to cloud storage.</p>
                    </div>
                    <Switch id="autoBk" checked={autoBackup} onCheckedChange={setAutoBackup} />
                  </div>

                  <div className="pt-3">
                    <div className="text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/60">
                      <span className="font-medium text-foreground">Last Backup:</span> 04/09/2026 | 07:09 AM
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div className="space-y-0.5 pr-2">
                      <Label htmlFor="audit" className="font-medium text-foreground cursor-pointer block">Audit Trail Logging</Label>
                      <p className="text-[10px] text-muted-foreground">Track user edit and deletion actions.</p>
                    </div>
                    <Switch id="audit" checked={auditTrail} onCheckedChange={setAuditTrail} />
                  </div>
                </div>
              </div>

              {/* Screen Zoom & Scale Card */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <Monitor className="size-4 text-brand" />
                    <span>Customize Display Scale</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Adjust the overall UI zoom level to fit your display size.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="space-y-2">
                    <input
                      type="range"
                      suppressHydrationWarning
                      min="70"
                      max="130"
                      step="5"
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full accent-brand cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                      {ZOOM_LEVELS.map((lvl) => (
                        <span
                          key={lvl}
                          onClick={() => setZoom(lvl)}
                          className={`cursor-pointer hover:text-foreground ${zoom === lvl ? "font-bold text-brand" : ""}`}
                        >
                          {lvl}%
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-mono font-bold text-foreground">
                      Selected Scale: {zoom}%
                    </span>
                    <Button
                      size="sm"
                      onClick={handleApplyZoom}
                      className="h-8 text-xs font-bold rounded-xl bg-brand text-white hover:opacity-90 px-4"
                    >
                      Apply Scale
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: TEAM MEMBERS & ROLES */}
        {activeSection === "TEAM" && (
          <div className="max-w-4xl space-y-6 text-xs">
            <TeamManagement
              members={teamMembers}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />

            {/* 2FA Security for current admin account */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
              <div className="space-y-0.5">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-brand" />
                  <span>Account Security</span>
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Protect your admin account with Two-Factor Authentication (2FA).
                </p>
              </div>
              <TwoFactorSetupDialog enabled={totpEnabled} />
            </div>
          </div>
        )}

        {/* SECTION: PAYMENT GATEWAY & MERCHANT CONFIGURATION */}
        {activeSection === "PAYMENT GATEWAY" && (
          <PaymentSettingsView />
        )}

        {/* SECTION: ATTENDANCE & BIOMETRIC CONFIGURATION */}
        {activeSection === "ATTENDANCE & BIOMETRIC" && (
          <div className="max-w-4xl space-y-6 text-xs">
            {/* Header & Quick Terminal Launcher */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Fingerprint className="size-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">Attendance &amp; Biometric Settings</h3>
                  <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold text-[10px]">
                    Active: {attendanceMode}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure verification methods for Sri Manjunatha Engineering Works staff attendance.
                </p>
              </div>

              <Link
                href="/attendance/kiosk"
                target="_blank"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-xs transition-all active:scale-[0.98]"
              >
                <Monitor className="size-3.5" />
                <span>Open Attendance Kiosk</span>
              </Link>
            </div>

            {/* Attendance Mode Selector */}
            <div className="rounded-2xl border border-border p-4 bg-card space-y-3">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>Verification Mode</span>
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Choose how workers authenticate when clocking in and out on the shop floor.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* 1. HYBRID */}
                <div
                  onClick={() => setAttendanceMode("HYBRID")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    attendanceMode === "HYBRID"
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-amber-500" />
                      <span className="font-bold text-foreground text-xs">Hybrid / All Enabled</span>
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none text-[9px]">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                    Allows Face Scan, USB Fingerprint, or Manual supervisor entry. Employees choose whichever is fastest.
                  </p>
                </div>

                {/* 2. FINGERPRINT ONLY */}
                <div
                  onClick={() => setAttendanceMode("FINGERPRINT")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    attendanceMode === "FINGERPRINT"
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="size-4 text-emerald-500" />
                      <span className="font-bold text-foreground text-xs">Fingerprint Biometric Only</span>
                    </div>
                    <div className={`size-3 rounded-full border-2 ${attendanceMode === "FINGERPRINT" ? "border-primary bg-primary" : "border-muted"}`} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                    Requires physical biometric scan via Mantra MFS100 / Morpho USB scanner or Windows Hello before saving.
                  </p>
                </div>

                {/* 3. FACE SCAN ONLY */}
                <div
                  onClick={() => setAttendanceMode("FACE_SCAN")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    attendanceMode === "FACE_SCAN"
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="size-4 text-blue-500" />
                      <span className="font-bold text-foreground text-xs">Face Scanning Only</span>
                    </div>
                    <div className={`size-3 rounded-full border-2 ${attendanceMode === "FACE_SCAN" ? "border-primary bg-primary" : "border-muted"}`} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                    Uses workshop tablet or laptop camera. Requires live facial alignment and stores verification snapshot.
                  </p>
                </div>

                {/* 4. MANUAL ONLY */}
                <div
                  onClick={() => setAttendanceMode("MANUAL")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    attendanceMode === "MANUAL"
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-slate-400" />
                      <span className="font-bold text-foreground text-xs">Manual Entry Only</span>
                    </div>
                    <div className={`size-3 rounded-full border-2 ${attendanceMode === "MANUAL" ? "border-primary bg-primary" : "border-muted"}`} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                    Supervisor or admin logs daily shift hours without requiring biometric devices.
                  </p>
                </div>
              </div>
            </div>

            {/* Hardware & Driver Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border p-4 bg-card space-y-3">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Fingerprint className="size-4 text-primary" />
                  <span>Fingerprint Scanner Device</span>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Select which biometric hardware driver protocol is active on your shop computer.
                </p>

                <div className="space-y-2 pt-1">
                  <div
                    onClick={() => setFingerprintProvider("MANTRA_RD_SERVICE")}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      fingerprintProvider === "MANTRA_RD_SERVICE"
                        ? "border-primary bg-primary/5 font-semibold text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Mantra MFS100 / Morpho RD Service</span>
                      <div className={`size-3 rounded-full border-2 ${fingerprintProvider === "MANTRA_RD_SERVICE" ? "border-primary bg-primary" : "border-muted"}`} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Standard Indian MSME USB optical scanner running on localhost:11100.
                    </p>
                  </div>

                  <div
                    onClick={() => setFingerprintProvider("WEBAUTHN")}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      fingerprintProvider === "WEBAUTHN"
                        ? "border-primary bg-primary/5 font-semibold text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Browser WebAuthn (Windows Hello / Touch ID)</span>
                      <div className={`size-3 rounded-full border-2 ${fingerprintProvider === "WEBAUTHN" ? "border-primary bg-primary" : "border-muted"}`} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Uses laptop built-in fingerprint reader or mobile biometric sensor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Anti-Buddy Punching & Shift Rules */}
              <div className="rounded-2xl border border-border p-4 bg-card space-y-3">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="size-4 text-primary" />
                  <span>Shift Rules &amp; Photo Audit</span>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Control tamper-proofing and standard overtime calculations.
                </p>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="faceSnap"
                      checked={enableFaceCaptureSnapshot}
                      onChange={(e) => setEnableFaceCaptureSnapshot(e.target.checked)}
                      className="size-4 rounded accent-brand cursor-pointer"
                    />
                    <Label htmlFor="faceSnap" className="cursor-pointer font-medium text-xs">
                      Save Camera Snapshot on Every Punch (Audit Trail)
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Standard Shift (Hours)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="16"
                        value={standardShiftHours}
                        onChange={(e) => setStandardShiftHours(Number(e.target.value) || 8)}
                        className="h-8 text-xs font-mono font-bold mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Overtime Multiplier</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="1"
                        max="3"
                        value={overtimeMultiplier}
                        onChange={(e) => setOvertimeMultiplier(Number(e.target.value) || 1.5)}
                        className="h-8 text-xs font-mono font-bold mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: BRAND & THEME STUDIO */}
        {activeSection === "BRAND & THEME" && (
          <BrandThemeSettings profile={profile} />
        )}

        {/* SECTION: PRINT */}
        {activeSection === "PRINT" && settings && (
          <PrintSettings
            settings={settings}
            updateSetting={updateSetting}
            profile={profile}
          />
        )}

        {/* SECTION: TRANSACTION */}
        {activeSection === "TRANSACTION" && settings && (
          <TransactionSettings settings={settings} updateSetting={updateSetting} />
        )}

        {/* SECTION: TAXES & GST */}
        {activeSection === "TAXES & GST" && settings && (
          <TaxesSettings settings={settings} updateSetting={updateSetting} profile={profile} />
        )}

        {/* SECTION: TRANSACTION MESSAGE */}
        {activeSection === "TRANSACTION MESSAGE" && settings && (
          <div className="max-w-3xl space-y-6 text-xs">
            <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-brand-light text-brand">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">WhatsApp &amp; SMS Message Templates</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Customise automatic messages sent to customers after invoice creation, payment receipts, and reminders.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <div className="text-xs font-bold text-foreground">Auto-Send WhatsApp Invoice</div>
                  <p className="text-[11px] text-muted-foreground">Automatically share every new invoice PDF on WhatsApp Business immediately after saving.</p>
                </div>
                <Switch
                  checked={settings.autoSendWhatsAppInvoice}
                  onCheckedChange={(v) => updateSetting("autoSendWhatsAppInvoice", v)}
                />
              </div>
              <div className="space-y-2 pt-2 border-t border-border/50">
                <Label className="text-xs font-semibold text-foreground">Message Template</Label>
                <p className="text-[10px] text-muted-foreground">
                  Tags: <code className="bg-muted px-1 rounded">{"{CustomerName}"}</code> <code className="bg-muted px-1 rounded">{"{InvoiceNo}"}</code> <code className="bg-muted px-1 rounded">{"{Amount}"}</code> <code className="bg-muted px-1 rounded">{"{DueDate}"}</code>
                </p>
                <textarea
                  rows={5}
                  value={settings.whatsAppReminderTemplate}
                  onChange={(e) => updateSetting("whatsAppReminderTemplate", e.target.value)}
                  placeholder="Hi {CustomerName}, your invoice {InvoiceNo} for ₹{Amount} is ready. Due: {DueDate}. Pay via UPI: upi@bank. Thank you — Sri Manjunatha Engineering Works"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            {/* WhatsApp Preview */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Live WhatsApp Preview</Label>
              <div className="rounded-2xl bg-[#0b1014] p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <div className="size-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">V</div>
                  <div>
                    <div className="font-bold text-white text-[11px]">Sri Manjunatha Engineering Works</div>
                    <div className="text-[10px] text-zinc-400">Business Account</div>
                  </div>
                </div>
                <div className="bg-[#1e2c35] rounded-xl rounded-tl-sm p-3 max-w-xs text-[11px] text-white leading-relaxed">
                  {(settings.whatsAppReminderTemplate || "Hi {CustomerName}, your invoice {InvoiceNo} for ₹{Amount} is ready.")
                    .replace("{CustomerName}", "Venkatesh Kumar")
                    .replace("{InvoiceNo}", "INV-2026-0048")
                    .replace("{Amount}", "12,012")
                    .replace("{DueDate}", "10 Sep 2026")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: PARTY */}
        {activeSection === "PARTY" && settings && (
          <div className="max-w-3xl space-y-6 text-xs">
            <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-brand-light text-brand">
                <UserCheck className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Party &amp; Customer Rules</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Set credit limits, loyalty points, and billing block rules for outstanding parties.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 divide-y divide-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <div className="font-bold text-foreground">Enable Credit Limit Per Party</div>
                  <p className="text-[11px] text-muted-foreground">Allows setting a maximum outstanding credit ceiling per customer account.</p>
                </div>
                <Switch checked={settings.enableCreditLimit} onCheckedChange={(v) => updateSetting("enableCreditLimit", v)} />
              </div>

              {settings.enableCreditLimit && (
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5 pr-4">
                    <div className="font-bold text-foreground">Block Billing on Credit Exceeded</div>
                    <p className="text-[11px] text-muted-foreground">Prevents creating new invoices if a party's outstanding balance exceeds their configured credit limit.</p>
                  </div>
                  <Switch checked={settings.blockBillingOnCreditExceeded} onCheckedChange={(v) => updateSetting("blockBillingOnCreditExceeded", v)} />
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5 pr-4">
                  <div className="font-bold text-foreground">Enable Loyalty Points Program</div>
                  <p className="text-[11px] text-muted-foreground">Reward customers with points on every purchase. Redeemable as discounts on future invoices.</p>
                </div>
                <Switch checked={settings.enableLoyaltyPoints} onCheckedChange={(v) => updateSetting("enableLoyaltyPoints", v)} />
              </div>
            </div>
          </div>
        )}

        {/* SECTION: ITEM */}
        {activeSection === "ITEM" && settings && (
          <div className="max-w-3xl space-y-6 text-xs">
            <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-brand-light text-brand">
                <Layers className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Items &amp; Inventory Controls</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Configure barcode scanning, batch/serial tracking, expiry date alerts, and low stock buffer thresholds.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 divide-y divide-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <div className="font-bold text-foreground">Barcode Scanner Auto-Add Items</div>
                  <p className="text-[11px] text-muted-foreground">When a barcode is scanned in billing, automatically add the matching item to the invoice line.</p>
                </div>
                <Switch checked={settings.enableBarcodeScanner} onCheckedChange={(v) => updateSetting("enableBarcodeScanner", v)} />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5 pr-4">
                  <div className="font-bold text-foreground">Batch Tracking &amp; Expiry Dates</div>
                  <p className="text-[11px] text-muted-foreground">Track stock by batch number with manufacturing and expiry dates — mandatory for pharma and FMCG.</p>
                </div>
                <Switch checked={settings.enableBatchTracking} onCheckedChange={(v) => updateSetting("enableBatchTracking", v)} />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5 pr-4">
                  <div className="font-bold text-foreground">Serial Number / IMEI Tracking</div>
                  <p className="text-[11px] text-muted-foreground">Assign unique serial numbers to each unit — essential for electronics, machinery, and warranty management.</p>
                </div>
                <Switch checked={settings.enableSerialNumberTracking} onCheckedChange={(v) => updateSetting("enableSerialNumberTracking", v)} />
              </div>

              <div className="pt-4 space-y-2">
                <Label className="text-xs font-semibold text-foreground">Low Stock Alert Buffer Quantity</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    value={settings.lowStockBufferQty}
                    onChange={(e) => updateSetting("lowStockBufferQty", Number(e.target.value))}
                    className="h-8 text-xs font-mono font-bold max-w-[120px]"
                  />
                  <p className="text-[11px] text-muted-foreground">Alert when stock drops below this quantity. Set to 0 to use each item's individual minimum stock.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: SERVICE REMINDERS */}
        {activeSection === "SERVICE REMINDERS" && settings && (
          <div className="max-w-3xl space-y-6 text-xs">
            <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-brand-light text-brand">
                <Clock className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">AMC &amp; Maintenance Service Reminders</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Configure automatic service cycle alerts for machinery, equipment, or Annual Maintenance Contracts (AMC).</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
                  <div className="font-bold text-foreground">How Service Reminders Work</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li className="flex items-start gap-1.5"><span className="text-brand mt-0.5">•</span> Assign an AMC/service cycle to any customer or machine in Parties</li>
                    <li className="flex items-start gap-1.5"><span className="text-brand mt-0.5">•</span> Billora auto-triggers an alert N days before the next service date</li>
                    <li className="flex items-start gap-1.5"><span className="text-brand mt-0.5">•</span> Reminders appear in the Bell Notification icon and Alerts module</li>
                    <li className="flex items-start gap-1.5"><span className="text-brand mt-0.5">•</span> WhatsApp message is auto-sent to the customer if enabled</li>
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Advance Notification Period (Days Before Due)</Label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[3, 7, 14, 30, 60].map((days) => (
                      <button
                        key={days}
                        type="button"
                        className="px-3.5 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs font-bold hover:bg-brand-light hover:text-brand hover:border-brand/50 transition-all cursor-pointer active:scale-95 shadow-2xs"
                        onClick={() => toast.success(`Service reminder advance set to ${days} days`)}
                      >
                        {days} days
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: ACCOUNTING */}
        {activeSection === "ACCOUNTING" && settings && (
          <div className="max-w-3xl space-y-6 text-xs">
            <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-brand-light text-brand">
                <HardDrive className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Accounting &amp; Financial Year</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Configure the active financial year, double-entry auto-journal rules, and accounting basis method.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Active Financial Year</Label>
                <Select
                  value={settings.currentFinancialYear}
                  onValueChange={(val) => val && updateSetting("currentFinancialYear", val)}
                >
                  <SelectTrigger className="h-8 w-full max-w-[220px] rounded-lg border border-border bg-background px-3 text-xs font-mono font-bold text-foreground">
                    <SelectValue placeholder="Financial Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {["2023-2024", "2024-2025", "2025-2026", "2026-2027"].map((fy) => (
                      <SelectItem key={fy} value={fy} className="text-xs font-mono font-bold">
                        {fy} (Apr–Mar)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">All reports, GSTR, and trial balance will be filtered within this FY period.</p>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <div className="font-bold text-foreground">Auto Journal Entries (Double Entry)</div>
                  <p className="text-[11px] text-muted-foreground">Automatically post debit/credit journal entries for every sales invoice, payment, and expense.</p>
                </div>
                <Switch checked={settings.autoJournalEntries} onCheckedChange={(v) => updateSetting("autoJournalEntries", v)} />
              </div>
            </div>
          </div>
        )}

        {/* SECTION: MULTI CURRENCY */}
        {activeSection === "MULTI CURRENCY" && settings && (
          <div className="max-w-3xl space-y-6 text-xs">
            <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-brand-light text-brand">
                <Globe className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Multi-Currency &amp; International Billing</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Set your base currency, configure export currencies, and manage exchange rates for foreign invoices.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Base / Primary Currency</Label>
                <div className="flex items-center gap-3">
                  <div className="h-8 px-4 rounded-lg border border-brand bg-brand-light flex items-center text-xs font-black text-brand">
                    ₹ INR — Indian Rupee
                  </div>
                  <Badge variant="outline" className="text-[10px] text-brand border-brand/30 bg-brand-light">Default</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">Base currency cannot be changed after transactions are posted.</p>
              </div>

              <div className="pt-2 border-t border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">Export / Secondary Currencies</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddCurrencyModalOpen(true)}
                    className="h-7 text-[11px] font-semibold text-brand border-brand/30 hover:bg-brand-light cursor-pointer"
                  >
                    + Add Custom Currency
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { code: "USD", name: "US Dollar", symbol: "$", defaultRate: 83.92 },
                    { code: "EUR", name: "Euro", symbol: "€", defaultRate: 91.20 },
                    { code: "AED", name: "UAE Dirham", symbol: "د.إ", defaultRate: 22.85 },
                    { code: "GBP", name: "British Pound", symbol: "£", defaultRate: 106.40 },
                    { code: "SGD", name: "Singapore Dollar", symbol: "S$", defaultRate: 62.80 },
                    { code: "SAR", name: "Saudi Riyal", symbol: "﷼", defaultRate: 22.38 },
                    { code: "AUD", name: "Australian Dollar", symbol: "A$", defaultRate: 55.40 },
                    { code: "CAD", name: "Canadian Dollar", symbol: "C$", defaultRate: 61.90 },
                  ].map((cur) => {
                    const currentRates = settings.exchangeRates || {};
                    const rate = currentRates[cur.code] ?? cur.defaultRate;
                    const enabledList = settings.enabledExportCurrencies || ["USD", "EUR", "AED", "GBP", "SGD", "SAR"];
                    const isEnabled = enabledList.includes(cur.code);

                    return (
                      <div
                        key={cur.code}
                        onClick={() =>
                          setEditingCurrency({
                            code: cur.code,
                            name: cur.name,
                            symbol: cur.symbol,
                            rate,
                            enabled: isEnabled,
                          })
                        }
                        className={`p-3 rounded-xl border transition-all cursor-pointer select-none group ${
                          isEnabled
                            ? "border-brand/40 bg-card hover:border-brand hover:shadow-2xs"
                            : "border-border/60 bg-muted/20 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs flex items-center gap-1">
                            <span>{cur.symbol}</span>
                            <span>{cur.code}</span>
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-mono group-hover:bg-brand-light group-hover:text-brand transition-colors"
                          >
                            1 {cur.code} = ₹{rate}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-[10px] text-muted-foreground">{cur.name}</p>
                          {isEnabled && (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">● Active</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground pt-1">
                  Exchange rates are updated manually. Click any currency card or rate to edit exchange rate.
                </p>
              </div>
            </div>

            {/* Dialog: Edit Exchange Rate Modal */}
            <Dialog open={!!editingCurrency} onOpenChange={(open) => !open && setEditingCurrency(null)}>
              <DialogContent className="sm:max-w-md rounded-2xl p-6 select-none">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold flex items-center gap-2">
                    <Globe className="size-4 text-brand" />
                    <span>Edit {editingCurrency?.name} ({editingCurrency?.code}) Exchange Rate</span>
                  </DialogTitle>
                </DialogHeader>

                {editingCurrency && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const currentRates = { ...(settings.exchangeRates || {}), [editingCurrency.code]: editingCurrency.rate };
                      let enabledList = [...(settings.enabledExportCurrencies || ["USD", "EUR", "AED", "GBP", "SGD", "SAR"])];

                      if (editingCurrency.enabled && !enabledList.includes(editingCurrency.code)) {
                        enabledList.push(editingCurrency.code);
                      } else if (!editingCurrency.enabled && enabledList.includes(editingCurrency.code)) {
                        enabledList = enabledList.filter((c) => c !== editingCurrency.code);
                      }

                      updateSetting("exchangeRates", currentRates);
                      updateSetting("enabledExportCurrencies", enabledList);
                      toast.success(`Updated ${editingCurrency.code} rate: 1 ${editingCurrency.code} = ₹${editingCurrency.rate}`);
                      setEditingCurrency(null);
                    }}
                    className="space-y-4 pt-2 text-xs"
                  >
                    <div className="rounded-xl border border-brand/20 bg-brand-light/30 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs text-brand">
                        <span className="text-sm font-black">{editingCurrency.symbol}</span>
                        <span>{editingCurrency.code} — {editingCurrency.name}</span>
                      </div>
                      <Badge className="bg-brand text-white border-none text-[9px]">FOREIGN CURRENCY</Badge>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="currRate">Exchange Rate (1 {editingCurrency.code} in ₹ INR) *</Label>
                      <Input
                        id="currRate"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={editingCurrency.rate}
                        onChange={(e) =>
                          setEditingCurrency({ ...editingCurrency, rate: Number(e.target.value) || 0 })
                        }
                        required
                        className="h-9 font-mono font-bold text-xs"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Live Preview: 100 {editingCurrency.code} = ₹{(100 * editingCurrency.rate).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="space-y-0.5">
                        <Label htmlFor="currEnable" className="font-semibold text-xs cursor-pointer block">Enable for Foreign Invoicing</Label>
                        <p className="text-[10px] text-muted-foreground">Allow selecting {editingCurrency.code} when creating invoices.</p>
                      </div>
                      <Switch
                        id="currEnable"
                        checked={editingCurrency.enabled}
                        onCheckedChange={(val) => setEditingCurrency({ ...editingCurrency, enabled: val })}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <Button type="button" variant="outline" onClick={() => setEditingCurrency(null)} className="h-8 text-xs">
                        Cancel
                      </Button>
                      <Button type="submit" className="h-8 text-xs font-bold bg-brand hover:opacity-90 text-white">
                        Save Exchange Rate
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            {/* Dialog: Add Custom Currency */}
            <Dialog open={addCurrencyModalOpen} onOpenChange={setAddCurrencyModalOpen}>
              <DialogContent className="sm:max-w-md rounded-2xl p-6 select-none">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold flex items-center gap-2">
                    <Globe className="size-4 text-brand" />
                    <span>Add Custom Foreign Currency</span>
                  </DialogTitle>
                </DialogHeader>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCurrCode || !newCurrName) return;
                    const code = newCurrCode.toUpperCase().trim();
                    const currentRates = { ...(settings.exchangeRates || {}), [code]: newCurrRate };
                    const enabledList = [...(settings.enabledExportCurrencies || ["USD", "EUR", "AED", "GBP", "SGD", "SAR"]), code];

                    updateSetting("exchangeRates", currentRates);
                    updateSetting("enabledExportCurrencies", enabledList);
                    toast.success(`Added currency ${code} (${newCurrName}) at 1 ${code} = ₹${newCurrRate}`);
                    setAddCurrencyModalOpen(false);
                    setNewCurrCode("");
                    setNewCurrName("");
                    setNewCurrSymbol("");
                    setNewCurrRate(1);
                  }}
                  className="space-y-3 pt-2 text-xs"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="newCode">Currency Code *</Label>
                      <Input
                        id="newCode"
                        placeholder="e.g. AUD"
                        value={newCurrCode}
                        onChange={(e) => setNewCurrCode(e.target.value)}
                        required
                        className="h-9 font-mono font-bold text-xs uppercase"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="newSymbol">Symbol</Label>
                      <Input
                        id="newSymbol"
                        placeholder="e.g. A$"
                        value={newCurrSymbol}
                        onChange={(e) => setNewCurrSymbol(e.target.value)}
                        className="h-9 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="newName">Currency Name *</Label>
                    <Input
                      id="newName"
                      placeholder="e.g. Australian Dollar"
                      value={newCurrName}
                      onChange={(e) => setNewCurrName(e.target.value)}
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="newRate">Exchange Rate (in ₹ INR) *</Label>
                    <Input
                      id="newRate"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newCurrRate}
                      onChange={(e) => setNewCurrRate(Number(e.target.value) || 1)}
                      required
                      className="h-9 font-mono font-bold text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setAddCurrencyModalOpen(false)} className="h-8 text-xs">
                      Cancel
                    </Button>
                    <Button type="submit" className="h-8 text-xs font-bold bg-brand hover:opacity-90 text-white">
                      Add Currency
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
