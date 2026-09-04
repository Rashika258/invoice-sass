import fs from "fs";
import path from "path";
import { db } from "@/lib/db";

export type AlertCategory =
  | "PAYDAY"
  | "STOCK"
  | "PAYMENT"
  | "GST_TAX"
  | "CUSTOM";

export type AlertPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface CustomAlert {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  priority: AlertPriority;
  triggerDate: string; // ISO or YYYY-MM-DD
  recurrence: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";
  monthlyDay?: number; // 1 to 31
  actionHref?: string;
  actionLabel?: string;
  isDismissed: boolean;
  createdAt: string;
  notifyWhatsApp?: boolean;
}

export interface AlertSettings {
  enablePayDayAlert: boolean;
  payDayOfMonth: number; // e.g. 1st or 5th
  enableLowStockAlert: boolean;
  enableOverduePaymentAlert: boolean;
  enableGstDeadlineAlert: boolean;
  enableIrpRuleAlert: boolean;
}

export interface LiveAlertItem {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  priority: AlertPriority;
  actionHref?: string;
  actionLabel?: string;
  isSystem: boolean;
  createdAt: string;
  dueInfo?: string;
}

const ALERTS_STORE_FILE = path.join(process.cwd(), "prisma", "custom_alerts.json");

const DEFAULT_SETTINGS: AlertSettings = {
  enablePayDayAlert: true,
  payDayOfMonth: 1, // 1st of every month is standard salary day
  enableLowStockAlert: true,
  enableOverduePaymentAlert: true,
  enableGstDeadlineAlert: true,
  enableIrpRuleAlert: true,
};

const SEED_CUSTOM_ALERTS: CustomAlert[] = [
  {
    id: "alert-1",
    title: "Order Raw Steel Plates & Channels",
    description: "Review factory fabrication sheet stock and place bulk procurement order with Jindal Steel distributor.",
    category: "STOCK",
    priority: "HIGH",
    triggerDate: new Date().toISOString().slice(0, 10),
    recurrence: "MONTHLY",
    monthlyDay: 5,
    actionHref: "/items",
    actionLabel: "View Raw Materials",
    isDismissed: false,
    createdAt: new Date().toISOString(),
    notifyWhatsApp: true,
  },
  {
    id: "alert-2",
    title: "Factory Electricity & Compressor Utility Bill",
    description: "Pay BESCOM high-tension electricity bill to avoid surcharge or power cut.",
    category: "CUSTOM",
    priority: "HIGH",
    triggerDate: new Date().toISOString().slice(0, 10),
    recurrence: "MONTHLY",
    monthlyDay: 15,
    actionHref: "/expenses",
    actionLabel: "Record Utility Expense",
    isDismissed: false,
    createdAt: new Date().toISOString(),
    notifyWhatsApp: true,
  },
];

interface AlertsStoreData {
  settings: AlertSettings;
  customAlerts: CustomAlert[];
  dismissedSystemAlertIds: string[];
}

export function getAlertsStore(): AlertsStoreData {
  try {
    if (fs.existsSync(ALERTS_STORE_FILE)) {
      const data = fs.readFileSync(ALERTS_STORE_FILE, "utf-8");
      const parsed = JSON.parse(data);
      return {
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        customAlerts: parsed.customAlerts || [],
        dismissedSystemAlertIds: parsed.dismissedSystemAlertIds || [],
      };
    }
  } catch (err) {
    console.error("Error reading custom_alerts.json:", err);
  }

  const initial: AlertsStoreData = {
    settings: DEFAULT_SETTINGS,
    customAlerts: SEED_CUSTOM_ALERTS,
    dismissedSystemAlertIds: [],
  };
  saveAlertsStore(initial);
  return initial;
}

