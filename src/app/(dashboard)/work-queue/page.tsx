import { Metadata } from "next";
import { WorkQueueView } from "@/components/work-queue/work-queue-view";

export const metadata: Metadata = {
  title: "Work Queue | Billora ERP",
  description: "Centralized action queue for overdue invoices, inventory reorders, and data quality issues.",
};

export default function WorkQueuePage() {
  return <WorkQueueView />;
}
