import Link from "next/link";
import { ArrowRight, GraduationCap, CheckCircle2, CreditCard, Calendar } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { VERTICAL_CONFIGS } from "@/lib/verticals";

export const dynamic = "force-dynamic";

export default function EducationLandingPage() {
  const config = VERTICAL_CONFIGS.EDUCATION;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="size-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center">B</div>
          <span>Billora for {config.label}</span>
        </Link>
        <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Sign In
        </Link>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 space-y-12 text-center sm:text-left">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <GraduationCap className="size-3.5" />
            <span>Built for Schools, Colleges &amp; Coaching Institutes</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Student Fee Management, Installment Invoicing &amp; Teacher Payroll.
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            {config.description}. Issue course fee receipts (`FEE-`), track fee due installments, and manage teacher shift payroll.
          </p>
          <div className="pt-4 flex items-center gap-3">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2")}>
              <span>Start Free Trial</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t">
          <div className="p-5 rounded-xl border bg-card space-y-2">
            <CreditCard className="size-6 text-blue-600" />
            <h3 className="font-semibold text-base">Course Installment Billing</h3>
            <p className="text-xs text-muted-foreground">GST-exempt educational SAC codes (999293) with multi-term fee installments.</p>
          </div>
          <div className="p-5 rounded-xl border bg-card space-y-2">
            <Calendar className="size-6 text-blue-600" />
            <h3 className="font-semibold text-base">Faculty Shift Payroll</h3>
            <p className="text-xs text-muted-foreground">Track hourly lecture rates, overtime, and teacher attendance slips.</p>
          </div>
          <div className="p-5 rounded-xl border bg-card space-y-2">
            <CheckCircle2 className="size-6 text-blue-600" />
            <h3 className="font-semibold text-base">Student Ledger History</h3>
            <p className="text-xs text-muted-foreground">Full financial ledger audit trail per student with instant receipt printing.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
