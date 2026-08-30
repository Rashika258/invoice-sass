"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { loadInvoices, deleteInvoice } from "../lib/storage";
import type { Invoice } from "../lib/invoices";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    setInvoices(loadInvoices());
  }, []);

  function handleDelete(id: string) {
    if (!confirm("Delete this invoice?")) return;
    deleteInvoice(id);
    setInvoices(loadInvoices());
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Invoices</h2>
        <Link href="/invoices/new" className="px-3 py-2 bg-blue-600 text-white rounded">
          New Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="p-6 bg-white rounded shadow text-center">No invoices yet. Create one.</div>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-4 bg-white rounded shadow flex items-center justify-between">
              <div>
                <div className="font-semibold">{inv.number || "#" + inv.id.slice(0, 6)}</div>
                <div className="text-sm text-zinc-600">To: {inv.to}</div>
              </div>
              <div className="flex gap-2">
                <Link href={`/invoices/${inv.id}`} className="px-2 py-1 border rounded">View</Link>
                <Link href={`/invoices/${inv.id}/edit`} className="px-2 py-1 border rounded">Edit</Link>
                <button onClick={() => handleDelete(inv.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
