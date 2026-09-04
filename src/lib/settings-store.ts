import fs from "fs";
import path from "path";

export interface AppSettings {
  // Online Store Configuration
  storeInventoryMode: "SEPARATE" | "SHARED"; // "SEPARATE": isolated DB & stock, "SHARED": linked with GST main inventory
  storeInvoicePrefix: string; // e.g. "OS" or "WEB"
  autoDeductStoreStock: boolean;
  storeNotificationPhone: string;
  storeDeliveryCharges: number;
  minStoreOrderValue: number;

  // Application & General Settings (matching media_1788527610985.png)
  enablePasscode: boolean;
  businessCurrency: string;
  decimalPlaces: number;
  gstinEnabled: boolean;
  stopSaleOnNegativeStock: boolean;
  blockNewItemsFromTxn: boolean;
  blockNewPartiesFromTxn: boolean;

  // More Transactions Toggles
  enableEstimate: boolean;
  enableProforma: boolean;
  enableOrder: boolean;
  enableDeliveryChallan: boolean;
  enableGoodsReturnOnChallan: boolean;

  // Godowns & Multi-Firm
  enableGodownManagement: boolean;
  multiFirmEnabled: boolean;

  // Backup & View Customization
  autoBackup: boolean;
  lastBackupDate: string;
  auditTrail: boolean;
  screenZoom: number; // 70 to 130
}

const DEFAULT_SETTINGS: AppSettings = {
  storeInventoryMode: "SEPARATE",
  storeInvoicePrefix: "OS",
  autoDeductStoreStock: true,
  storeNotificationPhone: "9483374137",
  storeDeliveryCharges: 0,
  minStoreOrderValue: 0,

  enablePasscode: false,
  businessCurrency: "INR",
  decimalPlaces: 2,
  gstinEnabled: true,
  stopSaleOnNegativeStock: false,
  blockNewItemsFromTxn: false,
  blockNewPartiesFromTxn: false,

  enableEstimate: true,
  enableProforma: true,
  enableOrder: true,
  enableDeliveryChallan: true,
  enableGoodsReturnOnChallan: true,

  enableGodownManagement: false,
  multiFirmEnabled: false,

  autoBackup: true,
  lastBackupDate: "04/09/2026 | 07:09 AM",
  auditTrail: true,
  screenZoom: 100,
};

const SETTINGS_FILE = path.join(process.cwd(), "prisma", "app_settings.json");

export function getAppSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error("Error reading app settings:", err);
  }
  return DEFAULT_SETTINGS;
}

export function saveAppSettings(newSettings: Partial<AppSettings>): AppSettings {
  try {
    const current = getAppSettings();
    const updated = { ...current, ...newSettings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (err) {
    console.error("Error saving app settings:", err);
    return DEFAULT_SETTINGS;
  }
}
