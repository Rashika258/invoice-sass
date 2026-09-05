import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";

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
  | "TRANSACTIONAL_INVOICES"
  | "PAYMENT_REMINDERS"
  | "MARKETING_OFFERS"
  | "BIOMETRIC_ATTENDANCE";

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

const SEED_CONSENT_RECORDS: Omit<DpdpConsentRecord, "id">[] = [
  {
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
];

export async function getDpdpConsentLedger(): Promise<DpdpConsentRecord[]> {
  try {
    const org = await requireOrganization();
    let records = await db.dpdpConsent.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: "desc" },
    });

    if (records.length === 0) {
      // Seed default consents for org
      for (const s of SEED_CONSENT_RECORDS) {
        await db.dpdpConsent.create({
          data: {
            organizationId: org.id,
            entityType: s.entityType,
            entityId: s.entityId,
            entityName: s.entityName,
            contact: s.contact,
            purpose: s.purpose,
            status: s.status,
            grantedAt: new Date(s.grantedAt),
            channel: s.channel,
            noticeVersion: s.noticeVersion,
            notes: s.notes,
          },
        });
      }

      records = await db.dpdpConsent.findMany({
        where: { organizationId: org.id },
        orderBy: { createdAt: "desc" },
      });
    }

    return records.map((r) => ({
      id: r.id,
      entityType: r.entityType as "CUSTOMER" | "EMPLOYEE",
      entityId: r.entityId,
      entityName: r.entityName,
      contact: r.contact,
      purpose: r.purpose as DpdpConsentPurpose,
      status: r.status as "GRANTED" | "WITHDRAWN" | "EXPIRED",
      grantedAt: r.grantedAt.toISOString(),
      channel: r.channel,
      noticeVersion: r.noticeVersion,
      notes: r.notes || undefined,
    }));
  } catch (err) {
    console.error("Error loading DPDP consent records from DB:", err);
    return [];
  }
}

export async function addOrUpdateConsent(
  entry: Omit<DpdpConsentRecord, "id" | "grantedAt"> & { id?: string }
): Promise<DpdpConsentRecord> {
  const org = await requireOrganization();
  if (entry.id) {
    const updated = await db.dpdpConsent.update({
      where: { id: entry.id },
      data: {
        entityType: entry.entityType,
        entityId: entry.entityId,
        entityName: entry.entityName,
        contact: entry.contact,
        purpose: entry.purpose,
        status: entry.status,
        channel: entry.channel,
        noticeVersion: entry.noticeVersion || "v1.2-2026",
        notes: entry.notes,
      },
    });

    return {
      id: updated.id,
      entityType: updated.entityType as "CUSTOMER" | "EMPLOYEE",
      entityId: updated.entityId,
      entityName: updated.entityName,
      contact: updated.contact,
      purpose: updated.purpose as DpdpConsentPurpose,
      status: updated.status as "GRANTED" | "WITHDRAWN" | "EXPIRED",
      grantedAt: updated.grantedAt.toISOString(),
      channel: updated.channel,
      noticeVersion: updated.noticeVersion,
      notes: updated.notes || undefined,
    };
  }

  const created = await db.dpdpConsent.create({
    data: {
      organizationId: org.id,
      entityType: entry.entityType,
      entityId: entry.entityId,
      entityName: entry.entityName,
      contact: entry.contact,
      purpose: entry.purpose,
      status: entry.status,
      grantedAt: new Date(),
      channel: entry.channel,
      noticeVersion: entry.noticeVersion || "v1.2-2026",
      notes: entry.notes,
    },
  });

  return {
    id: created.id,
    entityType: created.entityType as "CUSTOMER" | "EMPLOYEE",
    entityId: created.entityId,
    entityName: created.entityName,
    contact: created.contact,
    purpose: created.purpose as DpdpConsentPurpose,
    status: created.status as "GRANTED" | "WITHDRAWN" | "EXPIRED",
    grantedAt: created.grantedAt.toISOString(),
    channel: created.channel,
    noticeVersion: created.noticeVersion,
    notes: created.notes || undefined,
  };
}

export async function toggleConsentStatus(
  id: string,
  newStatus: "GRANTED" | "WITHDRAWN" | "EXPIRED"
): Promise<boolean> {
  try {
    await db.dpdpConsent.update({
      where: { id },
      data: { status: newStatus },
    });
    return true;
  } catch {
    return false;
  }
}
