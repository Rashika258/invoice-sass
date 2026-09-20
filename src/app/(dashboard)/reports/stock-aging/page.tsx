import Link from "next/link";
import { ArrowLeft, AlertTriangle, Pill, ShieldAlert } from "lucide-react";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StockAgingPage() {
  const org = await requireOrganization();
  const batches = await db.inventoryBatch.findMany({
    where: { item: { organizationId: org.id } },
    include: { item: true },
    orderBy: { expiryDate: "asc" },
  });

  const now = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(now.getDate() + 30);

  const expiredBatches = batches.filter((b) => b.expiryDate && b.expiryDate < now);
  const nearExpiryBatches = batches.filter(
    (b) => b.expiryDate && b.expiryDate >= now && b.expiryDate <= thirtyDaysLater
  );
  const healthyBatches = batches.filter((b) => !b.expiryDate || b.expiryDate > thirtyDaysLater);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Pill className="size-6 text-rose-600 dark:text-rose-400" />
              <span>Medicine Stock Aging &amp; Expiry Report</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              FEFO batch tracking, near-expiry alerts (&lt;30 days), and expired drug returns log.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-rose-600 bg-card">
          <div className="text-xs font-medium text-muted-foreground">Expired Batches</div>
          <div className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">
            {expiredBatches.length}
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500 bg-card">
          <div className="text-xs font-medium text-muted-foreground">Expiring in &lt; 30 Days</div>
          <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
            {nearExpiryBatches.length}
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-600 bg-card">
          <div className="text-xs font-medium text-muted-foreground">Healthy Batches</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
            {healthyBatches.length}
          </div>
        </Card>
      </div>

      <Card className="rounded-xl border border-border/60 shadow-xs">
        <CardHeader className="p-4 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider">
            Batch Expiry Ledger ({batches.length} Batches)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {batches.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No inventory batches registered yet. Batch &amp; expiry dates will automatically populate here.
              </div>
            ) : (
              batches.map((b) => {
                const isExpired = b.expiryDate && b.expiryDate < now;
                const isNearExpiry = b.expiryDate && b.expiryDate >= now && b.expiryDate <= thirtyDaysLater;

                return (
                  <div key={b.id} className="p-4 flex items-center justify-between text-xs hover:bg-muted/10 transition-colors">
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>{b.item?.name}</span>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          Batch #{b.batchNumber}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground text-[11px] mt-0.5 font-mono">
                        Available Stock: {b.quantity} {b.item?.unit || "PCS"}
                      </div>
                    </div>

                    <div className="text-right">
                      {b.expiryDate ? (
                        <Badge
                          variant="outline"
                          className={`font-mono text-[11px] font-semibold ${
                            isExpired
                              ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/20 dark:text-rose-300"
                              : isNearExpiry
                              ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/20 dark:text-amber-300"
                              : "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-300"
                          }`}
                        >
                          {isExpired ? "EXPIRED on " : isNearExpiry ? "EXPIRING SOON: " : "Expires: "}
                          {new Date(b.expiryDate).toLocaleDateString("en-IN")}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">No Expiry Set</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
