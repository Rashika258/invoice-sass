"use client";

import React, { useState, useEffect } from "react";
import {
  Palette,
  Type,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Check,
  Upload,
  RefreshCw,
  Sliders,
  Eye,
  Building2,
  Receipt,
  QrCode,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import {
  BRAND_THEME_PRESETS,
  BRAND_FONTS,
  applyFullBrandConfig,
  getStoredBrandTheme,
  processImageFile,
  updateBrowserFavicon,
  type BrandThemePreset,
  type BrandFontOption,
  type BrandConfig,
} from "@/lib/brand-theme";
import { useAppName } from "@/hooks/use-app-name";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCompanyProfile } from "@/actions/settings";

interface BrandThemeSettingsProps {
  profile?: any;
}

export function BrandThemeSettings({ profile }: BrandThemeSettingsProps) {
  const { appName, appDomain, setAppName, setAppDomain } = useAppName();
  const [inputAppName, setInputAppName] = useState(appName);
  const [inputAppDomain, setInputAppDomain] = useState(appDomain);
  const [activeTab, setActiveTab] = useState<"app_brand" | "colors" | "fonts" | "logo" | "documents">("app_brand");
  const [config, setConfig] = useState<BrandConfig>({
    primary: "#10b981",
    secondary: "#047857",
    name: "Emerald Green",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    logoUrl: profile?.logoUrl || "",
    tagline: "Precision Engineering & Manufacturing",
    headerStyle: "MODERN_MINIMAL",
  });

  const [customPrimaryHex, setCustomPrimaryHex] = useState("#10b981");
  const [customSecondaryHex, setCustomSecondaryHex] = useState("#047857");
  const [logoPreview, setLogoPreview] = useState<string>(profile?.logoUrl || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = getStoredBrandTheme();
    setConfig((prev) => ({
      ...prev,
      ...stored,
      logoUrl: profile?.logoUrl || stored.logoUrl || "",
    }));
    setCustomPrimaryHex(stored.primary);
    setCustomSecondaryHex(stored.secondary || "#047857");
    if (profile?.logoUrl || stored.logoUrl) {
      setLogoPreview(profile?.logoUrl || stored.logoUrl || "");
    }
  }, [profile]);

  const handleSelectPreset = (preset: BrandThemePreset) => {
    const updated: BrandConfig = {
      ...config,
      primary: preset.primary,
      secondary: preset.secondary,
      name: preset.name,
      fontFamily: preset.fontFamily,
    };
    setConfig(updated);
    setCustomPrimaryHex(preset.primary);
    setCustomSecondaryHex(preset.secondary);
    applyFullBrandConfig(updated);
    toast.success(`Applied ${preset.name} theme!`);
  };

  const handleCustomPrimaryChange = (hex: string) => {
    setCustomPrimaryHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const updated: BrandConfig = { ...config, primary: hex, name: "Custom Brand" };
      setConfig(updated);
      applyFullBrandConfig(updated);
    }
  };

  const handleCustomSecondaryChange = (hex: string) => {
    setCustomSecondaryHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const updated: BrandConfig = { ...config, secondary: hex };
      setConfig(updated);
      applyFullBrandConfig(updated);
    }
  };

  const handleSelectFont = (font: BrandFontOption) => {
    const updated: BrandConfig = { ...config, fontFamily: font.fontFamily };
    setConfig(updated);
    applyFullBrandConfig(updated);
    toast.success(`Font set to ${font.name}`);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo file size must be less than 5MB");
      return;
    }

    try {
      const result = await processImageFile(file, 512);
      setLogoPreview(result);
      const updated = { ...config, logoUrl: result };
      setConfig(updated);
      applyFullBrandConfig(updated);
      updateBrowserFavicon(result);
      toast.success("Logo & favicon updated! Click 'Save Brand Identity' to persist.");
    } catch (err: any) {
      toast.error(err.message || "Failed to process logo image");
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      applyFullBrandConfig(config);
      setAppName(inputAppName);
      setAppDomain(inputAppDomain);
      // Save logo to CompanyProfile in database
      if (profile) {
        await updateCompanyProfile({
          companyName: profile.companyName || "Sri Manjunatha Engineering Works",
          email: profile.email || undefined,
          phone: profile.phone || undefined,
          address: profile.address || undefined,
          city: profile.city || undefined,
          state: profile.state || undefined,
          zipCode: profile.zipCode || undefined,
          taxId: profile.taxId || undefined,
          invoicePrefix: profile.invoicePrefix || "INV",
          currency: profile.currency || "INR",
          defaultTaxRate: profile.defaultTaxRate ?? 18,
          logoUrl: logoPreview || undefined,
        });
      }
      toast.success("Brand identity & application settings saved!");
    } catch (e: any) {
      toast.error(e.message || "Failed to save brand settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="rounded-2xl border border-brand/20 bg-brand-light p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Palette className="size-5 text-brand" />
            <h3 className="text-base font-bold text-foreground">Brand Identity &amp; Theme Studio</h3>
            <Badge className="bg-brand text-white border-none font-semibold text-[10px]">
              {inputAppName || config.name}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Configure application name, custom web domain, brand colors, typography, company logo, and document templates.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-brand text-white hover:opacity-90 font-bold text-xs h-8 rounded-xl shadow-xs cursor-pointer"
          >
            {saving ? <RefreshCw className="mr-1.5 size-3.5 animate-spin" /> : <Check className="mr-1.5 size-3.5" />}
            {saving ? "Saving..." : "Save Brand & Domain"}
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-border/80 gap-1 text-xs overflow-x-auto">
        {[
          { id: "app_brand" as const, label: "App Name & Domain", icon: Globe },
          { id: "colors" as const, label: "Colors & Palettes", icon: Palette },
          { id: "fonts" as const, label: "Brand Typography", icon: Type },
          { id: "logo" as const, label: "Logo & Identity", icon: ImageIcon },
          { id: "documents" as const, label: "Invoice & Document Styling", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-brand text-brand bg-brand-light font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 0: APP NAME & DOMAIN ────────────────────────────────────────── */}
      {activeTab === "app_brand" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe className="size-4 text-brand" />
                <span>Application Name &amp; Custom Domain</span>
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Customize your software product name and web domain. All headers, emails, storefronts, and document titles update dynamically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Application / SaaS Name</Label>
                <Input
                  value={inputAppName}
                  onChange={(e) => setInputAppName(e.target.value)}
                  placeholder="e.g. Billora, Acme ERP, VyaparIQ"
                  className="h-10 text-xs font-medium"
                />
                <p className="text-[11px] text-muted-foreground">
                  Shown in browser title, sidebar header, mobile bar, and system notices.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Custom Web Domain</Label>
                <Input
                  value={inputAppDomain}
                  onChange={(e) => setInputAppDomain(e.target.value)}
                  placeholder="e.g. billora.in, mycompany.com"
                  className="h-10 text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  Your public storefronts, payment receipts, and links will use this domain.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-muted-foreground space-y-2">
              <div className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Sparkles className="size-4" />
                <span>Domain &amp; Environment Configuration Guide</span>
              </div>
              <p>
                Haven't bought your domain yet? You can test and refine your brand name here at any time. Once you purchase your domain from GoDaddy, Namecheap, or Cloudflare:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px]">
                <li>Set <code className="font-mono text-foreground font-semibold bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_APP_NAME="{inputAppName || "Billora"}"</code> in your <code className="font-mono text-foreground">.env</code> file.</li>
                <li>Set <code className="font-mono text-foreground font-semibold bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_APP_DOMAIN="{inputAppDomain || "billora.in"}"</code> in your <code className="font-mono text-foreground">.env</code> file.</li>
                <li>Set <code className="font-mono text-foreground font-semibold bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_APP_URL="https://{inputAppDomain || "billora.in"}"</code> in your <code className="font-mono text-foreground">.env</code> file.</li>
              </ul>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Live Branding Preview</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                <span className="text-[10px] text-muted-foreground font-medium uppercase">Sidebar Header</span>
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-xs">
                    {(inputAppName || "B")[0]?.toUpperCase() || "B"}
                  </div>
                  <span className="text-xs font-bold text-foreground">{inputAppName || "Billora"}</span>
                  <Badge className="bg-brand text-white text-[8px] px-1 py-0">BUSINESS OS</Badge>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                <span className="text-[10px] text-muted-foreground font-medium uppercase">Storefront Footer</span>
                <div className="text-xs text-muted-foreground font-mono">
                  Powered by <span className="font-bold text-foreground">{inputAppName || "Billora"}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                <span className="text-[10px] text-muted-foreground font-medium uppercase">Live URL Structure</span>
                <div className="text-xs font-mono text-brand truncate">
                  https://{inputAppDomain || "billora.in"}/store/zenith
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 1: COLORS & PALETTES ────────────────────────────────────────── */}
      {activeTab === "colors" && (
        <div className="space-y-6">
          {/* Curated Presets Grid */}
          <div className="rounded-2xl border border-border p-5 bg-card space-y-4">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-4 text-brand" />
                <span>Curated Industry Themes</span>
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Select a hand-crafted dual-tone palette tailored for distinct business sectors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {BRAND_THEME_PRESETS.map((preset) => {
                const isSelected = config.primary.toLowerCase() === preset.primary.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand bg-brand-light shadow-xs ring-1 ring-brand font-semibold"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {/* Dual Color Swatch */}
                        <div className="flex -space-x-1.5 items-center">
                          <div
                            className="size-5 rounded-full shadow-inner border border-black/10 z-10"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div
                            className="size-4 rounded-full shadow-inner border border-black/10"
                            style={{ backgroundColor: preset.secondary }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground">{preset.name}</span>
                      </div>
                      {isSelected && (
                        <div className="size-4 rounded-full bg-brand flex items-center justify-center text-white">
                          <Check className="size-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Dual-Tone Hex Pickers */}
          <div className="rounded-2xl border border-border p-5 bg-card space-y-4">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="size-4 text-brand" />
                <span>Custom Dual-Tone Brand Colors</span>
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Configure exact corporate Pantone or hex codes for primary buttons and secondary accents.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Primary Color */}
              <div className="space-y-1.5 p-3 rounded-xl border border-border/80 bg-muted/20">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Primary Brand Color</span>
                  <span className="text-[10px] font-mono text-muted-foreground">Main buttons &amp; active tabs</span>
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customPrimaryHex}
                    onChange={(e) => handleCustomPrimaryChange(e.target.value)}
                    className="size-9 rounded-lg border border-border cursor-pointer p-0.5 bg-transparent shrink-0"
                  />
                  <Input
                    type="text"
                    placeholder="#10b981"
                    value={customPrimaryHex}
                    onChange={(e) => handleCustomPrimaryChange(e.target.value)}
                    className="h-9 font-mono text-xs font-bold uppercase bg-background"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-1.5 p-3 rounded-xl border border-border/80 bg-muted/20">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Secondary / Accent Color</span>
                  <span className="text-[10px] font-mono text-muted-foreground">Borders, gradients &amp; subheadings</span>
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customSecondaryHex}
                    onChange={(e) => handleCustomSecondaryChange(e.target.value)}
                    className="size-9 rounded-lg border border-border cursor-pointer p-0.5 bg-transparent shrink-0"
                  />
                  <Input
                    type="text"
                    placeholder="#047857"
                    value={customSecondaryHex}
                    onChange={(e) => handleCustomSecondaryChange(e.target.value)}
                    className="h-9 font-mono text-xs font-bold uppercase bg-background"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: BRAND TYPOGRAPHY ────────────────────────────────────────── */}
      {activeTab === "fonts" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border p-5 bg-card space-y-4">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Type className="size-4 text-brand" />
                <span>Brand Typography &amp; Font Family</span>
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Select the font family used across dashboards, menus, and printed PDF invoices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {BRAND_FONTS.map((font) => {
                const isSelected = config.fontFamily?.includes(font.name) || config.fontFamily === font.fontFamily;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => handleSelectFont(font)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand bg-brand-light shadow-xs ring-1 ring-brand font-semibold"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{font.name}</span>
                        <Badge variant="outline" className="text-[9px] font-medium text-muted-foreground">
                          {font.category}
                        </Badge>
                      </div>
                      {isSelected && (
                        <div className="size-4 rounded-full bg-brand flex items-center justify-center text-white">
                          <Check className="size-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div
                      className="p-2.5 my-2 rounded-lg bg-background border border-border/60 text-xs text-foreground font-medium"
                      style={{ fontFamily: font.fontFamily }}
                    >
                      {font.sampleText}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {font.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: LOGO & VISUAL IDENTITY ─────────────────────────────────── */}
      {activeTab === "logo" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border p-5 bg-card space-y-5">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <ImageIcon className="size-4 text-brand" />
                <span>Company Logo &amp; Brand Badges</span>
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Upload your enterprise emblem. Used in the top header, sidebar brand card, and invoice prints.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* Logo Preview & Browser Tab Simulation */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-border bg-muted/20 text-center space-y-3">
                {logoPreview ? (
                  <div className="relative size-24 rounded-2xl overflow-hidden border border-border bg-background shadow-md flex items-center justify-center p-2">
                    <img
                      src={logoPreview}
                      alt="Company Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="size-24 rounded-2xl bg-brand-light flex items-center justify-center text-brand font-black text-3xl shadow-inner border border-brand/20">
                    {profile?.companyName?.charAt(0) || "B"}
                  </div>
                )}
                <div className="text-xs font-semibold text-foreground">
                  {logoPreview ? "Active Brand Logo" : "Default Initial Emblem"}
                </div>

                {/* Live Favicon Preview Tab */}
                <div className="w-full pt-1 border-t border-border/60">
                  <div className="rounded-lg border border-border bg-card shadow-2xs p-1.5 flex items-center gap-1.5 text-left">
                    <div className="size-4 rounded-xs border border-border/60 bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
                      {logoPreview ? (
                        <img src={logoPreview} alt="" className="size-full object-contain" />
                      ) : (
                        <Globe className="size-3 text-brand" />
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-foreground truncate max-w-[120px]">
                      {inputAppName || "Billora"} Tab Favicon
                    </span>
                  </div>
                </div>
              </div>

              {/* Upload & Tagline Form */}
              <div className="sm:col-span-2 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Upload Logo Image</Label>
                  <label className="flex items-center justify-center gap-2 h-9 px-4 rounded-xl border border-input bg-background hover:bg-muted text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="size-3.5 text-brand" />
                    <span>Choose File (PNG, JPG, SVG, max 2MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-muted-foreground">
                    Recommended: Transparent PNG, at least 400x400px.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Company Tagline / Slogan</Label>
                  <Input
                    value={config.tagline || ""}
                    onChange={(e) => {
                      const updated = { ...config, tagline: e.target.value };
                      setConfig(updated);
                      applyFullBrandConfig(updated);
                    }}
                    placeholder="e.g. Precision Engineering &amp; Industrial Solutions"
                    className="h-8 text-xs font-medium"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Printed right below company name on invoices and quotations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: DOCUMENT & INVOICE STYLING ──────────────────────────────── */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border p-5 bg-card space-y-4">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <FileText className="size-4 text-brand" />
                <span>Invoice Header &amp; Accent Layout Style</span>
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Choose how brand colors and logos appear on printed and PDF tax invoices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {[
                {
                  id: "MODERN_MINIMAL" as const,
                  name: "Modern Minimalist",
                  desc: "Clean white background with brand-colored line accents and bold totals.",
                  badge: "Recommended",
                },
                {
                  id: "BOLD_GRADIENT" as const,
                  name: "Bold Dual-Tone Header",
                  desc: "Full brand-colored gradient header banner with white typography and white logo.",
                  badge: "Popular",
                },
                {
                  id: "CLASSIC_ELEGANT" as const,
                  name: "Classic Elegant Border",
                  desc: "Dual-bordered traditional layout with watermark and framed table borders.",
                  badge: "Formal",
                },
                {
                  id: "INDUSTRIAL_SOLID" as const,
                  name: "Industrial Solid Header",
                  desc: "Heavy industrial contrast header designed for dot-matrix and thermal bills.",
                  badge: "High Contrast",
                },
              ].map((style) => {
                const isSelected = config.headerStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      const updated = { ...config, headerStyle: style.id };
                      setConfig(updated);
                      applyFullBrandConfig(updated);
                      toast.success(`Document header style set to ${style.name}`);
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand bg-brand-light ring-1 ring-brand font-semibold"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-foreground">{style.name}</span>
                      <Badge variant="outline" className={`text-[9px] ${isSelected ? "border-brand text-brand" : "text-muted-foreground"}`}>
                        {style.badge}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-snug">
                      {style.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── LIVE INTERACTIVE BRAND SANDBOX ─────────────────────────────────── */}
      <div className="rounded-2xl border border-border p-5 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Eye className="size-3.5 text-brand" />
            <span>Live Brand Identity Sandbox (Real-Time Preview)</span>
          </h4>
          <span className="text-[10px] text-muted-foreground font-mono">
            Font: {config.fontFamily?.split(",")[0].replace(/'/g, "")} · Primary: {config.primary}
          </span>
        </div>

        {/* Live Mini Invoice Card */}
        <div
          className="p-5 rounded-2xl border border-border bg-background shadow-md space-y-4"
          style={{ fontFamily: config.fontFamily }}
        >
          {/* Mock Header */}
          <div className="flex items-start justify-between border-b border-border/80 pb-4">
            <div className="flex items-center gap-3">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="size-12 rounded-lg object-contain border border-border/60 p-1" />
              ) : (
                <div className="size-12 rounded-xl bg-brand text-white flex items-center justify-center font-black text-xl shadow-xs">
                  {profile?.companyName?.charAt(0) || "B"}
                </div>
              )}
              <div>
                <h3 className="text-sm font-black text-foreground">{profile?.companyName || "Sri Manjunatha Engineering Works"}</h3>
                <p className="text-[10px] text-brand font-semibold">{config.tagline || "Precision Engineering & Manufacturing"}</p>
                <p className="text-[10px] text-muted-foreground font-mono">GSTIN: {profile?.taxId || "29AEZPC6364C1Z5"}</p>
              </div>
            </div>

            <div className="text-right">
              <Badge className="bg-brand text-white border-none font-bold text-xs shadow-2xs">TAX INVOICE</Badge>
              <p className="text-xs font-mono font-bold text-foreground mt-1">#INV-2026-0048</p>
              <p className="text-[10px] text-muted-foreground">Date: 05/09/2026</p>
            </div>
          </div>

          {/* Mock Bill Items Table */}
          <div className="rounded-xl border border-border overflow-hidden text-[11px]">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                <tr>
                  <th className="py-1.5 px-3 text-left">Item Description</th>
                  <th className="py-1.5 px-3 text-center">HSN</th>
                  <th className="py-1.5 px-3 text-center">Qty</th>
                  <th className="py-1.5 px-3 text-right">Rate (₹)</th>
                  <th className="py-1.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <tr>
                  <td className="py-2 px-3 font-semibold">Industrial Flange Bush 40mm</td>
                  <td className="py-2 px-3 text-center font-mono text-muted-foreground">8483</td>
                  <td className="py-2 px-3 text-center font-mono">10 PCS</td>
                  <td className="py-2 px-3 text-right font-mono">₹1,018.00</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">₹10,180.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mock Summary Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-brand text-white font-bold text-xs h-7 rounded-lg shadow-xs">
                Print Tax Invoice
              </Button>
              <Button size="sm" variant="outline" className="border-brand text-brand hover:bg-brand-light font-bold text-xs h-7 rounded-lg">
                Share via WhatsApp
              </Button>
            </div>

            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total Payable</div>
              <div className="text-base font-black font-mono text-brand">₹12,012.00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
