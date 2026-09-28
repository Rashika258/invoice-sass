"use client";

import { useState } from "react";
import { MessageCircle, Send, ExternalLink, Smartphone, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { sendWhatsAppInvoiceAction } from "@/actions/whatsapp-api";
import { formatCurrency } from "@/lib/invoice-utils";

type WhatsAppShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    invoiceNumber: string;
    total: number;
    paidAmount?: number;
    companyName: string;
    customer: {
      name: string;
      phone?: string | null;
    };
  };
  currency?: string;
};

export function WhatsAppShareDialog({
  open,
  onOpenChange,
  invoice,
  currency = "INR",
}: WhatsAppShareDialogProps) {
  const [phone, setPhone] = useState(invoice.customer.phone || "");
  const [isSendingCloud, setIsSendingCloud] = useState(false);

  const cleanPhone = phone.replace(/\D/g, "");
  const pendingAmount = Math.max(0, invoice.total - (invoice.paidAmount || 0));

  const previewMessage = `Namaste ${invoice.customer.name},

Your invoice *${invoice.invoiceNumber}* for *${formatCurrency(invoice.total, currency)}* from *${invoice.companyName}* is ready.${
    pendingAmount > 0 ? `\nBalance due: ${formatCurrency(pendingAmount, currency)}.` : " Fully paid."
  }

Thank you for your business!`;

  const handleInstantWhatsApp = () => {
    if (!cleanPhone) {
      toast.error("Please enter a valid phone number with country code (e.g. 919876543210)");
      return;
    }
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(previewMessage)}`;
    window.open(waUrl, "_blank");
    toast.success("Opening WhatsApp chat...");
    onOpenChange(false);
  };

  const handleCloudApiDispatch = async () => {
    if (!cleanPhone) {
      toast.error("Please enter a valid phone number with country code");
      return;
    }

    setIsSendingCloud(true);
    toast.loading("Sending via WhatsApp Cloud API...", { id: "wa-cloud-dispatch" });

    try {
      const res = await sendWhatsAppInvoiceAction({
        phone: cleanPhone,
        customerName: invoice.customer.name,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.total,
      });

      if (res.method === "META_CLOUD_API") {
        toast.success("Invoice sent via Official Meta WhatsApp Cloud API!", {
          id: "wa-cloud-dispatch",
        });
        onOpenChange(false);
      } else {
        toast.success("Opening WhatsApp link...", { id: "wa-cloud-dispatch" });
        if (res.waUrl) {
          window.open(res.waUrl, "_blank");
        }
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch via WhatsApp Cloud API", {
        id: "wa-cloud-dispatch",
      });
    } finally {
      setIsSendingCloud(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MessageCircle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Share Invoice #{invoice.invoiceNumber}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Send GST tax invoice directly to {invoice.customer.name} via WhatsApp
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Recipient Phone Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Customer WhatsApp Number (with country code)
            </Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 919876543210"
                className="pl-9 text-sm h-9"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              For India, include prefix 91 (e.g., 919876543210).
            </p>
          </div>

          {/* 2 Dispatch Options */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold text-foreground">Select Dispatch Method</Label>

            {/* Option 1: Instant WhatsApp Web / App */}
            <div
              onClick={handleInstantWhatsApp}
              className="p-3.5 rounded-xl border border-border/80 hover:border-emerald-500/60 hover:bg-emerald-500/[0.03] transition-all cursor-pointer group space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  <ExternalLink className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Option 1: Instant WhatsApp Web / App</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                  Instant Link
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground pl-6">
                Opens WhatsApp Web or mobile app with a pre-filled invoice summary and payment link ready to send.
              </p>
            </div>

            {/* Option 2: Direct Meta Cloud API */}
            <div
              onClick={handleCloudApiDispatch}
              className="p-3.5 rounded-xl border border-border/80 hover:border-primary/60 hover:bg-primary/[0.03] transition-all cursor-pointer group space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground group-hover:text-primary">
                  <ShieldCheck className="size-4 text-primary" />
                  <span>Option 2: Direct Meta WhatsApp Cloud API</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                  Official API
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground pl-6">
                Sends automated message directly to the customer in the background with invoice details and PDF.
              </p>
            </div>
          </div>

          {/* Message Preview */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground font-medium">Message Preview</Label>
            <div className="p-3 rounded-lg border border-border/60 bg-muted/30 text-[11px] font-mono whitespace-pre-line text-foreground/80 leading-relaxed">
              {previewMessage}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-3.5 border-t bg-muted/10 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleInstantWhatsApp}
              className="text-xs gap-1.5 cursor-pointer"
            >
              <ExternalLink className="size-3.5" />
              <span>Open in WhatsApp</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCloudApiDispatch}
              disabled={isSendingCloud}
              className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
            >
              <Send className="size-3.5" />
              <span>{isSendingCloud ? "Sending..." : "Send via Cloud API"}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
