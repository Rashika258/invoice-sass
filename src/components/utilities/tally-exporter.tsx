"use client";

import { Download, FileCode, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function TallyExporter({
  companyName,
  sales,
  purchases,
  partiesCount,
}: {
  companyName: string;
  sales: any[];
  purchases: any[];
  partiesCount: number;
}) {
  const downloadSalesXml = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
${sales
  .map(
    (s) => `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>${new Date(s.issueDate).toISOString().slice(0, 10).replace(/-/g, "")}</DATE>
            <VOUCHERNUMBER>${s.invoiceNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${s.customer?.name || "Cash"}</PARTYLEDGERNAME>
            <AMOUNT>-${s.total}</AMOUNT>
          </VOUCHER>
        </TALLYMESSAGE>`,
  )
  .join("\n")}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tally_sales_${companyName.toLowerCase().replace(/\s+/g, "_")}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadPurchasesXml = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
${purchases
  .map(
    (p) => `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Purchase" ACTION="Create">
            <DATE>${new Date(p.issueDate).toISOString().slice(0, 10).replace(/-/g, "")}</DATE>
            <VOUCHERNUMBER>${p.invoiceNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${p.customer?.name || "Supplier"}</PARTYLEDGERNAME>
            <AMOUNT>${p.total}</AMOUNT>
          </VOUCHER>
        </TALLYMESSAGE>`,
  )
  .join("\n")}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tally_purchases_${companyName.toLowerCase().replace(/\s+/g, "_")}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadLedgersCsv = () => {
    const headers = "Ledger Name,Parent Group,Opening Balance,State,Country\n";
    const sampleRows = sales
      .map((s) => `"${s.customer?.name || "Cash"}","Sundry Debtors",0,"${s.companyState || "Delhi"}","India"`)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join("\n");

    const blob = new Blob([headers + sampleRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tally_ledgers_${companyName.toLowerCase().replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 mb-3">
            <FileCode className="size-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Sales Vouchers (XML)</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Export {sales.length} sale invoices formatted for Tally XML import. Includes party names, invoice dates, and totals.
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-border/60">
          <Button
            onClick={downloadSalesXml}
            className="w-full text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
          >
            <Download className="mr-1.5 size-3.5" />
            Download Sales XML
          </Button>
        </div>
      </Card>

      <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 mb-3">
            <FileText className="size-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Purchase Vouchers (XML)</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Export {purchases.length} purchase vouchers for direct import into your accountant&apos;s Tally company file.
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-border/60">
          <Button
            variant="outline"
            onClick={downloadPurchasesXml}
            className="w-full text-xs font-semibold rounded-xl border-border cursor-pointer"
          >
            <Download className="mr-1.5 size-3.5" />
            Download Purchases XML
          </Button>
        </div>
      </Card>

      <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 mb-3">
            <CheckCircle2 className="size-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Master Ledgers (CSV)</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Export customer and vendor ledger accounts with parent groups, opening balances, and addresses.
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-border/60">
          <Button
            variant="outline"
            onClick={downloadLedgersCsv}
            className="w-full text-xs font-semibold rounded-xl border-border cursor-pointer"
          >
            <Download className="mr-1.5 size-3.5" />
            Export Ledgers CSV
          </Button>
        </div>
      </Card>
    </div>
  );
}
