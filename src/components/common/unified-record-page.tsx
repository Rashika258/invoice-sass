"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, FileText, Layers, MessageSquare, ShieldCheck, Share2, Printer, Edit3, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecordHealthBadge } from "@/components/common/record-health-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityTimelineView } from "@/components/common/activity-timeline-view";
import type { ActivityEvent } from "@/lib/activity-timeline";

export interface SummaryCardItem {
  label: string;
  value: string | number;
  highlight?: "emerald" | "amber" | "rose" | "brand";
  subtext?: string;
}

export interface UnifiedRecordPageProps {
  title: string;
  subtitle?: string;
  entityType: ActivityEvent["entityType"];
  entityId: string;
  statusPill?: {
    label: string;
    variant: "success" | "warning" | "danger" | "neutral";
  };
  backHref: string;
  summaryCards: SummaryCardItem[];
  overviewContent: React.ReactNode;
  relatedContent?: React.ReactNode;
  notesContent?: React.ReactNode;
  onEdit?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  extraActions?: React.ReactNode;
}

export function UnifiedRecordPage({
  title,
  subtitle,
  entityType,
  entityId,
  statusPill,
  backHref,
  summaryCards,
  overviewContent,
  relatedContent,
  notesContent,
  onEdit,
  onPrint,
  onShare,
  extraActions,
}: UnifiedRecordPageProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const getBadgeClass = (variant?: string) => {
    switch (variant) {
      case "success":
        return "bg-emerald-600 text-white font-mono";
      case "warning":
        return "bg-amber-500/10 text-amber-600 border border-amber-500/20 font-mono";
      case "danger":
        return "bg-rose-500/10 text-rose-600 border border-rose-500/20 font-mono";
      default:
        return "bg-muted text-muted-foreground font-mono";
    }
  };

  return (
    <div className="space-y-6 pb-20 select-none print:p-0 print:m-0 print:pb-0 print:space-y-0">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-2xs"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">{title}</h1>
              {statusPill && (
                <Badge className={`${getBadgeClass(statusPill.variant)} text-[10px] font-bold`}>
                  {statusPill.label}
                </Badge>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex items-center gap-2 flex-wrap">
          {onEdit && (
            <Button size="sm" variant="outline" onClick={onEdit} className="h-8 text-xs font-semibold gap-1.5">
              <Edit3 className="size-3.5 text-brand" />
              <span>Edit</span>
            </Button>
          )}

          {onPrint && (
            <Button size="sm" variant="outline" onClick={onPrint} className="h-8 text-xs font-semibold gap-1.5">
              <Printer className="size-3.5 text-slate-700 dark:text-slate-300" />
              <span>Print / PDF</span>
            </Button>
          )}

          {onShare && (
            <Button size="sm" variant="outline" onClick={onShare} className="h-8 text-xs font-semibold gap-1.5">
              <Share2 className="size-3.5 text-emerald-600" />
              <span>Share</span>
            </Button>
          )}

          {extraActions}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        {summaryCards.map((card, idx) => (
          <Card key={idx} className="shadow-2xs border border-border/70">
            <CardContent className="p-3.5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {card.label}
              </div>
              <div
                className={`text-lg sm:text-xl font-black font-mono ${
                  card.highlight === "emerald"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : card.highlight === "amber"
                    ? "text-amber-600 dark:text-amber-400"
                    : card.highlight === "rose"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-foreground"
                }`}
              >
                {card.value}
              </div>
              {card.subtext && <div className="text-[10px] text-muted-foreground truncate">{card.subtext}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs (Overview, Activity, Related, Notes) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 print:space-y-0">
        <TabsList className="bg-muted/60 p-1 print:hidden">
          <TabsTrigger value="overview" className="text-xs font-semibold gap-1.5">
            <FileText className="size-3.5" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs font-semibold gap-1.5">
            <Clock className="size-3.5" />
            <span>Activity Timeline</span>
          </TabsTrigger>
          {relatedContent && (
            <TabsTrigger value="related" className="text-xs font-semibold gap-1.5">
              <Layers className="size-3.5" />
              <span>Related Records</span>
            </TabsTrigger>
          )}
          {notesContent && (
            <TabsTrigger value="notes" className="text-xs font-semibold gap-1.5">
              <MessageSquare className="size-3.5" />
              <span>Notes &amp; History</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {overviewContent}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="p-4 shadow-2xs">
            <ActivityTimelineView entityType={entityType} entityId={entityId} />
          </Card>
        </TabsContent>

        {relatedContent && (
          <TabsContent value="related" className="space-y-4">
            {relatedContent}
          </TabsContent>
        )}

        {notesContent && (
          <TabsContent value="notes" className="space-y-4">
            {notesContent}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
