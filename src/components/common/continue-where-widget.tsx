"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, History, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getWorkspacePreferences } from "@/lib/workspace-preferences";

interface ShortcutItem {
  href: string;
  label: string;
  subtext?: string;
  category?: string;
}

export function ContinueWhereWidget() {
  const [items, setItems] = useState<ShortcutItem[]>([]);

  useEffect(() => {
    const pref = getWorkspacePreferences("continueWhere") as ShortcutItem[];
    if (pref && Array.isArray(pref) && pref.length > 0) {
      setItems(pref);
    } else {
      // Smart default workspace shortcuts
      setItems([
        {
          href: "/invoices/new",
          label: "New Sale Invoice",
          subtext: "Draft invoice #INV-2026-004",
          category: "Sales",
        },
        {
          href: "/work-queue",
          label: "Pre-Posting Review",
          subtext: "3 items awaiting batch verification",
          category: "Audits",
        },
        {
          href: "/grow/online-store",
          label: "Online Store Manager",
          subtext: "Zenith E-Store catalogue",
          category: "E-Store",
        },
      ]);
    }
  }, []);

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Clock className="size-4" />
          </div>
          <h3 className="text-xs font-bold text-foreground tracking-tight">
            Continue Where You Left Off
          </h3>
        </div>
        <Badge variant="secondary" className="text-[10px] font-mono">
          RECENT WORKSPACE
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((it, idx) => (
          <Link key={idx} href={it.href} className="block group">
            <div className="p-3 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/50 hover:border-emerald-500/40 transition-all space-y-1.5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {it.category || "Shortcut"}
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="text-xs font-bold text-foreground mt-0.5">
                  {it.label}
                </h4>
                {it.subtext && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {it.subtext}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
