"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintStoreBillButton() {
  return (
    <Button
      size="sm"
      onClick={() => window.print()}
      className="h-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs cursor-pointer shadow-xs gap-1.5"
    >
      <Printer className="size-3.5" />
      <span>Print GST Bill</span>
    </Button>
  );
}
