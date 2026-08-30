import type { InvoiceStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";

const statusStyles: Record<InvoiceStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SENT: "bg-blue-100 text-blue-700",
  PAID: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-zinc-100 text-zinc-600",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant="secondary" className={statusStyles[status]}>
      {status}
    </Badge>
  );
}
