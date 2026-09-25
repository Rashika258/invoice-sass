import { Invoice } from "@/generated/prisma/client";
import React from "react";

/**
 * Generates a human‑readable explanation for the invoice total calculation.
 * This is a simple placeholder; in a real app you could include tax breakdowns,
 * discounts, and other adjustments.
 */
export function invoiceTotalExplanation(invoice: Invoice): React.ReactNode {
  const lines: string[] = [];
  const subtotal = invoice.subTotal ?? 0;
  const tax = invoice.taxAmount ?? 0;
  const discount = invoice.discount ?? 0;
  const total = invoice.total ?? 0;
  lines.push(`Subtotal: ${subtotal.toFixed(2)}`);
  if (tax) lines.push(`Tax (${invoice.taxRate ?? "%"}): ${tax.toFixed(2)}`);
  if (discount) lines.push(`Discount: -${discount.toFixed(2)}`);
  lines.push(`Total: ${total.toFixed(2)}`);
  return (
    <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
      {lines.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}
