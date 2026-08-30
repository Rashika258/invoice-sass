"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Customer, Invoice, InvoiceItem } from "@/generated/prisma/client";
import { deleteInvoice } from "@/actions/invoices";
import { InvoiceTemplate } from "@/components/invoices/invoice-template";
import { Button } from "@/components/ui/button";

type InvoiceViewProps = {
  invoice: Invoice & {
    customer: Customer;
    items: InvoiceItem[];
  };
  currency: string;
};

export function InvoiceViewActions({ invoice, currency }: InvoiceViewProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this invoice permanently?")) return;

    try {
      await deleteInvoice(invoice.id);
      toast.success("Invoice deleted");
      router.push("/invoices");
      router.refresh();
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" render={<Link href="/invoices" />}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print / PDF
          </Button>
          <Button render={<Link href={`/invoices/${invoice.id}/edit`} />}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <InvoiceTemplate invoice={invoice} currency={currency} />
    </div>
  );
}
