"use client";

import { useEffect, useState } from "react";
import { Check, Palette, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  BRAND_THEME_PRESETS,
  applyBrandTheme,
  getStoredBrandTheme,
  type BrandThemePreset,
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
  const [currentTheme, setCurrentTheme] = useState<{ primary: string; name: string }>({
    primary: "#10b981",
    name: "Emerald Green",
  });
  const [customHex, setCustomHex] = useState("#10b981");

  useEffect(() => {
    const stored = getStoredBrandTheme();
    setCurrentTheme(stored);
    setCustomHex(stored.primary);
  }, []);

  const handleSelectPreset = (preset: BrandThemePreset) => {
    setCurrentTheme({ primary: preset.primary, name: preset.name });
    setCustomHex(preset.primary);
    applyBrandTheme(preset.primary, preset.name);
    toast.success(`Theme updated to ${preset.name}`);
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setCurrentTheme({ primary: hex, name: "Custom Brand" });
      applyBrandTheme(hex, "Custom Brand");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 relative text-muted-foreground hover:text-foreground cursor-pointer"
            title="Customize Brand Theme & Colors"
          >
            <Palette className="size-4" />
            <span
              className="absolute bottom-1 right-1 size-2 rounded-full border border-background shadow-xs"
              style={{ backgroundColor: currentTheme.primary }}
            />
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-64 p-2 select-none">
        <DropdownMenuLabel className="flex items-center justify-between pb-1.5 px-1">
          <div className="flex items-center gap-1.5">
            <Palette className="size-3.5 text-brand" />
            <span className="text-xs font-bold text-foreground">Brand Theme</span>
          </div>
          <Badge
            variant="secondary"
            className="text-[9px] font-mono px-1 py-0"
            style={{ color: currentTheme.primary }}
          >
            {currentTheme.name}
          </Badge>
        </DropdownMenuLabel>
        <p className="text-[10px] text-muted-foreground px-1 pb-2 leading-relaxed">
          Customize active highlights, buttons, and accents to match your company branding.
        </p>

        <DropdownMenuSeparator />

        {/* Swatches Grid */}
        <div className="grid grid-cols-7 gap-1.5 p-1">
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

        <DropdownMenuSeparator className="my-1.5" />

        {/* Custom Color Input */}
        <div className="p-1 space-y-1.5">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center justify-between">
            <span>Custom Brand Hex</span>
            <Sparkles className="size-3 text-muted-foreground" />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
