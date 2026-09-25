"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface ExplainableAccordionProps {
  title: string;
  /** Content can be any React node, e.g., breakdown list */
  content: React.ReactNode;
}

export function ExplainableAccordion({ title, content }: ExplainableAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full rounded-xl border border-border/70 bg-card/60 overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/40 transition-colors text-left font-medium text-foreground cursor-pointer"
      >
        <span className="flex items-center gap-1.5 font-semibold text-xs">
          <HelpCircle className="size-3.5 text-emerald-500" />
          {title}
        </span>
        <ChevronDown
          className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-3.5 py-3 border-t border-border/50 bg-muted/20 text-muted-foreground animate-in fade-in-50 duration-150">
          {content}
        </div>
      )}
    </div>
  );
}
