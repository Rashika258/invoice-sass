"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Factory,
  FileCheck,
  FileText,
  LayoutTemplate,
  MessageCircle,
  Pencil,
  Printer,
  Receipt,
  Sparkles,
  Trash2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import type { Customer, Invoice, InvoiceItem } from "@/generated/prisma/client";
import { deleteInvoice } from "@/actions/invoices";
import { sendWhatsAppInvoiceAction } from "@/actions/whatsapp-api";
import { InvoiceTemplate, type TemplateId } from "@/components/invoices/invoice-template";
import { WhatsAppShareDialog } from "@/components/invoices/whatsapp-share-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnifiedRecordPage } from "@/components/common/unified-record-page";
import { formatCurrency } from "@/lib/invoice-utils";
import { ExplainableAccordion } from "@/components/common/explainable-accordion";
import { invoiceTotalExplanation } from "@/lib/calculation-explanations";

type InvoiceViewProps = {
  invoice: Invoice & {
    customer: Customer;
    items: InvoiceItem[];
  };
  currency: string;
  logoUrl?: string | null;
};

const TEMPLATE_CONFIGS = [
  {
    id: "CLASSIC" as TemplateId,
    name: "Sri Manjunatha Authentic (Default)",
    subtitle: "Exact 1:1 physical bill book format from your workshop",
    badge: "Official Bill Book",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300",
    icon: Factory,
  },
  {
    id: "MODERN" as TemplateId,
    name: "Modern Executive",
    subtitle: "Sleek gradient brand banner with dynamic UPI QR code",
    badge: "Popular Corporate",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
    icon: Sparkles,
  },
  {
    id: "GST_TAX" as TemplateId,
    name: "GST Tax Standard",
    subtitle: "Legal Form GST INV-1 with dedicated HSN summary table",
    badge: "GST Compliance",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
    icon: FileCheck,
  },
  {
    id: "INDUSTRIAL" as TemplateId,
    name: "Precision Job Work",
    subtitle: "Engineered for turning, CNC, lathe, and component job work",
    badge: "Machine Shop",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
    icon: Wrench,
  },
  {
    id: "MINIMAL" as TemplateId,
    name: "Clean Monochrome",
    subtitle: "High contrast ink-saver for B&W laser and dot-matrix printers",
    badge: "Ink Saver",
    badgeColor: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-300",
    icon: FileText,
  },
  {
    id: "THERMAL" as TemplateId,
    name: "POS Thermal Slip",
    subtitle: "80mm / 58mm roll format for fast counter receipts",
    badge: "Retail Roll",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
    icon: Receipt,
  },
  {
    id: "TRADITIONAL" as TemplateId,
    name: "Traditional Bill Book",
    subtitle: "Classic Indian GST bill book format with your business details & watermark",
    badge: "Indian Standard",
    badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300",
    icon: FileText,
  },
];

