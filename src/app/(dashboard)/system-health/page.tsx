import { Metadata } from "next";
import { SystemHealthView } from "@/components/admin/system-health-view";

export const metadata: Metadata = {
  title: "System Health | Billora ERP",
  description: "Real-time infrastructure health, database connection pool status, and invariant verification.",
};

export default function SystemHealthPage() {
  return <SystemHealthView />;
}
