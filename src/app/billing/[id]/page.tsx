import { getInvoice } from '@/actions/invoices';
import { amountToWords } from '@/lib/invoices';
import InvoiceExport from '@/components/InvoiceExport';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const inv = await getInvoice(id);
  if (!inv) return <div className="p-6">Invoice not found</div>;

  const subtotal = inv.subtotal;
  const tax = (inv.cgstAmount || 0) + (inv.sgstAmount || 0) + (inv.igstAmount || 0);
  const total = inv.total;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-end gap-2 mb-4">
        <InvoiceExport invoice={inv} />
      </div>

      <div id="invoice-pdf" className="p-6 bg-white rounded shadow" style={{ width: 842 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ width: 120, height: 120, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>LOGO</div>
          </div>

          <div style={{ flex: 1, paddingLeft: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#7b1111' }}>{inv.company?.name || 'Company'}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>{inv.company?.address}</div>
            <div style={{ marginTop: 6, fontSize: 12 }}><strong>Mob:</strong> {inv.company?.phone} &nbsp; <strong>GSTIN:</strong> {inv.company?.gstin}</div>
          </div>

          <div style={{ width: 260, textAlign: 'right' }}>
            <div style={{ fontWeight: 700 }}>TAX INVOICE</div>
            <div style={{ marginTop: 8, border: '1px solid #333', padding: 8 }}>
              <div><strong>State:</strong> {inv.company?.state}</div>
              <div><strong>Code:</strong> {inv.company?.code}</div>
              <div style={{ marginTop: 6 }}><strong>Invoice No:</strong> {inv.invoiceNumber ?? inv.id.slice(0,6)}</div>
              <div><strong>Date:</strong> {inv.issueDate?.toISOString().slice(0,10)}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <div style={{ flex: 1, border: '1px solid #333', padding: 8 }}>
            <div style={{ fontWeight: 700 }}>To / Bill To</div>
            <div style={{ minHeight: 60, whiteSpace: 'pre-wrap' }}>{inv.customer?.name}\n{inv.customer?.address}</div>
            <div style={{ marginTop: 8 }}><strong>Party's GSTIN:</strong> {inv.customer?.gstin || '---'}</div>
            <div style={{ marginTop: 4 }}><strong>Despatch Details:</strong> {inv.notes || '---'}</div>
          </div>

          <div style={{ width: 320, border: '1px solid #333', padding: 8 }}>
            <div style={{ fontSize: 13 }}><strong>Invoice Info</strong></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
              <div><strong>D.C. No.</strong></div>
              <div>---</div>
              <div><strong>Party's Order No.</strong></div>
              <div>---</div>
              <div><strong>E-way Bill</strong></div>
              <div>---</div>
              <div><strong>Vehicle No.</strong></div>
              <div>---</div>
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ padding: 6, textAlign: 'left' }}>Sl. No</th>
              <th style={{ padding: 6, textAlign: 'left' }}>DESCRIPTION</th>
              <th style={{ padding: 6, textAlign: 'left' }}>HSN Code</th>
              <th style={{ padding: 6, textAlign: 'right' }}>Qty</th>
              <th style={{ padding: 6, textAlign: 'right' }}>Rate</th>
              <th style={{ padding: 6, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.lines.map((it, idx) => (
              <tr key={it.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 6 }}>{idx + 1}</td>
                <td style={{ padding: 6 }}>{it.description}</td>
                <td style={{ padding: 6 }}>{it.hsn || ''}</td>
                <td style={{ padding: 6, textAlign: 'right' }}>{it.quantity}</td>
                <td style={{ padding: 6, textAlign: 'right' }}>{it.rate.toFixed(2)}</td>
                <td style={{ padding: 6, textAlign: 'right' }}>{(it.amount || (it.quantity * it.rate)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <div style={{ width: 260, border: '1px solid #333', padding: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Amount</span><span>{subtotal.toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CGST</span><span>{(inv.cgstAmount || 0).toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>SGST</span><span>{(inv.sgstAmount || 0).toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 8 }}><span>Grand Total</span><span>{total.toFixed(2)}</span></div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div><strong>Rupees in words:</strong></div>
          <div style={{ minHeight: 40 }}>{amountToWords(total)}</div>
        </div>

      </div>
    </div>
  );
}
