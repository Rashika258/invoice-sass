import Link from "next/link";
import { ArrowLeft, Barcode, Printer } from "lucide-react";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { BarcodePrintButton } from "@/components/utilities/barcode-print-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/invoice-utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BarcodeGeneratorPage() {
  const organization = await requireOrganization();
  const items = await db.item.findMany({
    where: { organizationId: organization.id, itemType: "PRODUCT" },
    orderBy: { name: "asc" },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/utilities/import-items"
            className="flex size-8 items-center justify-center rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Barcode Generator
            </h1>
            <p className="text-xs text-muted-foreground">
              Print thermal barcode stickers and retail shelf tags for your inventory items.
            </p>
          </div>
        </div>

        <Link
          href="/utilities/import-items"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
        >
          <span>Import Items</span>
        </Link>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <Barcode className="mx-auto size-12 text-muted-foreground mb-3 opacity-50" />
          <h3 className="text-base font-semibold">No inventory items found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Add items first or import from the retail library to generate printable barcodes.
          </p>
          <Link
            href="/utilities/import-items"
            className={cn(buttonVariants({ size: "sm" }), "mt-4 text-xs font-semibold")}
          >
            Import Items Now
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ready to print ({items.length} stickers)
            </span>
            <BarcodePrintButton />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((item, idx) => {
              const code = item.hsn ? `${item.hsn}${idx.toString().padStart(4, "0")}` : `890${idx.toString().padStart(8, "0")}`;
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/80 bg-card p-3.5 text-center shadow-xs space-y-1.5 transition-all hover:border-primary/50"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                    {organization.name}
                  </p>
                  <p className="text-xs font-bold text-foreground truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="font-mono text-sm font-black text-primary">
                    {formatCurrency(item.unitPrice, "INR")}
                  </p>

                  {/* Simulated SVG Barcode (Code128 representation) */}
                  <div className="py-1 flex justify-center">
                    <svg viewBox="0 0 100 28" className="h-7 w-28 overflow-hidden">
                      <rect x="2" y="0" width="2" height="24" fill="currentColor" />
                      <rect x="6" y="0" width="4" height="24" fill="currentColor" />
                      <rect x="12" y="0" width="1" height="24" fill="currentColor" />
                      <rect x="15" y="0" width="3" height="24" fill="currentColor" />
                      <rect x="20" y="0" width="5" height="24" fill="currentColor" />
                      <rect x="27" y="0" width="2" height="24" fill="currentColor" />
                      <rect x="31" y="0" width="4" height="24" fill="currentColor" />
                      <rect x="37" y="0" width="2" height="24" fill="currentColor" />
                      <rect x="41" y="0" width="6" height="24" fill="currentColor" />
                      <rect x="49" y="0" width="1" height="24" fill="currentColor" />
                      <rect x="52" y="0" width="3" height="24" fill="currentColor" />
                      <rect x="57" y="0" width="5" height="24" fill="currentColor" />
                      <rect x="64" y="0" width="2" height="24" fill="currentColor" />
                      <rect x="68" y="0" width="4" height="24" fill="currentColor" />
                      <rect x="74" y="0" width="1" height="24" fill="currentColor" />
                      <rect x="77" y="0" width="5" height="24" fill="currentColor" />
                      <rect x="84" y="0" width="3" height="24" fill="currentColor" />
                      <rect x="89" y="0" width="2" height="24" fill="currentColor" />
                      <rect x="93" y="0" width="4" height="24" fill="currentColor" />
                    </svg>
                  </div>

                  <p className="font-mono text-[10px] text-muted-foreground tracking-widest">
                    {code}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
