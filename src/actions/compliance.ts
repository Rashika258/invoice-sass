"use server";

import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import {
  GST_THRESHOLDS,
  getDpdpConsentLedger,
  addOrUpdateConsent,
  toggleConsentStatus,
  type DpdpConsentRecord,
  type DpdpConsentPurpose,
} from "@/lib/compliance-engine";

export interface ComplianceSummary {
  turnover: number;
  financialYear: string;
  isGstRegistered: boolean;
  companyGstin?: string | null;
  state?: string | null;
  
  // Progress percentages
  goodsProgress: number;
  servicesProgress: number;
  eInvoicingProgress: number;
  compositionProgress: number;

  // Threshold flags
  goodsExceeded: boolean;
  servicesExceeded: boolean;
  eInvoicingMandatory: boolean;
  compositionExceeded: boolean;

  // E-way bill requirement stats
  eWayBillEligibleCount: number;
  totalEWayBillValue: number;

  // 30-day IRP Rule Audit
  irpAuditList: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    gstin?: string | null;
    issueDate: string;
    amount: number;
    daysOld: number;
    isOverdue: boolean; // > 30 days
  }>;

  // DPDP Consent Ledger
  consentRecords: DpdpConsentRecord[];
  dpdpStats: {
    totalActive: number;
    withdrawn: number;
    biometricConsents: number;
    customerConsents: number;
  };
}

export async function getComplianceDashboardData(): Promise<ComplianceSummary> {
  const organization = await requireOrganization();

  const [invoices, profile, customers] = await Promise.all([
    db.invoice.findMany({
      where: {
        organizationId: organization.id,
        status: { not: "CANCELLED" },
      },
      include: {
        customer: true,
      },
      orderBy: { issueDate: "desc" },
    }),
    db.companyProfile.findFirst({
      where: { organizationId: organization.id },
    }),
    db.customer.findMany({
      where: { organizationId: organization.id },
    }),
  ]);

  const sales = invoices.filter((i) => i.documentType === "SALE");
  const creditNotes = invoices.filter((i) => i.documentType === "CREDIT_NOTE");

  const totalGrossSale = sales.reduce((sum, s) => sum + s.total, 0);
  const totalCreditReturns = creditNotes.reduce((sum, c) => sum + c.total, 0);
  const netTurnover = Math.max(0, totalGrossSale - totalCreditReturns);

  // Threshold Progress
  const goodsProgress = Math.min(100, (netTurnover / GST_THRESHOLDS.goodsThreshold) * 100);
  const servicesProgress = Math.min(100, (netTurnover / GST_THRESHOLDS.servicesThreshold) * 100);
  const eInvoicingProgress = Math.min(100, (netTurnover / GST_THRESHOLDS.eInvoicingThreshold) * 100);
  const compositionProgress = Math.min(100, (netTurnover / GST_THRESHOLDS.compositionSchemeThreshold) * 100);

  // E-Way Bill High-value check (> 50,000)
  const eWayBills = sales.filter((s) => s.total >= GST_THRESHOLDS.eWayBillThreshold);
  const totalEWayBillValue = eWayBills.reduce((sum, s) => sum + s.total, 0);

  // 30-Day IRP Rule Check (B2B invoices)
  const now = new Date();
  const irpAuditList = sales
    .filter((s) => Boolean(s.customer?.taxId && s.customer.taxId.length >= 15))
    .map((inv) => {
      const invDate = new Date(inv.issueDate);
      const diffMs = now.getTime() - invDate.getTime();
      const daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customer?.name || "B2B Client",
        gstin: inv.customer?.taxId,
        issueDate: inv.issueDate.toISOString().slice(0, 10),
        amount: inv.total,
        daysOld: Math.max(0, daysOld),
        isOverdue: daysOld > GST_THRESHOLDS.irpRuleMaxDays,
      };
    });

  // DPDP Consent Records
  const consentRecords = getDpdpConsentLedger();
  const dpdpStats = {
    totalActive: consentRecords.filter((r) => r.status === "GRANTED").length,
    withdrawn: consentRecords.filter((r) => r.status === "WITHDRAWN").length,
    biometricConsents: consentRecords.filter(
      (r) => r.purpose === "BIOMETRIC_ATTENDANCE" && r.status === "GRANTED"
    ).length,
    customerConsents: consentRecords.filter(
      (r) => r.entityType === "CUSTOMER" && r.status === "GRANTED"
    ).length,
  };

  return {
    turnover: netTurnover,
    financialYear: "2026-2027",
    isGstRegistered: Boolean(profile?.taxId),
    companyGstin: profile?.taxId,
    state: profile?.state || "Karnataka",
    goodsProgress,
    servicesProgress,
    eInvoicingProgress,
    compositionProgress,
    goodsExceeded: netTurnover >= GST_THRESHOLDS.goodsThreshold,
    servicesExceeded: netTurnover >= GST_THRESHOLDS.servicesThreshold,
    eInvoicingMandatory: netTurnover >= GST_THRESHOLDS.eInvoicingThreshold,
    compositionExceeded: netTurnover >= GST_THRESHOLDS.compositionSchemeThreshold,
    eWayBillEligibleCount: eWayBills.length,
    totalEWayBillValue,
    irpAuditList,
    consentRecords,
    dpdpStats,
  };
}

export async function addOrUpdateConsentRecordAction(data: {
  id?: string;
  entityType: "CUSTOMER" | "EMPLOYEE";
  entityId: string;
  entityName: string;
  contact: string;
  purpose: DpdpConsentPurpose;
  channel: string;
  notes?: string;
}) {
  await requireOrganization();
  return addOrUpdateConsent({
    ...data,
    status: "GRANTED",
    noticeVersion: "v1.2-2026",
  });
}

export async function toggleConsentStatusAction(id: string, newStatus: "GRANTED" | "WITHDRAWN" | "EXPIRED") {
  await requireOrganization();
  return toggleConsentStatus(id, newStatus);
}
