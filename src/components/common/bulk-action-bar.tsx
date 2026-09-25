"use client";

import { CheckSquare, Download, MessageCircle, Printer, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onSendReminders?: () => void;
  onExportSelected?: () => void;
  onPrintSelected?: () => void;
  onDeleteSelected?: () => void;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onSendReminders,
  onExportSelected,
  onPrintSelected,
  onDeleteSelected,
}: BulkActionBarProps) {
  if (selectedCount <= 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-foreground text-background shadow-2xl border border-border/20 animate-in fade-in slide-in-from-bottom-4 duration-200 select-none">
      <div className="flex items-center gap-2 text-xs font-bold border-r border-background/20 pr-3">
        <CheckSquare className="size-4 text-emerald-400" />
        <span>{selectedCount} Selected</span>
      </div>

      <div className="flex items-center gap-2">
        {onSendReminders && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onSendReminders}
            className="h-8 text-xs font-semibold hover:bg-background/10 text-emerald-400"
          >
            <MessageCircle className="size-3.5 mr-1" />
            <span>Send Reminders</span>
          </Button>
        )}

        {onExportSelected && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onExportSelected}
            className="h-8 text-xs font-semibold hover:bg-background/10 text-blue-400"
          >
            <Download className="size-3.5 mr-1" />
            <span>Export CSV</span>
          </Button>
        )}

        {onPrintSelected && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onPrintSelected}
            className="h-8 text-xs font-semibold hover:bg-background/10 text-slate-200"
          >
            <Printer className="size-3.5 mr-1" />
            <span>Print Batch</span>
          </Button>
        )}

        {onDeleteSelected && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDeleteSelected}
            className="h-8 text-xs font-semibold hover:bg-background/10 text-rose-400"
          >
            <Trash2 className="size-3.5 mr-1" />
            <span>Delete</span>
          </Button>
        )}
      </div>

      <button
        type="button"
        onClick={onClearSelection}
        className="p-1 rounded-full hover:bg-background/20 text-background/70 hover:text-background transition-colors ml-1 cursor-pointer"
        title="Deselect All"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
