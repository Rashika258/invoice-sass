import { getLiveAlertsDataAction } from "@/actions/alerts";
import { AlertsManagerView } from "@/components/alerts/alerts-manager-view";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const data = await getLiveAlertsDataAction();

  return (
    <AlertsManagerView
      initialAlerts={data.alerts}
      initialSettings={data.settings}
      initialCustomAlerts={data.customAlerts}
    />
  );
}
