"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BarcodePrintButton() {
  return (
    <Button
      type="button"
      size="sm"
      onClick={() => window.print()}
      className="gap-1.5 text-xs font-medium print:hidden cursor-pointer"
    >
      <Printer className="size-3.5" />
      <span>Print Sticker Sheet</span>
    </Button>
  );
}
