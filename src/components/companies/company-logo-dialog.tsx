"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  Globe,
  ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { updateCompanyLogoAction, switchActiveCompanyAction } from "@/actions/companies";
import { processImageFile, updateBrowserFavicon } from "@/lib/brand-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CompanyLogoDialogProps {
  companyId: string;
  companyName: string;
  currentLogoUrl?: string | null;
  isActive: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newLogoUrl: string | null) => void;
}

// Built-in curated business SVG logos for quick 1-click selection
const SAMPLE_BUSINESS_LOGOS = [
  {
    name: "Industrial Gear",
    category: "Manufacturing",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%2310b981'><circle cx='50' cy='50' r='20' fill='white'/><path d='M50 15 L56 26 L68 22 L70 34 L82 36 L78 48 L88 56 L80 64 L86 74 L74 78 L72 90 L60 88 L54 98 L46 98 L40 88 L28 90 L26 78 L14 74 L20 64 L12 56 L22 48 L18 36 L30 34 L32 22 L44 26 Z'/><circle cx='50' cy='50' r='14' fill='%2310b981'/></svg>",
  },
  {
    name: "Retail Cart",
    category: "Supermarket / Retail",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%232563eb'><rect width='100' height='100' rx='24' fill='%232563eb'/><path d='M25 32 h12 l8 30 h30 l6 -20 h-40' fill='none' stroke='white' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/><circle cx='48' cy='72' r='5' fill='white'/><circle cx='70' cy='72' r='5' fill='white'/></svg>",
  },
  {
    name: "Health Cross",
    category: "Pharmacy / Clinic",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23ef4444'><rect width='100' height='100' rx='24' fill='%23ef4444'/><path d='M40 22 h20 v18 h18 v20 h-18 v18 h-20 v-18 h-18 v-20 h18 Z' fill='white'/></svg>",
  },
  {
    name: "Gold Shield",
    category: "Corporate / CA",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23f59e0b'><rect width='100' height='100' rx='24' fill='%23f59e0b'/><path d='M50 22 L75 32 V52 C75 68 50 78 50 78 C50 78 25 68 25 52 V32 Z' fill='white'/><path d='M44 48 L50 54 L62 42' fill='none' stroke='%23f59e0b' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  },
  {
    name: "Tech Hexagon",
    category: "IT / SaaS",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238b5cf6'><rect width='100' height='100' rx='24' fill='%238b5cf6'/><polygon points='50,24 76,39 76,69 50,84 24,69 24,39' fill='none' stroke='white' stroke-width='6'/><circle cx='50' cy='54' r='10' fill='white'/></svg>",
  },
  {
    name: "Agro Leaf",
    category: "Agri / Organics",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23059669'><rect width='100' height='100' rx='24' fill='%23059669'/><path d='M30 70 C30 35 60 25 75 25 C75 55 55 75 30 70 Z' fill='white'/><path d='M30 70 Q50 50 75 25' fill='none' stroke='%23059669' stroke-width='4'/></svg>",
  },
];

export function CompanyLogoDialog({
  companyId,
  companyName,
  currentLogoUrl,
  isActive,
  open,
  onOpenChange,
  onSuccess,
}: CompanyLogoDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>(currentLogoUrl || "");
  const [urlInput, setUrlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPendingSwitch, startTransition] = useTransition();

  // Reset preview when dialog opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setLogoPreview(currentLogoUrl || "");
      setUrlInput("");
    }
    onOpenChange(nextOpen);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    setIsProcessing(true);
    try {
      const optimizedDataUrl = await processImageFile(file, 512);
      setLogoPreview(optimizedDataUrl);
      if (isActive) {
        updateBrowserFavicon(optimizedDataUrl);
      }
      toast.success("Image optimized! Ready to save.");
    } catch (err: any) {
      toast.error(err.message || "Failed to process image file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setLogoPreview(urlInput.trim());
    if (isActive) {
      updateBrowserFavicon(urlInput.trim());
    }
    toast.success("Logo URL applied to preview!");
    setUrlInput("");
  };

  const handleSelectPreset = (presetUrl: string) => {
    setLogoPreview(presetUrl);
    if (isActive) {
      updateBrowserFavicon(presetUrl);
    }
    toast.info("Applied preset icon to preview");
  };

  const handleRemoveLogo = () => {
    setLogoPreview("");
    if (isActive) {
      updateBrowserFavicon("/favicon.ico");
    }
    toast.info("Logo removed in preview");
  };

  const handleSave = async (andSwitch = false) => {
    setIsSaving(true);
    try {
      const result = await updateCompanyLogoAction(companyId, logoPreview || null);

      if (result.isCurrentOrg) {
        updateBrowserFavicon(result.logoUrl);
      }

      toast.success(
        result.isCurrentOrg
          ? "Brand logo & browser favicon updated successfully!"
          : `Logo & favicon saved for ${companyName}!`
      );

      if (andSwitch && !isActive) {
        startTransition(async () => {
          try {
            await switchActiveCompanyAction(companyId);
            updateBrowserFavicon(result.logoUrl);
            toast.success(`Switched active firm to ${companyName} with new logo & favicon!`);
            window.location.reload();
          } catch (e: any) {
            toast.error(e.message || "Failed to switch company");
          }
        });
        return;
      }

      onSuccess?.(result.logoUrl);
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save company logo");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-border/80 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ImageIcon className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Logo &amp; Favicon Manager</span>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="text-[10px] uppercase font-bold"
                  >
                    {isActive ? "Active Firm" : "Secondary Firm"}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Set the brand logo and browser tab favicon for <strong>{companyName}</strong>
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Live Preview Showcase */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Live Rendering Preview
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Simulates real app navigation &amp; browser tab
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 1. Browser Tab Favicon Preview */}
              <div className="rounded-xl border border-border/80 bg-muted/40 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>Browser Tab (Favicon)</span>
                  <Globe className="size-3.5 text-primary" />
                </div>
                {/* Simulated Browser Chrome Tab */}
                <div className="rounded-lg border border-border bg-card shadow-xs p-1.5 flex items-center gap-2 max-w-full">
                  <div className="size-5 rounded-sm border border-border/60 bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Favicon preview"
                        className="size-full object-contain p-0.5"
                      />
                    ) : (
                      <span className="text-[9px] font-black text-primary">
                        {companyName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground truncate max-w-[170px]">
                    {companyName} — ERP
                  </span>
                  <X className="size-3 text-muted-foreground ml-auto shrink-0 opacity-60" />
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  This icon appears in the browser tab, bookmarks, and mobile PWA home screen.
                </p>
              </div>

              {/* 2. Brand Header / Sidebar Logo Preview */}
              <div className="rounded-xl border border-border/80 bg-muted/40 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>Brand Header &amp; Sidebar</span>
                  <Building2 className="size-3.5 text-primary" />
                </div>
                {/* Simulated Header Bar */}
                <div className="rounded-lg border border-border bg-card shadow-xs p-1.5 flex items-center gap-2">
                  <div className="size-8 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden shrink-0 p-1">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Brand preview"
                        className="size-full object-contain"
                      />
                    ) : (
                      <Building2 className="size-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate leading-tight">
                      {companyName}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Business Operating System</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Displayed prominently in top navigation, invoices, quotations, and payslips.
                </p>
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Upload New Logo Image
            </Label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/60 hover:bg-primary/[0.02] rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
            >
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2 py-3">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground font-medium">
                    Optimizing image for crisp high-DPI logo &amp; favicon...
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-1">
                    <Upload className="size-6" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">
                      Click to browse or drag &amp; drop an image
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports PNG, JPG, WebP, SVG (Recommended: 512x512 transparent PNG)
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* URL Input */}
            <div className="flex gap-2 items-center pt-1">
              <Input
                placeholder="Or paste an image URL (https://.../logo.png)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyUrl();
                  }
                }}
                className="text-xs h-9"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyUrl}
                disabled={!urlInput.trim()}
                className="h-9 px-3 text-xs shrink-0"
              >
                Apply URL
              </Button>
            </div>
          </div>

          {/* Quick Preset Business Logos */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>Or Choose a Ready-Made Business Logo</span>
              </Label>
              {logoPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="h-6 text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                >
                  <Trash2 className="size-3 mr-1" />
                  Clear Logo
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SAMPLE_BUSINESS_LOGOS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => handleSelectPreset(sample.url)}
                  className="flex items-center gap-2 p-2 rounded-xl border border-border/80 bg-card hover:border-primary/60 hover:bg-accent/40 text-left transition-all cursor-pointer group"
                >
                  <div className="size-7 rounded-lg border border-border/60 bg-muted/40 p-1 shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                    <img src={sample.url} alt="" className="size-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{sample.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{sample.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scope notice */}
          <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3 text-xs text-muted-foreground flex items-start gap-2.5">
            <Check className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">
                {isActive ? "Currently Active Company" : "Secondary Firm"}
              </p>
              <p className="text-[11px] mt-0.5 leading-relaxed">
                {isActive
                  ? "Saving this logo will immediately update the sidebar brand logo, top header, invoices, and your browser tab favicon."
                  : `Saving will store this logo for ${companyName}. When you switch to this company, this logo will automatically become the active brand logo and browser favicon.`}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-border/80 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving || isPendingSwitch}
            className="text-xs"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isActive && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSave(true)}
                disabled={isSaving || isPendingSwitch}
                className="text-xs font-semibold gap-1.5 flex-1 sm:flex-initial"
              >
                {isPendingSwitch ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="size-3.5 text-primary" />
                )}
                <span>Save &amp; Switch Firm</span>
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              onClick={() => handleSave(false)}
              disabled={isSaving || isPendingSwitch}
              className="text-xs font-bold gap-1.5 flex-1 sm:flex-initial"
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              <span>Save Logo &amp; Favicon</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
