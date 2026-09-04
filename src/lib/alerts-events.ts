export const ALERTS_CHANGE_EVENT = "billora:alerts-change";

export interface AlertsChangeEventDetail {
  action: "dismiss" | "create" | "delete" | "refresh";
  alertId?: string;
  isSystem?: boolean;
}

export function emitAlertsChange(detail: AlertsChangeEventDetail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<AlertsChangeEventDetail>(ALERTS_CHANGE_EVENT, { detail })
    );
  }
}
