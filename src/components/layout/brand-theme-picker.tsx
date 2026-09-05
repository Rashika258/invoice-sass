"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Palette, Sparkles, Type, SlidersHorizontal, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  BRAND_THEME_PRESETS,
  BRAND_FONTS,
  applyBrandTheme,
  getStoredBrandTheme,
  type BrandThemePreset,
  type BrandFontOption,
} from "@/lib/brand-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function BrandThemePicker() {
  const [currentTheme, setCurrentTheme] = useState<{ primary: string; name: string; fontFamily?: string }>({
    primary: "#10b981",
    name: "Emerald Green",
    fontFamily: "Inter, sans-serif",
  });
  const [customHex, setCustomHex] = useState("#10b981");

  useEffect(() => {
    const stored = getStoredBrandTheme();
    setCurrentTheme(stored);
    setCustomHex(stored.primary);
  }, []);

  const handleSelectPreset = (preset: BrandThemePreset) => {
    setCurrentTheme({ primary: preset.primary, name: preset.name, fontFamily: preset.fontFamily });
    setCustomHex(preset.primary);
    applyBrandTheme(preset.primary, preset.name, preset.secondary, preset.fontFamily);
    toast.success(`Theme updated to ${preset.name}`);
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setCurrentTheme((prev) => ({ ...prev, primary: hex, name: "Custom Brand" }));
      applyBrandTheme(hex, "Custom Brand", undefined, currentTheme.fontFamily);
    }
  };

  const handleFontChange = (font: BrandFontOption) => {
    setCurrentTheme((prev) => ({ ...prev, fontFamily: font.fontFamily }));
    applyBrandTheme(currentTheme.primary, currentTheme.name, undefined, font.fontFamily);
    toast.success(`Font changed to ${font.name}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 relative text-muted-foreground hover:text-foreground cursor-pointer"
            title="Customize Brand Theme, Fonts & Colors"
          >
            <Palette className="size-4" />
            <span
              className="absolute bottom-1 right-1 size-2 rounded-full border border-background shadow-xs"
              style={{ backgroundColor: currentTheme.primary }}
            />
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-72 p-2.5 select-none space-y-2">
        <DropdownMenuLabel className="flex items-center justify-between pb-1 px-1">
          <div className="flex items-center gap-1.5">
            <Palette className="size-3.5 text-brand" />
            <span className="text-xs font-bold text-foreground">Brand &amp; Theme Studio</span>
          </div>
          <Badge
            variant="secondary"
            className="text-[9px] font-mono px-1 py-0"
            style={{ color: currentTheme.primary }}
          >
            {currentTheme.name}
          </Badge>
        </DropdownMenuLabel>
        <p className="text-[10px] text-muted-foreground px-1 leading-relaxed">
          Customize colors, fonts, and accents across Billora.
        </p>

        <DropdownMenuSeparator />

        {/* Swatches Grid */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase px-1">Presets</span>
          <div className="grid grid-cols-5 gap-1.5 p-1">
            {BRAND_THEME_PRESETS.map((preset) => {
              const isSelected = currentTheme.primary.toLowerCase() === preset.primary.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  title={`${preset.name} (${preset.description})`}
                  className={`relative flex size-7 items-center justify-center rounded-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-2xs border ${
                    isSelected ? "ring-2 ring-foreground/40 ring-offset-1" : "border-border/60"
                  }`}
                  style={{ backgroundColor: preset.primary }}
                >
                  {isSelected && <Check className="size-3.5 text-white stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Custom Color Input */}
        <div className="p-1 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
            <span>Custom Brand Hex</span>
            <Sparkles className="size-3 text-brand" />
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customHex}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="size-7 rounded-lg border border-border cursor-pointer bg-transparent p-0 shrink-0"
            />
            <Input
              value={customHex}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              placeholder="#10b981"
              maxLength={7}
              className="h-7 text-xs font-mono uppercase bg-background"
            />
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Quick Font Selector */}
        <div className="p-1 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
            <span>Brand Typography</span>
            <Type className="size-3 text-muted-foreground" />
          </label>
          <div className="grid grid-cols-3 gap-1">
            {BRAND_FONTS.slice(0, 3).map((f) => {
              const isSelected = currentTheme.fontFamily?.includes(f.name);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFontChange(f)}
                  className={`py-1 px-1.5 text-[10px] rounded-md border text-center transition-all cursor-pointer ${
                    isSelected ? "border-brand bg-brand-light text-brand font-bold" : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {f.name}
                </button>
              );
            })}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Link to full Brand Studio in settings */}
        <Link
          href="/settings"
          className="flex items-center justify-between p-2 rounded-xl bg-brand-light text-brand hover:opacity-90 transition-opacity text-xs font-bold"
        >
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5" />
            <span>Open Full Brand Studio</span>
          </div>
          <ArrowRight className="size-3.5" />
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
