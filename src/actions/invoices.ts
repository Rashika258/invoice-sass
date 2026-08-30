import { prisma } from '../lib/prisma';
import type { Invoice } from '@prisma/client';

export async function listInvoices() {
  return prisma.invoice.findMany({ include: { customer: true, lines: true }, orderBy: { createdAt: 'desc' } });
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({ where: { id }, include: { customer: true, lines: true, company: true } });
}

export async function createInvoice(data: Partial<Invoice> & { lines?: any[] }) {
  // compute subtotal and amounts
  const lines = data.lines || [];
  const subtotal = lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.rate) || 0), 0);
  const taxPercent = Number(data.taxPercent) || 0;
  const taxAmount = (subtotal * taxPercent) / 100;
  const total = subtotal + taxAmount;

  // simple cgst/sgst split for intrastate
  const cgst = taxAmount / 2;
  const sgst = taxAmount / 2;

  // Auto-increment invoiceNumber per company if not provided
  let invoiceNumber: number | undefined = data.invoiceNumber ?? undefined;
  if (!invoiceNumber) {
    const whereClause: any = {};
    if (data.companyId) whereClause.companyId = data.companyId;
    // find current max
    const agg: any = await prisma.invoice.aggregate({ _max: { invoiceNumber: true }, where: whereClause });
    const maxNum = agg._max?.invoiceNumber || 0;
    invoiceNumber = (maxNum || 0) + 1;
  }

  const created = await prisma.invoice.create({
    data: {
      invoiceNumber: invoiceNumber,
      userId: data.userId,
      companyId: data.companyId,
      customerId: data.customerId,
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      taxPercent: taxPercent,
      subtotal,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: 0,
      total,
      notes: data.notes,
      lines: {
        create: lines.map((l) => ({ description: l.description || '', hsn: l.hsn || '', quantity: Number(l.quantity) || 0, rate: Number(l.rate) || 0, amount: (Number(l.quantity) || 0) * (Number(l.rate) || 0) })),
      },
    },
    include: { lines: true },
  });

  return created;
}
