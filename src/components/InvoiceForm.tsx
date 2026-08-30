"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import type { Invoice, LineItem } from "../lib/invoices";
import { saveInvoice, getInvoice } from "../lib/storage";
import { calculateSubtotal, calculateTotal, calculateTaxAmount } from "../lib/invoices";

type Props = {
  id?: string | null;
};

export default function InvoiceForm({ id }: Props) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice>({
    id: uuidv4(),
    number: undefined,
    date: new Date().toISOString().slice(0, 10),
    dueDate: undefined,
    from: "",
    to: "",
    taxPercent: 0,
    items: [
      { id: uuidv4(), description: "", quantity: 1, rate: 0 },
    ],
    notes: "",
  });

  useEffect(() => {
    if (id) {
      const existing = getInvoice(id);
      if (existing) setInvoice(existing);
    }
  }, [id]);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setInvoice((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], ...patch };
      return { ...prev, items };
    });
  }

  function addItem() {
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, { id: uuidv4(), description: "", quantity: 1, rate: 0 }],
    }));
  }

  function removeItem(index: number) {
    setInvoice((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }

  function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    saveInvoice(invoice);
    router.push("/invoices");
  }

  const subtotal = calculateSubtotal(invoice.items);
  const tax = calculateTaxAmount(subtotal, invoice.taxPercent);
  const total = calculateTotal(invoice.items, invoice.taxPercent);

  return (
    <form className="max-w-3xl mx-auto p-6 bg-white rounded shadow" onSubmit={handleSave}>
      <div className="flex gap-4 mb-4">
        <input
          value={invoice.number || ""}
          onChange={(e) => setInvoice({ ...invoice, number: e.target.value })}
          placeholder="Invoice number"
          className="border p-2 flex-1"
        />
        <input
          type="date"
          value={invoice.date || ""}
          onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
          className="border p-2"
        />
        <input
          type="date"
          value={invoice.dueDate || ""}
          onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
          className="border p-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <textarea
          value={invoice.from || ""}
          onChange={(e) => setInvoice({ ...invoice, from: e.target.value })}
          placeholder="From (your company)"
          className="border p-2"
        />
        <textarea
          value={invoice.to || ""}
          onChange={(e) => setInvoice({ ...invoice, to: e.target.value })}
          placeholder="To (client)"
          className="border p-2"
        />
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Items</h3>
        <div className="space-y-2">
          {invoice.items.map((it, i) => (
            <div key={it.id} className="flex gap-2 items-center">
              <input
                className="flex-1 border p-2"
                placeholder="Description"
                value={it.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
              />
              <input
                type="number"
                className="w-24 border p-2"
                value={it.quantity}
                onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
              />
              <input
                type="number"
                className="w-32 border p-2"
                value={it.rate}
                onChange={(e) => updateItem(i, { rate: Number(e.target.value) })}
              />
              <button type="button" onClick={() => removeItem(i)} className="px-2 py-1 bg-red-500 text-white rounded">
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <button type="button" onClick={addItem} className="px-3 py-1 bg-green-600 text-white rounded">
            Add item
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center mb-4">
        <label className="flex items-center gap-2">
          Tax %
          <input
            type="number"
            value={invoice.taxPercent ?? 0}
            onChange={(e) => setInvoice({ ...invoice, taxPercent: Number(e.target.value) })}
            className="w-24 border p-2"
          />
        </label>
        <div className="ml-auto text-right">
          <div>Subtotal: {subtotal.toFixed(2)}</div>
          <div>Tax: {tax.toFixed(2)}</div>
          <div className="font-semibold">Total: {total.toFixed(2)}</div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => router.push('/invoices')} className="px-4 py-2 border rounded">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Save Invoice
        </button>
      </div>
    </form>
  );
}
