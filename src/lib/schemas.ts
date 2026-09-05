import { z } from "zod";

export const VoucherInputSchema = z.object({
  voucherType: z.enum([
    "PAYMENT",
    "RECEIPT",
    "JOURNAL",
    "CONTRA",
    "SALES",
    "PURCHASE",
    "DEBIT_NOTE",
    "CREDIT_NOTE",
  ]),
  date: z.string().or(z.date()),
  narration: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  entries: z
    .array(
      z.object({
        ledgerId: z.string().min(1),
        type: z.enum(["DR", "CR"]),
        amount: z.number().positive(),
      })
    )
    .min(2),
});

export const LedgerInputSchema = z.object({
  name: z.string().min(1, "Ledger name is required"),
  group: z.string().min(1, "Ledger group is required"),
  openingBalance: z.number().optional().default(0),
  openingType: z.enum(["DR", "CR"]).optional().default("DR"),
  notes: z.string().optional().nullable(),
});

export const ExpenseInputSchema = z.object({
  category: z.string().min(1, "Expense category is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  paymentMode: z.string().optional().default("CASH"),
  referenceNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  date: z.string().or(z.date()).optional(),
});

export const DpdpConsentSchema = z.object({
  entityType: z.enum(["CUSTOMER", "EMPLOYEE"]),
  entityId: z.string().min(1),
  entityName: z.string().min(1),
  contact: z.string().min(1),
  purpose: z.string().min(1),
  status: z.enum(["GRANTED", "WITHDRAWN", "EXPIRED"]),
  grantedAt: z.string().or(z.date()),
  channel: z.string().default("WEB_PORTAL"),
  noticeVersion: z.string().default("v1.0"),
  notes: z.string().optional().nullable(),
});
