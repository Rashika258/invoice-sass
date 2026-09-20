import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, Scissors, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function SalonsLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="size-8 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center">B</div>
          <span>Billora for Salons &amp; Spas</span>
        </Link>
        <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Sign In
        </Link>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 space-y-12 text-center sm:text-left">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Scissors className="size-3.5" />
            <span>Built for Salons, Spas, &amp; Wellness Clinics</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Client Appointments, Stylist Payroll &amp; Service Billing in One App.
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Book client visits, track stylist service commissions, manage 8-hour shift attendance with overtime, and send WhatsApp visit reminders.
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
            <Calendar className="size-6 text-indigo-600" />
            <h3 className="font-semibold text-base">Appointment Calendar</h3>
            <p className="text-xs text-muted-foreground">Book visits, assign stylists, and view daily salon appointment schedules.</p>
          </div>
          <div className="p-5 rounded-xl border bg-card space-y-2">
            <UserCheck className="size-6 text-indigo-600" />
            <h3 className="font-semibold text-base">Shift Attendance &amp; OT</h3>
            <p className="text-xs text-muted-foreground">8-hour base shift engine with automatic overtime and printable salary slips.</p>
          </div>
          <div className="p-5 rounded-xl border bg-card space-y-2">
            <CheckCircle2 className="size-6 text-indigo-600" />
            <h3 className="font-semibold text-base">Service Commissions</h3>
            <p className="text-xs text-muted-foreground">Track stylist cuts per service bill automatically on POS checkout.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
