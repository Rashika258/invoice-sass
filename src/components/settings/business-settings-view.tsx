"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Edit2,
  Fingerprint,
  HardDrive,
  Info,
  Layers,
  Monitor,
  Palette,
  PlayCircle,
  Save,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  UserCheck,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AppSettings } from "@/lib/settings-store";
import { PrintSettings } from "@/components/settings/sections/print-settings";
import { TransactionSettings } from "@/components/settings/sections/transaction-settings";
import { TaxesSettings } from "@/components/settings/sections/taxes-settings";
import { BrandThemeSettings } from "@/components/settings/sections/brand-theme-settings";

const SETTINGS_SECTIONS = [
  "GENERAL",
  "BRAND & THEME",
  "ATTENDANCE & BIOMETRIC",
  "TRANSACTION",
  "PRINT",
  "TAXES & GST",
  "TRANSACTION MESSAGE",
  "PARTY",
  "ITEM",
  "SERVICE REMINDERS",
  "ACCOUNTING",
  "MULTI CURRENCY",
];

const ZOOM_LEVELS = [70, 80, 90, 100, 110, 115, 120, 130];

export function BusinessSettingsView({ profile }: { profile: any }) {
  const [activeSection, setActiveSection] = useState("GENERAL");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [zoom, setZoom] = useState(100);
  const [saving, setSaving] = useState(false);

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

      if (data.screenZoom && typeof document !== "undefined") {
        (document.documentElement.style as any).zoom = `${data.screenZoom}%`;
      }
    });
  }, []);

  const handleApplyZoom = async () => {
    if (typeof document !== "undefined") {
      (document.documentElement.style as any).zoom = `${zoom}%`;
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
    <div className="flex h-[calc(100vh-5rem)] rounded-2xl border border-border bg-card overflow-hidden shadow-sm select-none">
      {/* Left Sidebar Menu matching media_1788527610985.png */}
      <div className="w-56 shrink-0 bg-[#0f1117] text-white flex flex-col border-r border-border/40">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-sm font-bold tracking-tight">Settings</span>
          <Search className="size-4 text-zinc-400 cursor-pointer" />
        </div>

        <div className="flex-1 overflow-y-auto py-1.5 space-y-0.5">
          {SETTINGS_SECTIONS.map((sec) => (
            <button
              key={sec}
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveSection(sec)}
              className={`w-full text-left px-3 py-2 text-xs font-semibold tracking-wider transition-colors cursor-pointer ${
                activeSection === sec
                  ? "bg-brand-light text-brand border-l-3 border-brand font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        {/* Top bar with Close (X) icon */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground capitalize">
              {activeSection.toLowerCase()} Settings
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

        {/* SECTION: GENERAL (3-Column Layout matching media_1788527610985.png) */}
        {activeSection === "GENERAL" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
            {/* COLUMN 1: APPLICATION & MORE TRANSACTIONS */}
            <div className="space-y-6">
              {/* Application Block */}
              <div className="space-y-3.5">
                <h3 className="font-bold text-foreground text-sm">Application</h3>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="passcode"
                    checked={passcode}
                    onChange={(e) => setPasscode(e.target.checked)}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <Label htmlFor="passcode" className="cursor-pointer">Enable Passcode</Label>
                  <Info className="size-3 text-muted-foreground" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Business Currency <Info className="size-3 text-muted-foreground" />
                  </span>
                  <select
                    value={currency}
                    suppressHydrationWarning
                    onChange={(e) => setCurrency(e.target.value)}
                    className="h-7 rounded border border-input bg-background px-2 text-xs font-semibold"
                  >
                    <option value="INR">₹ (INR)</option>
                    <option value="USD">$ (USD)</option>
                    <option value="EUR">€ (EUR)</option>
                    <option value="AED">AED</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Amount (upto Decimal Places) <Info className="size-3 text-muted-foreground" />
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      suppressHydrationWarning
                      min="0"
                      max="4"
                      value={decimalPlaces}
                      onChange={(e) => setDecimalPlaces(Number(e.target.value))}
                      className="h-7 w-12 rounded border border-input bg-background px-2 font-mono text-center"
                    />
                    <span className="text-[10px] text-muted-foreground">e.g. 0.00</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="gstin"
                    checked={gstinEnabled}
                    onChange={(e) => setGstinEnabled(e.target.checked)}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <Label htmlFor="gstin" className="cursor-pointer font-medium">GSTIN Number</Label>
                  <Info className="size-3 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="stopNeg"
                    checked={negativeStock}
                    onChange={(e) => setNegativeStock(e.target.checked)}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <Label htmlFor="stopNeg" className="cursor-pointer">Stop Sale on Negative Stock</Label>
                  <Info className="size-3 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="blkItems"
                    checked={blockItems}
                    onChange={(e) => setBlockItems(e.target.checked)}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <Label htmlFor="blkItems" className="cursor-pointer">Block New Items from Txn Form</Label>
                  <Info className="size-3 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="blkParties"
                    checked={blockParties}
                    onChange={(e) => setBlockParties(e.target.checked)}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <Label htmlFor="blkParties" className="cursor-pointer">Block New Parties from Txn Form</Label>
                  <Info className="size-3 text-muted-foreground" />
                </div>
              </div>

              {/* More Transactions Block matching media_1788527610985.png */}
              <div className="space-y-3 pt-3 border-t border-border">
                <h3 className="font-bold text-foreground text-sm">More Transactions</h3>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="est"
                    checked={enableEstimate}
                    onChange={(e) => setEnableEstimate(e.target.checked)}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <Label htmlFor="est" className="cursor-pointer">Estimate/Quotation</Label>
                  <Info className="size-3 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prof"
                    checked={enableProforma}
                    onChange={(e) => setEnableProforma(e.target.checked)}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <Label htmlFor="prof" className="cursor-pointer">Proforma Invoice</Label>
                  <Info className="size-3 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ord"
                    checked={enableOrder}
                    onChange={(e) => setEnableOrder(e.target.checked)}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <Label htmlFor="ord" className="cursor-pointer">Sale/Purchase Order</Label>
                  <Info className="size-3 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="othInc"
                    checked={enableOtherIncome}
                    onChange={(e) => setEnableOtherIncome(e.target.checked)}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <Label htmlFor="othInc" className="cursor-pointer">Other Income</Label>
                  <Info className="size-3 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="fa"
                    checked={enableFixedAssets}
                    onChange={(e) => setEnableFixedAssets(e.target.checked)}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <Label htmlFor="fa" className="cursor-pointer">Fixed Assets (FA)</Label>
                  <Info className="size-3 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="dc"
                      checked={enableChallan}
                      onChange={(e) => setEnableChallan(e.target.checked)}
                      className="size-4 rounded accent-brand cursor-pointer"
                    />
                    <Label htmlFor="dc" className="cursor-pointer">Delivery Challan</Label>
                    <Info className="size-3 text-muted-foreground" />
                  </div>

                  {enableChallan && (
                    <div className="flex items-center gap-2 pl-6">
                      <input
                        type="checkbox"
                        id="dcRet"
                        checked={enableReturnChallan}
                        onChange={(e) => setEnableReturnChallan(e.target.checked)}
                        className="size-4 rounded accent-brand cursor-pointer"
                      />
                      <Label htmlFor="dcRet" className="cursor-pointer">Goods return on Delivery Challan</Label>
                      <Info className="size-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 2: MULTI FIRM, GODOWNS & ONLINE STORE INVENTORY MODE */}
            <div className="space-y-6">
              {/* Multi Firm */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="mf"
                    checked={multiFirm}
                    onChange={(e) => setMultiFirm(e.target.checked)}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <Label htmlFor="mf" className="font-bold text-foreground text-sm cursor-pointer">
                    Multi Firm
                  </Label>
                </div>

                <div className="rounded-xl border border-primary/50 bg-primary/5 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3.5 rounded-full border-2 border-primary bg-primary" />
                    <span className="font-bold text-foreground">
                      {profile?.companyName || "Sri Manjunatha Engineering Works"}
                    </span>
                    <Badge className="bg-primary/20 text-primary border-none text-[9px] px-1 py-0">
                      DEFAULT
                    </Badge>
                  </div>
                  <button type="button" className="text-muted-foreground hover:text-foreground">
                    <Edit2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Stock Transfer Between Godowns */}
              <div className="space-y-2 pt-3 border-t border-border">
                <h3 className="font-bold text-foreground text-sm">
                  Stock Transfer Between Godowns
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Manage all your stores/godowns and transfer stock seamlessly between them. Using this feature, you can transfer stock between stores/godowns and manage your inventory more efficiently.
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="godown"
                    checked={godowns}
                    onChange={(e) => setGodowns(e.target.checked)}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <Label htmlFor="godown" className="cursor-pointer flex items-center gap-1.5 font-medium">
                    <span>Godown management &amp; Stock transfer</span>
                    <PlayCircle className="size-3.5 text-rose-500" />
                  </Label>
                </div>
              </div>

              {/* Configurable Online Store Mode (USER's exact request!) */}
              <div className="space-y-2 pt-3 border-t border-border">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Layers className="size-4 text-primary" />
                  <span>Online Store Inventory &amp; Billing</span>
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Configure whether the digital store has its own independent stock and dedicated bills, or syncs with main B2B inventory.
                </p>

                <div className="space-y-2 pt-1">
                  <div
                    onClick={() => setStoreMode("SEPARATE")}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      storeMode === "SEPARATE"
                        ? "border-primary bg-primary/5 font-semibold text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Separate Mode (Independent Stock &amp; DB)</span>
                      <div className={`size-3 rounded-full border-2 ${storeMode === "SEPARATE" ? "border-primary bg-primary" : "border-muted"}`} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Online sales generate separate Store GST Bills and deduct only from online stock.
                    </p>
                  </div>

                  <div
                    onClick={() => setStoreMode("SHARED")}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      storeMode === "SHARED"
                        ? "border-primary bg-primary/5 font-semibold text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Shared Mode (Unified Warehouse Stock)</span>
                      <div className={`size-3 rounded-full border-2 ${storeMode === "SHARED" ? "border-primary bg-primary" : "border-muted"}`} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Online sales draw directly from physical stock and appear in the main sale invoices list.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: BACKUP & SCREEN ZOOM / SCALE */}
            <div className="space-y-6">
              {/* Backup & History */}
              <div className="space-y-3">
                <h3 className="font-bold text-foreground text-sm">Backup &amp; History</h3>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoBk"
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <Label htmlFor="autoBk" className="cursor-pointer">Auto Backup</Label>
                  <Info className="size-3 text-muted-foreground" />
                </div>

                <div className="text-[11px] text-muted-foreground pl-6">
                  Last Backup 04/09/2026 | 07:09 AM <Info className="inline size-3 text-muted-foreground ml-0.5" />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="audit"
                    checked={auditTrail}
                    onChange={(e) => setAuditTrail(e.target.checked)}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <Label htmlFor="audit" className="cursor-pointer font-medium">Audit Trail</Label>
                  <Info className="size-3 text-muted-foreground" />
                </div>
              </div>

              {/* Customize Your View: Screen Zoom/Scale slider matching media_1788527610985.png */}
              <div className="space-y-3 pt-3 border-t border-border">
                <h3 className="font-bold text-foreground text-sm">Customize Your View</h3>

                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Choose Your Screen Zoom/Scale</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    You can use this setting to resize the Billora screen, making it larger or smaller to fit your preferences.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Slider Control */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      suppressHydrationWarning
                      min="70"
                      max="130"
                      step="5"
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                      {ZOOM_LEVELS.map((lvl) => (
                        <span
                          key={lvl}
                          onClick={() => setZoom(lvl)}
                          className={`cursor-pointer hover:text-foreground ${zoom === lvl ? "font-bold text-primary" : ""}`}
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
                      className="h-7 text-xs font-semibold rounded-lg bg-primary text-primary-foreground px-4"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-brand hover:text-white hover:border-brand transition-all cursor-pointer"
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
                <select
                  value={settings.currentFinancialYear}
                  onChange={(e) => updateSetting("currentFinancialYear", e.target.value)}
                  className="h-8 w-full max-w-[200px] rounded-lg border border-border bg-background px-3 text-xs font-mono font-bold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  {["2023-2024", "2024-2025", "2025-2026", "2026-2027"].map((fy) => (
                    <option key={fy} value={fy}>{fy} (Apr–Mar)</option>
                  ))}
                </select>
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
                <Monitor className="size-5" />
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

              <div className="pt-2 border-t border-border/50 space-y-2">
                <Label className="text-xs font-semibold text-foreground">Export / Secondary Currencies</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { code: "USD", name: "US Dollar", symbol: "$", rate: "83.92" },
                    { code: "EUR", name: "Euro", symbol: "€", rate: "91.20" },
                    { code: "AED", name: "UAE Dirham", symbol: "د.إ", rate: "22.85" },
                    { code: "GBP", name: "British Pound", symbol: "£", rate: "106.40" },
                    { code: "SGD", name: "Singapore Dollar", symbol: "S$", rate: "62.80" },
                    { code: "SAR", name: "Saudi Riyal", symbol: "﷼", rate: "22.38" },
                  ].map((cur) => (
                    <div key={cur.code} className="p-3 rounded-xl border border-border bg-card/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-xs">{cur.symbol} {cur.code}</span>
                        <Badge variant="secondary" className="text-[9px] font-mono">1 {cur.code} = ₹{cur.rate}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{cur.name}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground pt-1">Exchange rates are updated manually. Click any rate to edit.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
