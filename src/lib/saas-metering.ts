import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

export type SaaSPlan = "FREE_TRIAL" | "STARTER" | "PRO" | "ENTERPRISE";

export interface PlanLimits {
  monthlyInvoiceLimit: number;
  allowPosCheckout: boolean;
  allowMultiWarehouse: boolean;
  allowTallyExport: boolean;
  allowEInvoicing: boolean;
}

const PLAN_LIMITS: Record<SaaSPlan, PlanLimits> = {
  FREE_TRIAL: {
    monthlyInvoiceLimit: 50,
    allowPosCheckout: true,
    allowMultiWarehouse: false,
    allowTallyExport: false,
    allowEInvoicing: false,
  },
  STARTER: {
    monthlyInvoiceLimit: 250,
    allowPosCheckout: true,
    allowMultiWarehouse: false,
    allowTallyExport: true,
    allowEInvoicing: false,
  },
  PRO: {
    monthlyInvoiceLimit: 1000,
    allowPosCheckout: true,
    allowMultiWarehouse: true,
    allowTallyExport: true,
    allowEInvoicing: true,
  },
  ENTERPRISE: {
    monthlyInvoiceLimit: 999999,
    allowPosCheckout: true,
    allowMultiWarehouse: true,
    allowTallyExport: true,
    allowEInvoicing: true,
  },
};

/**
 * Check if organization plan quota permits creation of a new invoice or feature use
 */
export async function assertPlanQuota(
  organizationId: string,
  feature: "INVOICE_CREATE" | "MULTI_WAREHOUSE" | "TALLY_EXPORT" | "E_INVOICING" = "INVOICE_CREATE",
  currentPlan: SaaSPlan = "PRO", // Default active subscription
): Promise<void> {
  const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.PRO;

  if (feature === "MULTI_WAREHOUSE" && !limits.allowMultiWarehouse) {
    throw new AppError("FORBIDDEN", "Multi-warehouse transfers require PRO or ENTERPRISE subscription.", 403);
  }

  if (feature === "TALLY_EXPORT" && !limits.allowTallyExport) {
    throw new AppError("FORBIDDEN", "Tally integration export requires STARTER subscription or higher.", 403);
  }

  if (feature === "E_INVOICING" && !limits.allowEInvoicing) {
    throw new AppError("FORBIDDEN", "Government E-Invoicing IRN generation requires PRO subscription or higher.", 403);
  }

  if (feature === "INVOICE_CREATE") {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const invoiceCount = await db.invoice.count({
      where: {
        organizationId,
        createdAt: { gte: startOfMonth },
      },
    });

    if (invoiceCount >= limits.monthlyInvoiceLimit) {
      throw new AppError(
        "FORBIDDEN",
        `Plan Quota Exceeded: You have created ${invoiceCount}/${limits.monthlyInvoiceLimit} invoices this month for plan '${currentPlan}'. Upgrade to PRO for higher limits.`,
        403,
      );
    }
  }
}
