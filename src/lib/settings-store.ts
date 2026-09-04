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

  // Attendance & Biometrics
  attendanceMode: "HYBRID" | "FACE_SCAN" | "FINGERPRINT" | "MANUAL";
  fingerprintProvider: "MANTRA_RD_SERVICE" | "WEBAUTHN";
  enableFaceCaptureSnapshot: boolean;
  standardShiftHours: number; // default 8
  overtimeMultiplier: number; // default 1.5

  // Print & Invoicing Format
  printTemplate: "MODERN" | "CLASSIC" | "GST_TAX" | "THERMAL";
  printerType: "A4" | "A5" | "THERMAL_3INCH" | "THERMAL_2INCH";
  showCompanyLogo: boolean;
  printUpiQrOnBill: boolean;
  showBankDetails: boolean;
  showTermsConditions: boolean;
  showAuthorizedSignature: boolean;
  showPreviousBalance: boolean;
  invoiceTermsText: string;

  // Transaction Prefixes & Terms
  invoicePrefix: string;
  estimatePrefix: string;
  challanPrefix: string;
  paymentPrefix: string;
  defaultCreditDays: number;
  enableRoundOff: boolean;
  enableItemDiscount: boolean;

  // Taxes & GST
  gstRegistrationType: "REGULAR" | "COMPOSITION";
  defaultGstRate: number;
  defaultHsnCode: string;
  enableRcm: boolean;
  ewayBillThreshold: number;

  // WhatsApp & SMS Messaging
  autoSendWhatsAppInvoice: boolean;
  whatsAppReminderTemplate: string;

  // Party & Customer Rules
  enableCreditLimit: boolean;
  blockBillingOnCreditExceeded: boolean;
  enableLoyaltyPoints: boolean;

  // Items & Inventory Controls
  enableBarcodeScanner: boolean;
  enableBatchTracking: boolean;
  enableSerialNumberTracking: boolean;
  lowStockBufferQty: number;

  // Accounting & Financial Year
  currentFinancialYear: string;
  autoJournalEntries: boolean;
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

  attendanceMode: "HYBRID",
  fingerprintProvider: "MANTRA_RD_SERVICE",
  enableFaceCaptureSnapshot: true,
  standardShiftHours: 8,
  overtimeMultiplier: 1.5,

  // Print defaults
  printTemplate: "MODERN",
  printerType: "A4",
  showCompanyLogo: true,
  printUpiQrOnBill: true,
  showBankDetails: true,
  showTermsConditions: true,
  showAuthorizedSignature: true,
  showPreviousBalance: true,
  invoiceTermsText: "1. Goods once sold will not be taken back.\n2. Interest @18% p.a. will be charged for delayed payment.\n3. Subject to local jurisdiction.",

  // Transaction defaults
  invoicePrefix: "INV-",
  estimatePrefix: "EST-",
  challanPrefix: "DC-",
  paymentPrefix: "REC-",
  defaultCreditDays: 30,
  enableRoundOff: true,
  enableItemDiscount: true,

  // Taxes defaults
  gstRegistrationType: "REGULAR",
  defaultGstRate: 18,
  defaultHsnCode: "8483",
  enableRcm: false,
  ewayBillThreshold: 50000,

  // Messages defaults
  autoSendWhatsAppInvoice: true,
  whatsAppReminderTemplate: "Dear {CustomerName}, your invoice {InvoiceNo} of ₹{Amount} from Sri Manjunatha Engineering Works is ready. Pay instantly via UPI: {UpiLink}",

  // Party defaults
  enableCreditLimit: true,
  blockBillingOnCreditExceeded: false,
  enableLoyaltyPoints: false,

  // Item defaults
  enableBarcodeScanner: true,
  enableBatchTracking: true,
  enableSerialNumberTracking: true,
  lowStockBufferQty: 10,

  // Accounting defaults
  currentFinancialYear: "2026-2027",
  autoJournalEntries: true,
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
