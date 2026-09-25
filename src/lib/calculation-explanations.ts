import { Invoice } from "@/generated/prisma/client";
import React from "react";

/**
 * Generates a human‑readable explanation for the invoice total calculation.
 */
export function invoiceTotalExplanation(invoice: Invoice): React.ReactNode {
  const lines: string[] = [];
  const subtotal = invoice.subtotal ?? 0;
  const tax = invoice.taxAmount ?? 0;
  const discount = invoice.discount ?? 0;
  const total = invoice.total ?? 0;

  lines.push(`Subtotal: ₹${subtotal.toFixed(2)}`);
  if (tax) lines.push(`Tax (${invoice.taxRate ?? 0}%): ₹${tax.toFixed(2)}`);
  if (discount) lines.push(`Discount: -₹${discount.toFixed(2)}`);
  lines.push(`Total: ₹${total.toFixed(2)}`);

  return React.createElement(
    "ul",
    { className: "list-disc pl-5 space-y-1 text-xs text-muted-foreground" },
    lines.map((l, i) => React.createElement("li", { key: i }, l))
  );
}
