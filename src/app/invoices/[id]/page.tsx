import React from "react";
import InvoiceForm from "../../../components/InvoiceForm";
import InvoiceView from "../../../components/InvoiceView";

export async function generateStaticParams() {
  return [];
}

export default function InvoicePage({ params, searchParams }: { params: { id: string } }) {
  const { id } = params;

  if (id === 'new') {
    return <InvoiceForm />;
  }

  // For edit route: /invoices/:id/edit
  if (typeof searchParams === 'object' && (searchParams as any).edit) {
    return <InvoiceForm id={id} />;
  }

  return <InvoiceView id={id} />;
}
