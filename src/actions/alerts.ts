"use server";

import { revalidatePath } from "next/cache";
import { requireOrganization } from "@/lib/organization";
import {
  getAlertsStore,
  saveAlertsStore,
  computeLiveAlerts,
  type AlertCategory,
  type AlertPriority,
  type AlertSettings,
  type CustomAlert,
  type LiveAlertItem,
} from "@/lib/alerts-engine";

export async function getLiveAlertsDataAction(): Promise<{
  alerts: LiveAlertItem[];
  settings: AlertSettings;
  customAlerts: CustomAlert[];
  unreadCount: number;
}> {
  const org = await requireOrganization();
  const store = getAlertsStore();
  const alerts = await computeLiveAlerts(org.id);

  return {
    alerts,
    settings: store.settings,
    customAlerts: store.customAlerts,
    unreadCount: alerts.length,
  };
}

export async function createCustomAlertAction(data: {
  title: string;
  description: string;
  category: AlertCategory;
  priority: AlertPriority;
  triggerDate?: string;
  recurrence: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";
  monthlyDay?: number;
  actionHref?: string;
  actionLabel?: string;
  notifyWhatsApp?: boolean;
}) {
  await requireOrganization();
  const store = getAlertsStore();

  const newAlert: CustomAlert = {
    id: `alert-${Date.now()}`,
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    triggerDate: data.triggerDate || new Date().toISOString().slice(0, 10),
    recurrence: data.recurrence,
    monthlyDay: data.monthlyDay,
    actionHref: data.actionHref,
    actionLabel: data.actionLabel,
    isDismissed: false,
    createdAt: new Date().toISOString(),
    notifyWhatsApp: data.notifyWhatsApp ?? true,
  };

  store.customAlerts.unshift(newAlert);
  saveAlertsStore(store);

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/alerts");

  return { success: true, alert: newAlert };
}

export async function dismissAlertAction(id: string, isSystem?: boolean) {
  await requireOrganization();
  const store = getAlertsStore();

  // 1. If it's in custom alerts, mark it dismissed
  const customAlert = store.customAlerts.find((a) => a.id === id);
  if (customAlert) {
    customAlert.isDismissed = true;
  }

  // 2. Also register in dismissedSystemAlertIds if it is a system alert or if id starts with sys-
  if (isSystem || id.startsWith("sys-") || !customAlert) {
    if (!store.dismissedSystemAlertIds.includes(id)) {
      store.dismissedSystemAlertIds.push(id);
    }
  }

  saveAlertsStore(store);
  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/alerts");
  return { success: true };
}

export async function deleteCustomAlertAction(id: string) {
  await requireOrganization();
  const store = getAlertsStore();
  store.customAlerts = store.customAlerts.filter((a) => a.id !== id);
  saveAlertsStore(store);

  revalidatePath("/", "layout");
  revalidatePath("/alerts");
  return { success: true };
}

export async function updateAlertSettingsAction(newSettings: Partial<AlertSettings>) {
  await requireOrganization();
  const store = getAlertsStore();
  store.settings = { ...store.settings, ...newSettings };
  saveAlertsStore(store);

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/alerts");
  return { success: true, settings: store.settings };
}
