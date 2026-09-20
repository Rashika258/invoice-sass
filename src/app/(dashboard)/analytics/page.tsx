import { getAnalyticsData } from "@/actions/analytics";
import { getCompanyProfile } from "@/actions/settings";
import { AnalyticsDashboardView } from "@/components/analytics/analytics-dashboard-view";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [analyticsData, profile] = await Promise.all([
    getAnalyticsData("30d"),
    getCompanyProfile(),
  ]);

  const currency = profile?.currency ?? "INR";

  return <AnalyticsDashboardView initialData={analyticsData} currency={currency} />;
}
