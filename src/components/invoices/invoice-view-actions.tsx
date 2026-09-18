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
import { InvoiceTemplate, type TemplateId } from "@/components/invoices/invoice-template";
import { Badge } from "@/components/ui/badge";
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

  const handleShareWhatsApp = () => {
    const text = `Dear ${invoice.customer.name},\nYour invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.total, currency)} from ${invoice.companyName} is ready.\nBalance due: ${formatCurrency(Math.max(invoice.total - invoice.paidAmount, 0), currency)}.\nThank you for your business!`;
    const cleanPhone = invoice.customer.phone?.replace(/[^0-9]/g, "") || "";
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
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

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
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

          <Button
            variant="outline"
            disabled={isGeneratingPdf}
            onClick={handleDownloadPdf}
            className="border-blue-600/30 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10 cursor-pointer font-medium"
          >
            <Download className="mr-2 h-4 w-4 text-blue-600" />
            {isGeneratingPdf ? "Generating..." : "Download PDF"}
          </Button>

          <Button
            variant="default"
            onClick={() => window.print()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer shadow-xs"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Bill
          </Button>

          <Link
            href={`/invoices/${invoice.id}/edit`}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 text-sm font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Bill
          </Link>

          <Button
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 cursor-pointer"
            onClick={handleDelete}
            title="Delete Bill"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Template Switcher Gallery (Hidden during print) */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="size-4 text-primary" />
            <span className="text-xs font-bold text-foreground">
              Choose Invoice Template Design:
            </span>
            <Badge className={`font-mono text-[10px] ${activeConfig.badgeColor}`}>
              {activeConfig.badge}
            </Badge>
          </div>
          <span className="text-[11px] text-muted-foreground italic">
            {activeConfig.subtitle}
          </span>
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
                <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                  {t.badge}
                </div>
              </button>
            );
          })}
        </div>

        {/* Copy Type Selector for Sri Manjunatha Authentic Template */}
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

      {/* Invoice Document Render Container */}
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
  );
}
