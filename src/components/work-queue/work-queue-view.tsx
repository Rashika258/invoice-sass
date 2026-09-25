"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, DollarSign, Filter, Inbox, Layers, Package, ShieldAlert } from "lucide-react";
import { getWorkQueueItems, type WorkQueueItem } from "@/lib/work-queue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export function WorkQueueView() {
  const [items, setItems] = useState<WorkQueueItem[]>(getWorkQueueItems());
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const handleResolveItem = (id: string, label: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success(`Resolved action item: ${label}`);
  };

  const filteredItems = activeTab === "ALL" ? items : items.filter((i) => i.category === activeTab);

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Inbox className="size-6 text-brand" />
            <span>Central Business Work Queue</span>
            <Badge className="bg-brand text-white font-mono text-[10px] font-bold">
              {items.length} ACTION ITEMS
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Single actionable queue aggregating overdues, low-stock reorders, unapproved expenses &amp; data quality fixes
          </p>
        </div>
      </div>

      {/* Categories Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="ALL" className="text-xs font-semibold gap-1.5">
            <span>All Issues ({items.length})</span>
          </TabsTrigger>
          <TabsTrigger value="COLLECTIONS" className="text-xs font-semibold gap-1.5">
            <span>Collections ({items.filter((i) => i.category === "COLLECTIONS").length})</span>
          </TabsTrigger>
          <TabsTrigger value="INVENTORY" className="text-xs font-semibold gap-1.5">
            <span>Inventory ({items.filter((i) => i.category === "INVENTORY").length})</span>
          </TabsTrigger>
          <TabsTrigger value="DATA_QUALITY" className="text-xs font-semibold gap-1.5">
            <span>Data Quality ({items.filter((i) => i.category === "DATA_QUALITY").length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3">
          {filteredItems.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
              <h3 className="text-sm font-bold text-foreground">Work Queue Clear!</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No pending operational issues or overdues in this category. All systems normal.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border shadow-2xs transition-all space-y-3 ${
                    item.severity === "CRITICAL"
                      ? "border-rose-500/30 bg-rose-500/[0.02]"
                      : item.severity === "HIGH"
                      ? "border-amber-500/30 bg-amber-500/[0.02]"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{item.problem}</span>
                        <Badge
                          className={`text-[9px] font-mono font-bold ${
                            item.severity === "CRITICAL"
                              ? "bg-rose-600 text-white"
                              : item.severity === "HIGH"
                              ? "bg-amber-500/20 text-amber-600 border border-amber-500/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                        <strong>Impact:</strong> {item.impact}
                      </p>
                    </div>

                    {item.amount && (
                      <div className="font-mono text-base font-black text-foreground shrink-0">
                        ₹ {item.amount.toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>

                  {/* Recommendation & Resolution */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/60">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <ArrowRight className="size-3.5 text-brand shrink-0" />
                      <span>{item.recommendedAction}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={item.resolveHref}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white font-bold text-xs shadow-2xs hover:opacity-90 transition-all"
                      >
                        <span>{item.resolveLabel}</span>
                        <ArrowRight className="size-3" />
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResolveItem(item.id, item.resolveLabel)}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
