import { Metadata } from "next";
import { AuditLogsView } from "@/components/audit/audit-logs-view";

export const metadata: Metadata = {
  title: "Audit Logs | Billora ERP",
  description: "Organization-wide immutable audit log trail of system changes and user operations.",
};

export default function AuditLogsPage() {
  return <AuditLogsView />;
}
