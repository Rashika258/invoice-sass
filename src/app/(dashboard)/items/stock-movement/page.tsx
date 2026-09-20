import Link from "next/link";
import { ArrowLeft, ArrowDownRight, ArrowUpRight, History, Package } from "lucide-react";
import { getStockMovementHistory } from "@/actions/stock-movement";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StockMovementPage() {
  const movements = await getStockMovementHistory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/items"
            className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <History className="size-6 text-primary" />
              <span>Stock Movement Audit Log</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time audit trail of all physical inventory stock-ins, sales, returns, and manual adjustments.
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-xl border border-border/60 shadow-xs">
        <CardHeader className="p-4 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider">
            Movement History ({movements.length} Records)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {movements.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No stock movements logged yet.
              </div>
            ) : (
              movements.map((m: any) => {
                const isPositive = m.quantityChange > 0;
                return (
                  <div key={m.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isPositive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}
                      >
                        {isPositive ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">
                          {m.item?.name ?? "Unknown Item"}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>Ref: {m.referenceNo || "Direct Entry"}</span>
                          <span>•</span>
                          <span>{new Date(m.createdAt).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={`font-mono font-semibold text-xs ${
                          isPositive
                            ? "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-300"
                            : "border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-300"
                        }`}
                      >
                        {isPositive ? `+${m.quantityChange}` : m.quantityChange} {m.item?.unit || "units"}
                      </Badge>
                      <div className="text-[11px] text-muted-foreground font-mono mt-1">
                        Balance after: {m.balanceAfter} {m.item?.unit || "units"}
                      </div>
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
