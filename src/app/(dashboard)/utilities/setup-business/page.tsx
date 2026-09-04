import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Sparkles, Building2, Package, Users, Receipt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Set Up My Business | Billora",
};

export default function SetupBusinessPage() {
  const steps = [
    { title: "Company Profile & GST", desc: "Update registered office, GSTIN, and legal business name", href: "/settings", completed: true },
    { title: "Add Bank Account & UPI", desc: "Add current bank account and UPI VPA for invoice QR code payments", href: "/cash-bank/banks", completed: true },
    { title: "Create Your First Item / Product", desc: "Add inventory goods or service catalog with HSN codes & pricing", href: "/products", completed: true },
    { title: "Add Parties & Suppliers", desc: "Import or enter customer directories with billing & shipping addresses", href: "/parties", completed: true },
    { title: "Generate Tax Invoice", desc: "Create professional GST sales invoice with print & WhatsApp sharing", href: "/invoices/new", completed: true },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="size-5 text-brand" />
          <span>Business Setup Onboarding Wizard</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Everything required to start billing, managing inventory, and filing GST in one single checklist.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {steps.map((step, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-7 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold">
                {step.completed ? <CheckCircle2 className="size-4 text-emerald-500" /> : idx + 1}
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">{step.title}</h4>
                <p className="text-[11px] text-muted-foreground">{step.desc}</p>
              </div>
            </div>
            <Link
              href={step.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors"
            >
              <span>Open</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
