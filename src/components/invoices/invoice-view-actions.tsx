"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutTemplate, MessageCircle, Pencil, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Customer, Invoice, InvoiceItem } from "@/generated/prisma/client";
import { deleteInvoice } from "@/actions/invoices";
import { InvoiceTemplate, type TemplateId } from "@/components/invoices/invoice-template";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/invoice-utils";

type InvoiceViewProps = {
  invoice: Invoice & {
    customer: Customer;
    items: InvoiceItem[];
  };
  currency: string;
  logoUrl?: string | null;
};

export function InvoiceViewActions({ invoice, currency, logoUrl }: InvoiceViewProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("CLASSIC");

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this bill permanently?")) return;

    try {
      await deleteInvoice(invoice.id);
      toast.success("Bill deleted successfully");
      router.push("/invoices");
      router.refresh();
    } catch {
      toast.error("Failed to delete bill");
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Dear ${invoice.customer.name},\nYour invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.total, currency)} from ${invoice.companyName} is ready.\nBalance due: ${formatCurrency(Math.max(invoice.total - invoice.paidAmount, 0), currency)}.\nThank you for your business!`;
    const cleanPhone = invoice.customer.phone?.replace(/[^0-9]/g, "") || "";
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" render={<Link href="/invoices" />}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleShareWhatsApp}
            className="border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
          >
            <MessageCircle className="mr-2 h-4 w-4 text-emerald-600" />
            Share WhatsApp
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="cursor-pointer">
            <Printer className="mr-2 h-4 w-4" />
            Print / Save PDF
          </Button>
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 text-sm font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Bill
          </Link>
          <Button variant="ghost" className="text-destructive hover:bg-destructive/10 cursor-pointer" onClick={handleDelete}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Template Selector Bar (hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-2xs print:hidden">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="size-4 text-brand" />
          <span className="text-xs font-bold text-foreground">Select Invoice Design Template:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "CLASSIC", label: "Classic Tally Grid" },
            { id: "MODERN", label: "Modern Clean" },
            { id: "GST_TAX", label: "GST Tax Detailed" },
            { id: "THERMAL", label: "POS Thermal Receipt" },
            { id: "ELEGANT", label: "Corporate Elegant" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTemplate(t.id as TemplateId)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedTemplate === t.id
                  ? "bg-brand text-white shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Document Render */}
      <InvoiceTemplate
        invoice={invoice}
        currency={currency}
        logoUrl={logoUrl}
        templateId={selectedTemplate}
      />
    </div>
  );
}
