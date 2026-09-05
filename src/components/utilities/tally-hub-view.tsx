"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  Upload,
  FileCode,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  UploadCloud,
  Package,
  Users,
  FileSpreadsheet,
  Zap,
  Info,
  BookOpen,
  Server,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { importTallyXmlData } from "@/actions/tally-integration";

interface TallyHubViewProps {
  companyName: string;
  sales: any[];
  purchases: any[];
  partiesCount: number;
}

export function TallyHubView({ companyName, sales, purchases, partiesCount }: TallyHubViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "export" | "import" | "guide">("overview");
  const [uploading, setUploading] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // ── XML Generation helpers ──────────────────────────────────────────────────
  const buildSalesXml = () => `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES><SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY></STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
${sales
  .map(
    (s) => `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>${new Date(s.issueDate).toISOString().slice(0, 10).replace(/-/g, "")}</DATE>
            <VOUCHERNUMBER>${s.invoiceNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${s.customer?.name || "Cash"}</PARTYLEDGERNAME>
            <NARRATION>${s.notes || ""}</NARRATION>
            <AMOUNT>-${s.total.toFixed(2)}</AMOUNT>
            <TAXAMOUNT>${s.taxAmount?.toFixed(2) || "0.00"}</TAXAMOUNT>
          </VOUCHER>
        </TALLYMESSAGE>`,
  )
  .join("\n")}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  const buildPurchasesXml = () => `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES><SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY></STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
${purchases
  .map(
    (p) => `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Purchase" ACTION="Create">
            <DATE>${new Date(p.issueDate).toISOString().slice(0, 10).replace(/-/g, "")}</DATE>
            <VOUCHERNUMBER>${p.invoiceNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${p.customer?.name || "Supplier"}</PARTYLEDGERNAME>
            <AMOUNT>${p.total.toFixed(2)}</AMOUNT>
          </VOUCHER>
        </TALLYMESSAGE>`,
  )
  .join("\n")}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  const buildLedgersCsv = () => {
    const header = "Ledger Name,Parent Group,Opening Balance,State,Country,GSTIN\n";
    const uniqueParties = sales
      .map((s) => s.customer)
      .filter(Boolean)
      .filter((v, i, a) => a.findIndex((x) => x?.id === v?.id) === i);
    const rows = uniqueParties
      .map((c) => `"${c.name}","Sundry Debtors",0,"Karnataka","India","${c.taxId || ""}"`)
      .join("\n");
    return header + rows;
  };

  const buildItemsMaster = () => {
    const header = "Stock Item,Unit,GST Rate,HSN Code,Opening Qty,Opening Rate\n";
    return header + "/* Export your items from Products → Export Items for Tally master */\n";
  };

  const triggerDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filename} downloaded!`);
  };

  const downloadAll = () => {
    setDownloadingAll(true);
    setTimeout(() => {
      const slug = companyName.toLowerCase().replace(/\s+/g, "_");
      triggerDownload(buildSalesXml(), `billora_sales_${slug}.xml`, "application/xml");
      setTimeout(() => triggerDownload(buildPurchasesXml(), `billora_purchases_${slug}.xml`, "application/xml"), 300);
      setTimeout(() => triggerDownload(buildLedgersCsv(), `billora_ledgers_${slug}.csv`, "text/csv"), 600);
      setDownloadingAll(false);
    }, 500);
  };

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "export" as const, label: "Export → Tally" },
    { id: "import" as const, label: "Import ← Tally" },
    { id: "guide" as const, label: "Setup Guide" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Tally Integration Hub
            </h1>
            <Badge className="bg-brand text-white border-none font-bold text-xs">
              Tally Prime / ERP 9
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bidirectional sync with Tally — export sales, purchase &amp; ledger vouchers, or import master data from Tally XML.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={downloadAll}
            disabled={downloadingAll}
            className="h-8 rounded-xl bg-brand hover:opacity-90 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            <Download className={`mr-1.5 size-3.5 ${downloadingAll ? "animate-bounce" : ""}`} />
            {downloadingAll ? "Preparing..." : "Export All Files"}
          </Button>
        </div>
      </div>

      {/* ── Tab Nav ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-border/60 pb-1 text-xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "border-brand text-brand bg-brand-light font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Sale Vouchers", value: sales.length, color: "text-brand" },
              { label: "Purchase Vouchers", value: purchases.length, color: "text-amber-500" },
              { label: "Ledger Parties", value: partiesCount, color: "text-sky-500" },
              { label: "Export Formats", value: "3 Types", color: "text-emerald-500" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
                <div className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] text-muted-foreground font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 w-fit"><FileCode className="size-5" /></div>
              <h3 className="text-sm font-bold text-foreground">Export Sales XML</h3>
              <p className="text-xs text-muted-foreground">{sales.length} sale invoices → Tally Sales Voucher XML. Import directly via Tally Gateway.</p>
              <Button size="sm" onClick={() => triggerDownload(buildSalesXml(), `billora_sales.xml`, "application/xml")} className="bg-brand text-white text-xs font-bold rounded-xl shadow-xs w-full">
                <Download className="mr-1.5 size-3.5" /> Download Sales XML
              </Button>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit"><FileText className="size-5" /></div>
              <h3 className="text-sm font-bold text-foreground">Export Purchases XML</h3>
              <p className="text-xs text-muted-foreground">{purchases.length} purchase bills → Tally Purchase Voucher XML for your CA.</p>
              <Button variant="outline" size="sm" onClick={() => triggerDownload(buildPurchasesXml(), `billora_purchases.xml`, "application/xml")} className="text-xs font-bold rounded-xl border-border w-full">
                <Download className="mr-1.5 size-3.5" /> Download Purchases XML
              </Button>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit"><CheckCircle2 className="size-5" /></div>
              <h3 className="text-sm font-bold text-foreground">Export Ledgers CSV</h3>
              <p className="text-xs text-muted-foreground">Customer &amp; vendor master ledgers with GSTIN, parent group &amp; opening balance.</p>
              <Button variant="outline" size="sm" onClick={() => triggerDownload(buildLedgersCsv(), `billora_ledgers.csv`, "text/csv")} className="text-xs font-bold rounded-xl border-border w-full">
                <Download className="mr-1.5 size-3.5" /> Export Ledgers CSV
              </Button>
            </div>
          </div>

          {/* Import section */}
          <div className="p-5 rounded-2xl border-2 border-dashed border-border bg-card/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-light text-brand shrink-0"><UploadCloud className="size-5" /></div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Import From Tally</h3>
                <p className="text-xs text-muted-foreground">Upload Tally Prime XML export to migrate master ledgers, stock items, and opening balances into Billora.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("import")}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer"
            >
              <span>Start Import</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── EXPORT → TALLY ──────────────────────────────────────────────────── */}
      {activeTab === "export" && (
        <div className="space-y-6 max-w-5xl">
          <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-brand-light text-brand shrink-0"><Download className="size-5" /></div>
            <div>
              <h3 className="text-base font-bold text-foreground">Export Billora Data → Tally Prime / ERP 9</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                All generated XML files conform to Tally's ODBC/HTTP data exchange format. Open Tally → Gateway of Tally → Import Data → Browse to the downloaded file.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Sales Vouchers",
                desc: `${sales.length} invoices with party names, amounts, GST breakup, and invoice numbers.`,
                count: sales.length,
                color: "bg-purple-500/10 text-purple-500",
                icon: FileCode,
                format: "XML",
                action: () => triggerDownload(buildSalesXml(), `billora_sales_${companyName.replace(/\s+/g, "_")}.xml`, "application/xml"),
              },
              {
                title: "Purchase Vouchers",
                desc: `${purchases.length} purchase bills with supplier names, amounts, and payment status.`,
                count: purchases.length,
                color: "bg-sky-500/10 text-sky-500",
                icon: FileText,
                format: "XML",
                action: () => triggerDownload(buildPurchasesXml(), `billora_purchases_${companyName.replace(/\s+/g, "_")}.xml`, "application/xml"),
              },
              {
                title: "Master Ledgers",
                desc: `${partiesCount} party accounts with GSTIN, parent group, and state for Sundry Debtors/Creditors.`,
                count: partiesCount,
                color: "bg-emerald-500/10 text-emerald-500",
                icon: CheckCircle2,
                format: "CSV",
                action: () => triggerDownload(buildLedgersCsv(), `billora_ledgers_${companyName.replace(/\s+/g, "_")}.csv`, "text/csv"),
              },
              {
                title: "Stock Items Master",
                desc: "All inventory items with HSN, GST rate, unit of measure, and opening stock quantities.",
                count: null,
                color: "bg-amber-500/10 text-amber-500",
                icon: Package,
                format: "CSV",
                action: () => triggerDownload(buildItemsMaster(), `billora_items.csv`, "text/csv"),
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-5 rounded-2xl border border-border bg-card space-y-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${item.color} w-fit`}><Icon className="size-4" /></div>
                    <Badge variant="outline" className="text-[10px] font-mono">{item.format}</Badge>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={item.action}
                    className="text-xs font-bold rounded-xl border-border w-full mt-auto cursor-pointer"
                  >
                    <Download className="mr-1.5 size-3.5" />
                    Download {item.format}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* How to import into Tally */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Info className="size-4 text-brand" />
              How to Import XML Into Tally Prime
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              {[
                { step: "1", text: "Open Tally Prime and select your Company" },
                { step: "2", text: 'Go to "Gateway of Tally" → "Import Data"' },
                { step: "3", text: 'Click "Vouchers" and browse to downloaded XML file' },
                { step: "4", text: "Press Enter → Tally automatically posts all vouchers" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30">
                  <div className="size-5 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold shrink-0">{s.step}</div>
                  <p className="text-muted-foreground leading-tight">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── IMPORT ← TALLY ──────────────────────────────────────────────────── */}
      {activeTab === "import" && (
        <div className="space-y-6 max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-brand-light text-brand shrink-0"><Upload className="size-5" /></div>
            <div>
              <h3 className="text-base font-bold text-foreground">Import Tally Master Data → Billora</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Migrate your existing Tally company's ledgers, stock items, and opening balances into Billora without re-entering data.
              </p>
            </div>
          </div>

          {/* What can be imported */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h4 className="text-sm font-bold text-foreground">What Gets Imported</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { icon: Users, label: "Customers & Suppliers", desc: "Party names, GSTINs, phone, addresses, and opening balances" },
                { icon: Package, label: "Stock Items & Inventory", desc: "Item names, HSN codes, units, GST rates, and opening quantities" },
                { icon: FileSpreadsheet, label: "Opening Balances", desc: "Ledger opening debit/credit balances for trial balance continuity" },
                { icon: BookOpen, label: "Chart of Accounts", desc: "Your existing Tally parent groups and custom ledger names" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                    <Icon className="size-4 text-brand mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-foreground">{item.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload area */}
          <label className="p-10 rounded-2xl border-2 border-dashed border-border bg-card/50 text-center space-y-4 cursor-pointer hover:border-brand hover:bg-brand-light transition-all block">
            <input
              type="file"
              accept=".xml,.txt"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const text = await file.text();
                  const res = await importTallyXmlData(text);
                  toast.success(
                    `Imported ${res.ledgersImported} ledgers and processed ${res.vouchersFound} vouchers from Tally XML!`,
                  );
                } catch (err: any) {
                  toast.error(`Failed to parse Tally file: ${err.message}`);
                } finally {
                  setUploading(false);
                }
              }}
            />
            <div className="p-4 rounded-full bg-brand-light text-brand w-fit mx-auto">
              <UploadCloud className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                {uploading ? "Parsing Tally XML..." : "Drop Tally Master Export Here"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Export from Tally: <code className="bg-muted px-1 rounded text-[10px]">Gateway → Export → Masters → XML</code>.
                Supported: <strong>.xml</strong>, <strong>.txt</strong>
              </p>
            </div>
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-brand text-xs font-semibold">
                <RefreshCw className="size-4 animate-spin" />
                <span>Parsing XML schema...</span>
              </div>
            ) : (
              <div className="inline-flex items-center justify-center px-4 py-2 bg-brand text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer">
                <Upload className="mr-1.5 size-3.5" />
                Select Tally File
              </div>
            )}
          </label>

          {/* Export steps from Tally */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <BookOpen className="size-4 text-brand" />
              How to Export Masters from Tally Prime
            </h4>
            <div className="space-y-2 text-xs">
              {[
                'Open Tally Prime → Select your company',
                'Press "Alt + E" OR go to Gateway → Export',
                'Select "Masters" from the export menu',
                'Format: XML (Tally XML Data) → Press Enter',
                'Note the saved file path and upload it here',
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-muted-foreground">
                  <div className="size-4 rounded-full bg-muted text-foreground flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SETUP GUIDE ─────────────────────────────────────────────────────── */}
      {activeTab === "guide" && (
        <div className="space-y-6 max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BookOpen className="size-4 text-brand" />
              Complete Tally ↔ Billora Integration Guide
            </h3>

            <div className="space-y-4">
              {[
                {
                  title: "One-Time Migration (Tally → Billora)",
                  badge: "Recommended for new users",
                  badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                  steps: [
                    "Export your Tally masters (ledgers + stock items + opening balances) as XML",
                    "Upload them in the Import tab above — Billora auto-maps them",
                    "Review imported data → confirm and publish",
                    "Start billing in Billora from the next financial day",
                  ],
                },
                {
                  title: "Monthly CA Handoff (Billora → Tally)",
                  badge: "For CA accountants",
                  badgeClass: "bg-sky-500/10 text-sky-600 border-sky-500/20",
                  steps: [
                    "At month-end, go to Export tab and download all three files",
                    "Email the ZIP bundle to your Chartered Accountant",
                    "CA imports Sales XML + Purchase XML into their Tally company",
                    "Ledger CSV helps CA verify party-wise balances",
                  ],
                },
                {
                  title: "Parallel Operation (Both systems simultaneously)",
                  badge: "Advanced",
                  badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
                  steps: [
                    "Bill daily from Billora (faster, mobile-ready)",
                    "Export weekly Tally XMLs for your CA's reconciliation",
                    "Use Billora reports for GST filing (GSTR-1, GSTR-3B)",
                    "Use Tally only for legacy ledger adjustments",
                  ],
                },
              ].map((section) => (
                <div key={section.title} className="rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-foreground">{section.title}</h4>
                    <Badge variant="outline" className={`text-[10px] font-semibold ${section.badgeClass}`}>
                      {section.badge}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    {section.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-3.5 text-brand shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/5 p-5 flex items-start gap-3">
            <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-amber-600 dark:text-amber-400">Important Notes</div>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>Always take a Tally backup before importing external XML files</li>
                <li>Duplicate voucher numbers may cause conflicts in Tally — review before import</li>
                <li>XML format tested on Tally Prime 3.x and ERP 9 (Release 6.6+)</li>
                <li>GST tax breakup columns require Tally Prime's GST module to be activated</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
