import fs from "fs";
import path from "path";

export interface GstThresholdConfig {
  goodsThreshold: number; // ₹40,00,000
  goodsSpecialCategoryThreshold: number; // ₹20,00,000
  servicesThreshold: number; // ₹20,00,000
  servicesSpecialCategoryThreshold: number; // ₹10,00,000
  eInvoicingThreshold: number; // ₹5,00,00,000 (Mandatory B2B)
  compositionSchemeThreshold: number; // ₹1,50,00,000
  eWayBillThreshold: number; // ₹50,000 consignment value
  irpRuleMaxDays: number; // 30 days reporting window
}

export const GST_THRESHOLDS: GstThresholdConfig = {
  goodsThreshold: 4000000,
  goodsSpecialCategoryThreshold: 2000000,
  servicesThreshold: 2000000,
  servicesSpecialCategoryThreshold: 1000000,
  eInvoicingThreshold: 50000000,
  compositionSchemeThreshold: 15000000,
  eWayBillThreshold: 50000,
  irpRuleMaxDays: 30,
};

export type DpdpConsentPurpose =
  | "TRANSACTIONAL_INVOICES" // Invoices & credit notes over WhatsApp/SMS
  | "PAYMENT_REMINDERS" // Digital Khata overdue payment collections
  | "MARKETING_OFFERS" // Promotional catalogs, discounts & broadcasts
  | "BIOMETRIC_ATTENDANCE"; // Fingerprint & Facial geometry processing

export interface DpdpConsentRecord {
  id: string;
  entityType: "CUSTOMER" | "EMPLOYEE";
  entityId: string;
  entityName: string;
  contact: string;
  purpose: DpdpConsentPurpose;
  status: "GRANTED" | "WITHDRAWN" | "EXPIRED";
  grantedAt: string;
  channel: string;
  noticeVersion: string;
  notes?: string;
}

const DPDP_STORE_FILE = path.join(process.cwd(), "prisma", "dpdp_consent.json");

const SEED_CONSENT_RECORDS: DpdpConsentRecord[] = [
  {
    id: "dpdp-001",
    entityType: "CUSTOMER",
    entityId: "cust-1",
    entityName: "Kiran Auto Works",
    contact: "+91 98450 11223",
    purpose: "TRANSACTIONAL_INVOICES",
    status: "GRANTED",
    grantedAt: "2026-08-15T10:30:00.000Z",
    channel: "WhatsApp Opt-in",
    noticeVersion: "v1.2-2026",
    notes: "Customer authorized digital invoice PDF delivery via WhatsApp",
  },
  {
    id: "dpdp-002",
    entityType: "CUSTOMER",
    entityId: "cust-1",
    entityName: "Kiran Auto Works",
    contact: "+91 98450 11223",
    purpose: "PAYMENT_REMINDERS",
    status: "GRANTED",
    grantedAt: "2026-08-15T10:30:00.000Z",
    channel: "WhatsApp Opt-in",
    noticeVersion: "v1.2-2026",
    notes: "Consented to automated UPI payment collection alerts",
  },
  {
    id: "dpdp-003",
    entityType: "CUSTOMER",
    entityId: "cust-2",
    entityName: "Rajesh Hardware & Tools",
    contact: "+91 94480 33445",
    purpose: "TRANSACTIONAL_INVOICES",
    status: "GRANTED",
    grantedAt: "2026-08-20T14:15:00.000Z",
    channel: "In-Store Counter Signature",
    noticeVersion: "v1.2-2026",
    notes: "Counter authorization during GST account setup",
  },
  {
    id: "dpdp-004",
    entityType: "CUSTOMER",
    entityId: "cust-3",
    entityName: "Sri Balaji Fabricators",
    contact: "+91 97310 99887",
    purpose: "MARKETING_OFFERS",
    status: "WITHDRAWN",
    grantedAt: "2026-07-10T11:00:00.000Z",
    channel: "SMS Opt-Out (STOP)",
    noticeVersion: "v1.1-2026",
    notes: "Customer requested removal from seasonal promotional broadcasts",
  },
  {
    id: "dpdp-005",
    entityType: "EMPLOYEE",
    entityId: "emp-1",
    entityName: "Ramesh Kumar (Operator)",
    contact: "+91 98860 12345",
    purpose: "BIOMETRIC_ATTENDANCE",
    status: "GRANTED",
    grantedAt: "2026-08-01T09:00:00.000Z",
    channel: "Employee Onboarding Contract",
    noticeVersion: "v1.2-2026",
    notes: "Explicit consent for Mantra MFS100 fingerprint recognition & time clock",
  },
  {
    id: "dpdp-006",
    entityType: "EMPLOYEE",
    entityId: "emp-2",
    entityName: "Suresh Gowda (Welder)",
    contact: "+91 98440 67890",
    purpose: "BIOMETRIC_ATTENDANCE",
    status: "GRANTED",
    grantedAt: "2026-08-01T09:00:00.000Z",
    channel: "Employee Onboarding Contract",
    noticeVersion: "v1.2-2026",
    notes: "Explicit consent for attendance camera face scanning",
  },
];

export function getDpdpConsentLedger(): DpdpConsentRecord[] {
  try {
    if (fs.existsSync(DPDP_STORE_FILE)) {
      const data = fs.readFileSync(DPDP_STORE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading DPDP consent file:", err);
  }

  // If not exists, write seed and return
  saveDpdpConsentLedger(SEED_CONSENT_RECORDS);
  return SEED_CONSENT_RECORDS;
}

export function saveDpdpConsentLedger(records: DpdpConsentRecord[]): boolean {
  try {
    const dir = path.dirname(DPDP_STORE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DPDP_STORE_FILE, JSON.stringify(records, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing DPDP consent file:", err);
    return false;
  }
}

export function addOrUpdateConsent(entry: Omit<DpdpConsentRecord, "id" | "grantedAt"> & { id?: string }): DpdpConsentRecord {
  const records = getDpdpConsentLedger();
  const existingIdx = records.findIndex((r) => r.id === entry.id);

  if (existingIdx >= 0) {
    const updated: DpdpConsentRecord = {
      ...records[existingIdx],
      ...entry,
      grantedAt: new Date().toISOString(),
    };
    records[existingIdx] = updated;
    saveDpdpConsentLedger(records);
    return updated;
  }

  const newRecord: DpdpConsentRecord = {
    ...entry,
    id: `dpdp-${Date.now()}`,
    grantedAt: new Date().toISOString(),
    noticeVersion: entry.noticeVersion || "v1.2-2026",
  };

  records.unshift(newRecord);
  saveDpdpConsentLedger(records);
  return newRecord;
}

export function toggleConsentStatus(id: string, newStatus: "GRANTED" | "WITHDRAWN" | "EXPIRED"): boolean {
  const records = getDpdpConsentLedger();
  const record = records.find((r) => r.id === id);
  if (!record) return false;
  record.status = newStatus;
  return saveDpdpConsentLedger(records);
}
