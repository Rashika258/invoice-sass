"use client";

import { useEffect, useState } from "react";
import { Clock, ShieldCheck, User, PlusCircle, CheckCircle2, AlertCircle, Edit3 } from "lucide-react";
import { getEntityActivities, type ActivityEvent } from "@/lib/activity-timeline";
import { Badge } from "@/components/ui/badge";

interface ActivityTimelineViewProps {
  entityType: ActivityEvent["entityType"];
  entityId: string;
}

export function ActivityTimelineView({ entityType, entityId }: ActivityTimelineViewProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const events = getEntityActivities(entityType, entityId);
    setActivities(events);
  }, [entityType, entityId]);

  const getEventIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATED":
        return <PlusCircle className="size-4 text-emerald-500" />;
      case "VERIFIED":
        return <ShieldCheck className="size-4 text-blue-500" />;
      case "UPDATED":
      case "EDITED":
        return <Edit3 className="size-4 text-amber-500" />;
      case "PAID":
      case "SETTLED":
        return <CheckCircle2 className="size-4 text-emerald-600" />;
      default:
        return <Clock className="size-4 text-brand" />;
    }
  };

  return (
    <div className="space-y-4 py-2 select-none">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Clock className="size-4 text-brand" />
          <span>Activity Audit History &amp; Timeline</span>
        </h4>
        <Badge variant="outline" className="text-[10px] font-mono">
          {activities.length} Events Logged
        </Badge>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {activities.map((act) => (
          <div key={act.id} className="relative flex items-start gap-3 text-xs">
            {/* Timeline Dot */}
            <div className="absolute -left-6 top-0.5 flex size-5 items-center justify-center rounded-full bg-card border border-border shadow-2xs">
              {getEventIcon(act.action)}
            </div>

            <div className="flex-1 space-y-1 bg-muted/30 p-3 rounded-xl border border-border/60">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-foreground">{act.description}</span>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                  {new Date(act.timestamp).toLocaleString("en-IN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold">
                  <User className="size-3 text-muted-foreground" />
                  {act.actorName || "System"} ({act.actorRole || "SYSTEM"})
                </span>
                <span>•</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  Action: {act.action}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
