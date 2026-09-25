import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase().trim();

  let styles = "bg-secondary text-secondary-foreground border-secondary";
  let label = status;

  switch (normalized) {
    case "PAID":
    case "COMPLETED":
    case "ACTIVE":
    case "SUCCESS":
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
      label = "Paid";
      break;
    case "SENT":
    case "PENDING":
    case "PARTIAL":
      styles = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
      label = "Sent";
      break;
    case "DRAFT":
      styles = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
      label = "Draft";
      break;
    case "OVERDUE":
    case "FAILED":
      styles = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800";
      label = "Overdue";
      break;
    case "CANCELLED":
    case "VOID":
      styles = "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
      label = "Cancelled";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        styles,
        className
      )}
    >
      {label}
    </span>
  );
}