export function InvoiceViewActions({ invoice, currency, logoUrl }: InvoiceViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("CLASSIC");
  const [copyType, setCopyType] = useState<"ORIGINAL" | "DUPLICATE" | "TRIPLICATE">("ORIGINAL");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  // Load saved preference from localStorage or searchParams
  useEffect(() => {
    const urlTpl = searchParams.get("template")?.toUpperCase();
    if (urlTpl && TEMPLATE_CONFIGS.some((t) => t.id === urlTpl)) {
      setSelectedTemplate(urlTpl as TemplateId);
      return;
    }

    try {
      const saved = localStorage.getItem("preferred_invoice_template");
      if (saved && TEMPLATE_CONFIGS.some((t) => t.id === saved) && saved !== "MODERN") {
        setSelectedTemplate(saved as TemplateId);
      } else {
        setSelectedTemplate("CLASSIC");
      }
    } catch {
      setSelectedTemplate("CLASSIC");
    }
  }, [searchParams]);

  const handleSelectTemplate = (id: TemplateId) => {
    setSelectedTemplate(id);
    try {
      localStorage.setItem("preferred_invoice_template", id);
    } catch {
      // ignore
    }
  };

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

  const handleShareWhatsApp = async () => {
    let targetPhone = invoice.customer.phone;
    if (!targetPhone) {
      const inputPhone = prompt(
        `Enter WhatsApp phone number for ${invoice.customer.name} (with country code, e.g. 919876543210):`,
        ""
      );
      if (!inputPhone) return;
      targetPhone = inputPhone;
    }

    toast.loading("Preparing WhatsApp dispatch...", { id: "wa-dispatch" });
    try {
      const res = await sendWhatsAppInvoiceAction({
        phone: targetPhone,
        customerName: invoice.customer.name,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.total,
      });

      if (res.method === "META_CLOUD_API") {
        toast.success("Invoice sent via official WhatsApp Cloud API!", { id: "wa-dispatch" });
      } else {
        toast.success("Opening WhatsApp chat...", { id: "wa-dispatch" });
        if (res.waUrl) {
          window.open(res.waUrl, "_blank");
        }
      }
    } catch (err: any) {
      toast.dismiss("wa-dispatch");
      const cleanPhone = targetPhone.replace(/[^0-9]/g, "");
      const text = `Dear ${invoice.customer.name},\nYour invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.total, currency)} from ${invoice.companyName} is ready.\nBalance due: ${formatCurrency(Math.max(invoice.total - invoice.paidAmount, 0), currency)}.\nThank you for your business!`;
      const waUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank");
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    toast.loading("Rendering high-res PDF...", { id: "pdf-gen" });

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = document.getElementById("printable-invoice-document");
      if (!element) {
        window.print();
        toast.dismiss("pdf-gen");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const target = clonedDoc.getElementById("printable-invoice-document");
          if (target) {
            target.style.backgroundColor = "#ffffff";
            target.style.color = "#000000";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: selectedTemplate === "THERMAL" ? [80, 297] : "a4",
      });

      const pdfWidth = selectedTemplate === "THERMAL" ? 80 : 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoiceNumber || "Invoice"}_${selectedTemplate}.pdf`);

      toast.success("PDF downloaded successfully!", { id: "pdf-gen" });
    } catch (err) {
      console.error(err);
      toast.error("Opening system print dialog...", { id: "pdf-gen" });
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const activeConfig = TEMPLATE_CONFIGS.find((t) => t.id === selectedTemplate) || TEMPLATE_CONFIGS[0];

  const remainingBalance = Math.max(0, invoice.total - invoice.paidAmount);

  return (
    <>
    <UnifiedRecordPage
      title={invoice.invoiceNumber || "Sales Invoice"}
      subtitle={`Billed to ${invoice.customer.name} • ${invoice.companyName}`}
      entityType="INVOICE"
      entityId={invoice.id}
      backHref="/invoices"
      statusPill={{
        label: invoice.status,
        variant:
          invoice.status.toUpperCase() === "PAID"
            ? "success"
            : invoice.status.toUpperCase() === "SENT" || invoice.status.toUpperCase() === "UNPAID"
            ? "warning"
            : "neutral",
      }}
      summaryCards={[
        {
          label: "Total Amount",
          value: formatCurrency(invoice.total, currency),
          subtext: "Gross invoice value",
        },
        {
          label: "Paid Amount",
          value: formatCurrency(invoice.paidAmount, currency),
          highlight: "emerald",
          subtext: "Settled payments",
        },
        {
          label: "Remaining Balance",
          value: formatCurrency(remainingBalance, currency),
          highlight: remainingBalance > 0 ? "amber" : "emerald",
          subtext: remainingBalance > 0 ? "Outstanding due" : "Fully settled",
        },
        {
          label: "Invoice Date",
          value: new Date((invoice as any).issueDate || invoice.createdAt).toLocaleDateString("en-IN"),
          subtext: `Due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-IN") : "Immediate"}`,
        },
      ]}
      onEdit={() => router.push(`/invoices/${invoice.id}/edit`)}
      onPrint={handleDownloadPdf}
      onShare={() => setIsWhatsAppOpen(true)}
      extraActions={
        <Button
          variant="outline"
          size="icon"
          className="size-8 text-rose-600 hover:bg-rose-500/10 hover:border-rose-300 transition-colors cursor-pointer"
          onClick={handleDelete}
          title="Delete Invoice"
        >
          <Trash2 className="size-3.5" />
        </Button>
      }
      overviewContent={
        <div className="space-y-4">
          {/* Template Switcher Gallery */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="size-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Choose Invoice Template Design:</span>
                <Badge className={`font-mono text-[10px] ${activeConfig.badgeColor}`}>{activeConfig.badge}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground italic hidden sm:inline">{activeConfig.subtitle}</span>
                <Button
                  size="sm"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="h-8 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="size-3.5" />
                  <span>{isGeneratingPdf ? "Generating PDF..." : "Print / Export PDF"}</span>
                </Button>
              </div>
            </div>

            {/* Template Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {TEMPLATE_CONFIGS.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTemplate(t.id)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                        : "border-border bg-card hover:bg-accent/40 hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      {isSelected && <Check className="size-3.5 text-primary font-bold" />}
                    </div>
                    <div className="font-bold text-xs text-foreground leading-tight">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{t.badge}</div>
                  </button>
                );
              })}
            </div>

            {(selectedTemplate === "CLASSIC" || selectedTemplate === "TRADITIONAL") && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs">
                <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Copy className="size-3.5 text-red-600" />
                  Sri Manjunatha Recipient Copy:
                </span>
                <div className="inline-flex rounded-lg border bg-muted/30 p-0.5">
                  {(
                    [
                      { id: "ORIGINAL", label: "Original (Recipient)" },
                      { id: "DUPLICATE", label: "Duplicate (Transporter)" },
                      { id: "TRIPLICATE", label: "Triplicate (Supplier)" },
                    ] as const
                  ).map((cp) => (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => setCopyType(cp.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        copyType === cp.id
                          ? "bg-white dark:bg-zinc-800 text-foreground shadow-2xs font-extrabold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Explainable Calculation Accordion */}
          <div className="print:hidden">
            <ExplainableAccordion
              title="Total Calculation Breakdown & Taxes"
              content={invoiceTotalExplanation(invoice)}
            />
          </div>

          {/* Document Render Container */}
          <div id="printable-invoice-document" className="bg-transparent">
            <InvoiceTemplate
              invoice={invoice}
              currency={currency}
              logoUrl={logoUrl}
              templateId={selectedTemplate}
              copyType={copyType}
            />
          </div>
        </div>
      }
    />
    <WhatsAppShareDialog
      open={isWhatsAppOpen}
      onOpenChange={setIsWhatsAppOpen}
      invoice={invoice}
      currency={currency}
    />
    </>
  );
}
