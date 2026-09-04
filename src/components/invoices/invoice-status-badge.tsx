import type { InvoiceStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  InvoiceStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  DRAFT: {
    label: "Draft",
    badgeClass: "border-border/70 bg-muted/60 text-muted-foreground",
    dotClass: "bg-muted-foreground/50",
  },
  SENT: {
    label: "Sent",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    dotClass: "bg-blue-500",
  },
  PAID: {
    label: "Paid",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    dotClass: "bg-emerald-500",
  },
  OVERDUE: {
    label: "Overdue",
    badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
    dotClass: "bg-rose-500",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
    dotClass: "bg-zinc-400",
  },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = statusConfig[status] || statusConfig.DRAFT;
  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium border ${config.badgeClass}`}
    >
      <span className={`size-1.5 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </Badge>
  );
}
