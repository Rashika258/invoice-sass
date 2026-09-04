"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Check,
  ChevronDown,
  Edit2,
  HardDrive,
  Info,
  Layers,
  Monitor,
  PlayCircle,
  Save,
  Search,
  ShieldCheck,
  Sliders,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAppSettings, saveAppSettingsAction } from "@/actions/store-ops";
import { updateCompanyProfile } from "@/actions/settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AppSettings } from "@/lib/settings-store";

const SETTINGS_SECTIONS = [
  "GENERAL",
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

export function VyaparSettingsView({ profile }: { profile: any }) {
  const [activeSection, setActiveSection] = useState("GENERAL");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [zoom, setZoom] = useState(100);
  const [saving, setSaving] = useState(false);

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
      });
      toast.success("Settings updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to save settings");
    } finally {
      setSaving(false);
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
              onClick={() => setActiveSection(sec)}
              className={`w-full text-left px-3 py-2 text-xs font-semibold tracking-wider transition-colors cursor-pointer ${
                activeSection === sec
                  ? "bg-[#ef4444]/15 text-[#ef4444] border-l-3 border-[#ef4444] font-bold"
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
              className="h-8 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-xs shadow-xs"
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
                    className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                    className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                    className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                    className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                    className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                    className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                    className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                    className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                    className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                    className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                      className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                        className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                    className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                    className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                    className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                    className="size-4 rounded accent-[#ef4444] cursor-pointer"
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
                    You can use this setting to resize the Vyapar screen, making it larger or smaller to fit your preferences.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Slider Control */}
                  <div className="space-y-2">
                    <input
                      type="range"
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

        {/* SECTION: TRANSACTION & PRINT (Company Profile details) */}
        {activeSection !== "GENERAL" && (
          <div className="max-w-xl space-y-4 text-xs">
            <div className="rounded-xl border border-border p-4 space-y-3">
              <h3 className="font-bold text-foreground">Company &amp; Tax Profile</h3>
              <div className="space-y-2">
                <div>
                  <Label>Company Display Name</Label>
                  <Input defaultValue={profile?.companyName || "Sri Manjunatha Engineering Works"} className="h-8 text-xs font-bold" />
                </div>
                <div>
                  <Label>GSTIN</Label>
                  <Input defaultValue={profile?.taxId || "29AABCU9603R1ZM"} className="h-8 text-xs font-mono" />
                </div>
                <div>
                  <Label>Registered Office Address</Label>
                  <Input defaultValue={profile?.address || "No. 42, Industrial Area, Peenya 3rd Phase"} className="h-8 text-xs" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
