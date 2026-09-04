import { getComplianceDashboardData } from "@/actions/compliance";
import { ComplianceView } from "@/components/compliance/compliance-view";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  const data = await getComplianceDashboardData();

  return <ComplianceView initialData={data} />;
}
