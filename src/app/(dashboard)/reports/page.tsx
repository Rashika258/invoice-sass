import { getBusinessSummary, getPartyBalances } from "@/actions/reports";
import { getCompanyProfile } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/invoice-utils";

export default async function ReportsPage() {
  const [summary, parties, profile] = await Promise.all([
    getBusinessSummary(),
    getPartyBalances(),
    getCompanyProfile(),
  ]);
  const currency = profile?.currency ?? "INR";
  const netGst = summary.gstOutward.totalTax - summary.gstInward.totalTax;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Profit & loss, GST summaries, stock, and party outstanding — the reports you need for daily business.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net sales</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{formatCurrency(summary.saleTotal, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net purchases</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{formatCurrency(summary.purchaseTotal, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expenses</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{formatCurrency(summary.expenseTotal, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Profit / Loss</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{formatCurrency(summary.profit, currency)}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>GSTR-1 (outward supplies)</CardTitle></CardHeader>
          <CardContent>
            {summary.gstr1.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sale invoices yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>GST rate</TableHead>
                    <TableHead className="text-right">Taxable</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.gstr1.map((row) => (
                    <TableRow key={row.rate}>
                      <TableCell>{row.rate}%</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.taxable, currency)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.tax, currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>GSTR-3B summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Outward taxable</span><span>{formatCurrency(summary.gstOutward.taxable, currency)}</span></div>
            <div className="flex justify-between"><span>Outward CGST</span><span>{formatCurrency(summary.gstOutward.cgst, currency)}</span></div>
            <div className="flex justify-between"><span>Outward SGST</span><span>{formatCurrency(summary.gstOutward.sgst, currency)}</span></div>
            <div className="flex justify-between"><span>Outward IGST</span><span>{formatCurrency(summary.gstOutward.igst, currency)}</span></div>
            <div className="flex justify-between border-t pt-2"><span>Input tax (purchases)</span><span>{formatCurrency(summary.gstInward.totalTax, currency)}</span></div>
            <div className="flex justify-between font-semibold"><span>Net GST payable</span><span>{formatCurrency(netGst, currency)}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Stock summary</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead className="text-right">Sale price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No items yet.</TableCell></TableRow>
              ) : summary.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.itemType}</TableCell>
                  <TableCell className="text-right">{item.itemType === "SERVICE" ? "—" : item.stockQty}</TableCell>
                  <TableCell className="text-right">{item.minStock}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice, currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Party outstanding</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Party</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">To collect</TableHead>
                <TableHead className="text-right">To pay</TableHead>
                <TableHead className="text-right">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parties.map((party) => (
                <TableRow key={party.id}>
                  <TableCell className="font-medium">{party.name}</TableCell>
                  <TableCell>{party.partyType}</TableCell>
                  <TableCell className="text-right">{formatCurrency(party.receivable, currency)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(party.payable, currency)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(party.balance, currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
