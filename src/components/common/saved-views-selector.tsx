"use client";

import { useEffect, useState } from "react";
import { Bookmark, Filter, Plus } from "lucide-react";
import { getSavedViews, saveViewPreset, type SavedViewPreset } from "@/lib/saved-views";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface SavedViewsSelectorProps {
  module: SavedViewPreset["module"];
  activePresetId?: string;
  onSelectPreset: (preset: SavedViewPreset) => void;
  currentFilters?: Record<string, any>;
}

export function SavedViewsSelector({
  module,
  activePresetId,
  onSelectPreset,
  currentFilters = {},
}: SavedViewsSelectorProps) {
  const [presets, setPresets] = useState<SavedViewPreset[]>([]);

  useEffect(() => {
    setPresets(getSavedViews(module));
  }, [module]);

  const handleSaveCurrentView = () => {
    const name = prompt("Enter a name for this saved filter view:");
    if (!name?.trim()) return;

    const created = saveViewPreset(name.trim(), module, currentFilters);
    setPresets(getSavedViews(module));
    onSelectPreset(created);
    toast.success(`Saved view "${created.name}" created!`);
  };

  const activePreset = presets.find((p) => p.id === activePresetId) || presets[0];

  return (
    <div className="flex items-center gap-2 select-none">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5 border-border">
              <Bookmark className="size-3.5 text-brand" />
              <span>View: {activePreset?.name || "All Records"}</span>
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-56 text-xs">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
            Saved View Presets
          </DropdownMenuLabel>
          {presets.map((p) => (
            <DropdownMenuItem
              key={p.id}
              onClick={() => onSelectPreset(p)}
              className="flex items-center justify-between text-xs font-medium cursor-pointer"
            >
              <span>{p.name}</span>
              {p.isDefault && (
                <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1 rounded">DEFAULT</span>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSaveCurrentView} className="text-xs font-bold text-brand cursor-pointer">
            <Plus className="size-3.5 mr-1" />
            <span>Save Current Filters as Preset</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
