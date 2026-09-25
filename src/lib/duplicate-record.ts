export interface DuplicateInvoiceOptions {
  originalInvoice: Record<string, any>;
  newNumber: string;
}

export function prepareDuplicatedInvoice(originalInvoice: Record<string, any>, newNumber: string) {
  // Strip unique IDs, gateway payment refs, and timestamps
  const {
    id,
    invoiceNumber,
    status,
    paidAmount,
    createdAt,
    updatedAt,
    paymentLink,
    paymentGatewayRef,
    ...rest
  } = originalInvoice;

  return {
    ...rest,
    invoiceNumber: newNumber,
    status: "DRAFT",
    paidAmount: 0,
    date: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000), // Default 7 days due
    items: Array.isArray(rest.items)
      ? rest.items.map(({ id, invoiceId, createdAt, updatedAt, ...itemRest }) => itemRest)
      : [],
  };
}
