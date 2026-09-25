import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/db";

/**
 * React request-memoized company profile query
 */
export const getCachedCompanyProfile = cache(async (organizationId: string) => {
  return db.companyProfile.findUnique({
    where: { organizationId },
  });
});

/**
 * Next.js data-cached Organization stats calculation (cached for 60 seconds)
 */
export const getCachedDashboardStats = (organizationId: string) =>
  unstable_cache(
    async () => {
      const [invoiceCount, customerCount, itemCount, voucherCount, salesTotal] = await Promise.all([
        db.invoice.count({ where: { organizationId } }),
        db.customer.count({ where: { organizationId } }),
        db.item.count({ where: { organizationId } }),
        db.journalVoucher.count({ where: { organizationId } }),
        db.invoice.aggregate({
          where: { organizationId, documentType: "SALE", status: { not: "CANCELLED" } },
          _sum: { total: true },
        }),
      ]);

      return {
        invoiceCount,
        customerCount,
        itemCount,
        voucherCount,
        totalSales: salesTotal._sum.total ?? 0,
      };
    },
    [`dashboard-stats-${organizationId}`],
    { revalidate: 60, tags: [`org-stats-${organizationId}`] }
  )();
