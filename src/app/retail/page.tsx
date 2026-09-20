import Link from "next/link";
import { ArrowRight, Barcode, CheckCircle2, ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function RetailLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="size-8 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center">B</div>
          <span>Billora for Retail</span>
        </Link>
        <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Sign In
        </Link>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 space-y-12 text-center sm:text-left">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <ShoppingBag className="size-3.5" />
            <span>Built for Retail Stores, Hardware, &amp; Wholesalers</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Replace Slow Billing Counters with a Lightning-Fast Cloud POS.
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Streamline counter checkouts, scan barcodes, manage multi-location stock, track supplier credit, and auto-sync Tally accounting.
          </p>
          <div className="pt-4 flex items-center gap-3">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2")}>
              <span>Start Free Trial</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t">
          <div className="p-5 rounded-xl border bg-card space-y-2">
            <Barcode className="size-6 text-indigo-600" />
            <h3 className="font-semibold text-base">Instant Barcode Billing</h3>
            <p className="text-xs text-muted-foreground">Scan barcodes or tap touch grid for 3-second counter checkouts.</p>
          </div>
          <div className="p-5 rounded-xl border bg-card space-y-2">
            <Zap className="size-6 text-indigo-600" />
            <h3 className="font-semibold text-base">Stock Alerts &amp; POs</h3>
            <p className="text-xs text-muted-foreground">Automatic low-stock warnings with 1-click purchase order generation.</p>
          </div>
          <div className="p-5 rounded-xl border bg-card space-y-2">
            <CheckCircle2 className="size-6 text-indigo-600" />
            <h3 className="font-semibold text-base">Tally F4-F9 Keyboard Sync</h3>
            <p className="text-xs text-muted-foreground">Tally-shortcut voucher entries with automated Day Book &amp; P&amp;L reports.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
