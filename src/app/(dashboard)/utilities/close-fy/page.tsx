"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, Lock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function CloseFinancialYearPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [done, setDone] = useState(false);

  const handleCloseFy = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setDone(true);
      toast.success("Financial Year 2025-26 successfully archived and closed!");
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <Link href="/utilities/import-items" className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Close Financial Year</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-2xs text-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-border/80">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
            <Lock className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Year-End Book Closing Wizard</h3>
            <p className="text-[11px] text-muted-foreground">Archive current FY (2025-26) and forward closing balances to new FY (2026-27).</p>
          </div>
        </div>

        <div className="space-y-2 text-muted-foreground leading-relaxed">
          <p>When you close the financial year:</p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Item closing stock becomes opening stock for the new financial year.</li>
            <li>Party outstanding balances are carried forward as opening dues.</li>
            <li>Bank &amp; Cash drawer balances are preserved as new opening balances.</li>
            <li>Invoice sequence can optionally be reset back to 001.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-2 text-amber-700 dark:text-amber-400">
          <ShieldAlert className="size-4 shrink-0 mt-0.5" />
          <span>Please create a computer backup before proceeding with FY closure.</span>
        </div>

        {done ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-emerald-600 dark:text-emerald-400 font-bold space-y-2">
            <CheckCircle2 className="size-8 mx-auto" />
            <p>Financial Year 2025-26 Closed Successfully!</p>
            <Link href="/dashboard" className="inline-block text-xs underline font-semibold">
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="conf"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="size-4 rounded accent-primary cursor-pointer"
              />
              <label htmlFor="conf" className="cursor-pointer font-semibold text-foreground">
                I understand this operation locks previous financial year books
              </label>
            </div>

            <Button
              disabled={!confirmed || closing}
              onClick={handleCloseFy}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
            >
              {closing ? "Closing Books..." : "Proceed with FY Closure"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
