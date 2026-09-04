import type { Prisma } from "@/generated/prisma/client";
import { DOCUMENT_META } from "@/lib/documents";
import type { DocumentType } from "@/generated/prisma/client";

type Tx = Prisma.TransactionClient;

const SERIES: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(DOCUMENT_META).map(([key, meta]) => [key, meta.prefix]),
  ),
  PAYMENT_IN: "RCPT",
  PAYMENT_OUT: "PYMT",
  EXPENSE: "EXP",
};

export async function nextNumber(tx: Tx, organizationId: string, key: string) {
  const prefix = SERIES[key] ?? key.slice(0, 3).toUpperCase();
  const series = await tx.numberSeries.upsert({
    where: { organizationId_key: { organizationId, key } },
    create: { organizationId, key, prefix, nextNumber: 1 },
    update: {},
  });

  const number = `${series.prefix}-${String(series.nextNumber).padStart(4, "0")}`;
  await tx.numberSeries.update({
    where: { id: series.id },
    data: { nextNumber: { increment: 1 } },
  });
  return number;
}

export async function nextDocumentNumber(
  tx: Tx,
  organizationId: string,
  documentType: DocumentType,
  invoicePrefix?: string,
) {
  if (documentType === "SALE" && invoicePrefix) {
    const series = await tx.numberSeries.upsert({
      where: { organizationId_key: { organizationId, key: "SALE" } },
      create: { organizationId, key: "SALE", prefix: invoicePrefix, nextNumber: 1 },
      update: {},
    });
    const number = `${series.prefix}-${String(series.nextNumber).padStart(4, "0")}`;
    await tx.numberSeries.update({
      where: { id: series.id },
      data: { nextNumber: { increment: 1 } },
    });
    return number;
  }
  return nextNumber(tx, organizationId, documentType);
}