export function saveAlertsStore(data: AlertsStoreData): boolean {
  try {
    const dir = path.dirname(ALERTS_STORE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ALERTS_STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing custom_alerts.json:", err);
    return false;
  }
}

export async function computeLiveAlerts(organizationId: string): Promise<LiveAlertItem[]> {
  const store = getAlertsStore();
  const { settings, customAlerts, dismissedSystemAlertIds } = store;
  const results: LiveAlertItem[] = [];
  const today = new Date();
  const currentDay = today.getDate();

  // 1. General Reminder: Staff Pay Day / Payroll Alert
  if (settings.enablePayDayAlert) {
    const payDay = settings.payDayOfMonth || 1;
    const diffDays = payDay - currentDay;
    const payDayAlertId = `sys-payday-${today.getFullYear()}-${today.getMonth() + 1}`;

    if (!dismissedSystemAlertIds.includes(payDayAlertId)) {
      if (diffDays === 0) {
        results.push({
          id: payDayAlertId,
          title: "💰 Staff Pay Day is Today!",
          description: `Today is the scheduled salary distribution day (${payDay}st of the month). Review shift hours, overtime and generate payslips.`,
          category: "PAYDAY",
          priority: "CRITICAL",
          actionHref: "/attendance",
          actionLabel: "Generate Monthly Payslips",
          isSystem: true,
          createdAt: today.toISOString(),
          dueInfo: "Due Today",
        });
      } else if (diffDays > 0 && diffDays <= 3) {
        results.push({
          id: payDayAlertId,
          title: `⚡ Pay Day Approaching in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
          description: `Staff salary distribution is scheduled on the ${payDay}st. Ensure biometric punch cards and overtime are verified.`,
          category: "PAYDAY",
          priority: "HIGH",
          actionHref: "/attendance",
          actionLabel: "Review Shift Attendance",
          isSystem: true,
          createdAt: today.toISOString(),
          dueInfo: `In ${diffDays} days`,
        });
      }
    }
  }

  // 2. Low Stock Buffer Alert
  if (settings.enableLowStockAlert) {
    const lowStockItems = await db.item.findMany({
      where: {
        organizationId,
        stockQty: { lte: 10 },
      },
      take: 5,
    });

    const stockAlertId = `sys-stock-${today.toISOString().slice(0, 10)}`;
    if (lowStockItems.length > 0 && !dismissedSystemAlertIds.includes(stockAlertId)) {
      const itemNames = lowStockItems.map((i) => i.name).slice(0, 3).join(", ");
      results.push({
        id: stockAlertId,
        title: `⚠️ ${lowStockItems.length} Products Running Low on Stock`,
        description: `Items including ${itemNames} are below safe warehouse buffer levels. Create a purchase order to restock.`,
        category: "STOCK",
        priority: "HIGH",
        actionHref: "/items",
        actionLabel: "Restock Inventory",
        isSystem: true,
        createdAt: today.toISOString(),
        dueInfo: "Immediate Action",
      });
    }
  }

  // 3. Customer Overdue Payment Alert
  if (settings.enableOverduePaymentAlert) {
    const overdueInvoices = await db.invoice.findMany({
      where: {
        organizationId,
        documentType: "SALE",
        status: { in: ["OVERDUE", "SENT"] },
        dueDate: { lt: today },
      },
      include: { customer: true },
      take: 5,
    });

    const overdueAlertId = `sys-overdue-${today.toISOString().slice(0, 10)}`;
    if (overdueInvoices.length > 0 && !dismissedSystemAlertIds.includes(overdueAlertId)) {
      const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);
      results.push({
        id: overdueAlertId,
        title: `⏳ ${overdueInvoices.length} Overdue Customer Bills (₹${totalOverdue.toFixed(0)})`,
        description: `Payments from ${overdueInvoices.length} parties have crossed payment due terms. Send 1-click WhatsApp payment reminders with UPI QR.`,
        category: "PAYMENT",
        priority: "HIGH",
        actionHref: "/customers",
        actionLabel: "Collect via Khata",
        isSystem: true,
        createdAt: today.toISOString(),
        dueInfo: `₹${totalOverdue.toFixed(0)} overdue`,
      });
    }
  }

  // 4. GST Return Deadlines (GSTR-1 on 11th, GSTR-3B on 20th)
  if (settings.enableGstDeadlineAlert) {
    if (currentDay >= 7 && currentDay <= 11) {
      const gstr1AlertId = `sys-gst-1-${today.getFullYear()}-${today.getMonth() + 1}`;
      if (!dismissedSystemAlertIds.includes(gstr1AlertId)) {
        results.push({
          id: gstr1AlertId,
          title: "🏛️ GSTR-1 Return Deadline on 11th",
          description: "Monthly outward supply return (GSTR-1) is due on the 11th. Export B2B invoices and HSN summaries for your CA.",
          category: "GST_TAX",
          priority: currentDay === 11 ? "CRITICAL" : "HIGH",
          actionHref: "/ca-portal",
          actionLabel: "Export GSTR-1 for CA",
          isSystem: true,
          createdAt: today.toISOString(),
          dueInfo: currentDay === 11 ? "Due Today" : `Due in ${11 - currentDay} days`,
        });
      }
    } else if (currentDay >= 15 && currentDay <= 20) {
      const gstr3bAlertId = `sys-gst-3b-${today.getFullYear()}-${today.getMonth() + 1}`;
      if (!dismissedSystemAlertIds.includes(gstr3bAlertId)) {
        results.push({
          id: gstr3bAlertId,
          title: "🏛️ GSTR-3B Monthly Tax Due on 20th",
          description: "Summary GST return and tax payout (GSTR-3B) deadline is the 20th. Reconcile input tax credit (ITC).",
          category: "GST_TAX",
          priority: currentDay === 20 ? "CRITICAL" : "HIGH",
          actionHref: "/ca-portal",
          actionLabel: "View GSTR-3B Summary",
          isSystem: true,
          createdAt: today.toISOString(),
          dueInfo: currentDay === 20 ? "Due Today" : `Due in ${20 - currentDay} days`,
        });
      }
    }
  }

  // 5. Active Custom Alerts Created by the User
  for (const cAlert of customAlerts) {
    if (cAlert.isDismissed) continue;

    let shouldTrigger = true;
    let dueInfo = "Active Reminder";

    if (cAlert.recurrence === "MONTHLY" && cAlert.monthlyDay) {
      const diff = cAlert.monthlyDay - currentDay;
      if (diff === 0) {
        dueInfo = "Due Today";
      } else if (diff > 0 && diff <= 3) {
        dueInfo = `In ${diff} days`;
      } else {
        dueInfo = `Every ${cAlert.monthlyDay}th`;
      }
    }

    if (shouldTrigger) {
      results.push({
        id: cAlert.id,
        title: cAlert.title,
        description: cAlert.description,
        category: cAlert.category,
        priority: cAlert.priority,
        actionHref: cAlert.actionHref,
        actionLabel: cAlert.actionLabel,
        isSystem: false,
        createdAt: cAlert.createdAt,
        dueInfo,
      });
    }
  }

  return results;
}
