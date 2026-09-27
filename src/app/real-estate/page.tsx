import Link from "next/link";
import { ArrowRight, Building, CheckCircle2, FileText, Bell } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { VERTICAL_CONFIGS } from "@/lib/verticals";

export const dynamic = "force-dynamic";

export default function RealEstateLandingPage() {
  const config = VERTICAL_CONFIGS.REAL_ESTATE;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="size-8 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center">B</div>
          <span>Billora for {config.label}</span>
        </Link>
        <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Sign In
        </Link>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 space-y-12 text-center sm:text-left">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Building className="size-3.5" />
            <span>Built for Property Owners, Landlords &amp; Facility Managers</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Automated Rent Collection &amp; Lease Accounting for Property ERP.
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            {config.description}. Generate monthly rent invoices (`RNT-`), collect security deposits, and track maintenance dues automatically.
          </p>
          <div className="pt-4 flex items-center gap-3">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2")}>
              <span>Start Free Trial</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t">
          <div className="p-5 rounded-xl border bg-card space-y-2">
            <FileText className="size-6 text-emerald-600" />
            <h3 className="font-semibold text-base">Automated Rent Invoices</h3>
            <p className="text-xs text-muted-foreground">Auto-generate monthly property rent bills with customizable SAC codes (997211).</p>
          </div>
          <div className="p-5 rounded-xl border bg-card space-y-2">
            <Bell className="size-6 text-emerald-600" />
            <h3 className="font-semibold text-base">WhatsApp Due Reminders</h3>
            <p className="text-xs text-muted-foreground">Send automated tenant rent due reminders with 1-click UPI payment links.</p>
          </div>
          <div className="p-5 rounded-xl border bg-card space-y-2">
            <CheckCircle2 className="size-6 text-emerald-600" />
            <h3 className="font-semibold text-base">Security Deposit Ledger</h3>
            <p className="text-xs text-muted-foreground">Track tenant security deposits and refund adjustments with full audit history.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
