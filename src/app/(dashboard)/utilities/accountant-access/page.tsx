import { Metadata } from "next";
import Link from "next/link";
import { UserCheck, ShieldCheck, Mail, FileSpreadsheet, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Accountant Access | Billora",
};

export default function AccountantAccessPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="size-5 text-brand" />
            <span>Chartered Accountant (CA) Portal Access</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Grant secure read-only access to your tax consultant or CA for GSTR filing, audit reconciliation, and financial year close.
          </p>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1 font-semibold text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
          CA Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
          <div className="p-2.5 rounded-xl bg-brand-light text-brand w-fit">
            <Mail className="size-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Invite Your CA / Tax Consultant</h3>
          <p className="text-xs text-muted-foreground">
            Provide their email to generate a secure 30-day tokenized portal link with read-only access to P&amp;L, Balance Sheet, and GST returns.
          </p>
          <div className="pt-2">
            <Link href="/team">
              <Button size="sm" className="bg-brand text-white font-bold text-xs rounded-xl shadow-xs">
                Manage Auditor Invites
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
          <div className="p-2.5 rounded-xl bg-brand-light text-brand w-fit">
            <FileSpreadsheet className="size-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Direct Tally &amp; Excel Package</h3>
          <p className="text-xs text-muted-foreground">
            Download the complete one-click bundle containing all sales, purchases, bank books, and inventory journals formatted for Tally Prime.
          </p>
          <div className="pt-2">
            <Link href="/utilities/export-tally">
              <Button variant="outline" size="sm" className="font-bold text-xs rounded-xl border-border">
                <Download className="mr-1.5 size-3.5" />
                Export Tally XML Bundle
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
