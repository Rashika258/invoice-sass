"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeAlert,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  HelpCircle,
  Info,
  Lock,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Truck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  type ComplianceSummary,
  addOrUpdateConsentRecordAction,
  toggleConsentStatusAction,
} from "@/actions/compliance";
import { type DpdpConsentPurpose, type DpdpConsentRecord } from "@/lib/compliance-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/invoice-utils";

export function ComplianceView({ initialData }: { initialData: ComplianceSummary }) {
  const [data, setData] = useState<ComplianceSummary>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [purposeFilter, setPurposeFilter] = useState<string>("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Consent Form State
  const [entityType, setEntityType] = useState<"CUSTOMER" | "EMPLOYEE">("CUSTOMER");
  const [entityName, setEntityName] = useState("");
  const [contact, setContact] = useState("");
  const [purpose, setPurpose] = useState<DpdpConsentPurpose>("TRANSACTIONAL_INVOICES");
  const [channel, setChannel] = useState("WhatsApp Opt-in");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "GRANTED" ? "WITHDRAWN" : "GRANTED";
    try {
      await toggleConsentStatusAction(id, newStatus);
      setData((prev) => ({
        ...prev,
        consentRecords: prev.consentRecords.map((r) =>
          r.id === id ? { ...r, status: newStatus } : r
        ),
        dpdpStats: {
          ...prev.dpdpStats,
          totalActive:
            newStatus === "GRANTED"
              ? prev.dpdpStats.totalActive + 1
              : prev.dpdpStats.totalActive - 1,
          withdrawn:
            newStatus === "WITHDRAWN"
              ? prev.dpdpStats.withdrawn + 1
              : prev.dpdpStats.withdrawn - 1,
        },
      }));
      toast.success(`Consent status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update consent status");
    }
  };

  const handleCreateConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityName.trim() || !contact.trim()) {
      toast.error("Entity Name and Contact are required");
      return;
    }

    setSaving(true);
    try {
      const created = await addOrUpdateConsentRecordAction({
        entityType,
        entityId: `ent-${Date.now()}`,
        entityName,
        contact,
        purpose,
        channel,
        notes,
      });

      setData((prev) => ({
        ...prev,
        consentRecords: [created, ...prev.consentRecords],
        dpdpStats: {
          ...prev.dpdpStats,
          totalActive: prev.dpdpStats.totalActive + 1,
        },
      }));

      toast.success("DPDP Consent record logged successfully");
      setIsAddOpen(false);
      setEntityName("");
      setContact("");
      setNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to log consent");
    } finally {
      setSaving(false);
    }
  };

  const handleExportJson = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      statutoryFramework: "DPDP Act 2023 (Digital Personal Data Protection)",
      organizationGstin: data.companyGstin || "UNREGISTERED",
      consentLedger: data.consentRecords,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DPDP-Consent-Audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("DPDP Consent Audit JSON exported");
  };

  // Filtered records
  const filteredRecords = data.consentRecords.filter((r) => {
    const matchesSearch =
      r.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.channel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesPurpose = purposeFilter === "ALL" || r.purpose === purposeFilter;
    return matchesSearch && matchesStatus && matchesPurpose;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                <span>GST &amp; DPDP Compliance Engine</span>
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none text-[10px] font-bold">
                  2026 STATUTORY
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time GST turnover threshold monitor, 30-day IRP rule alert &amp; DPDP Act consent ledger
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <Download className="size-3.5" />
            <span>Export DPDP Audit JSON</span>
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="h-8 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="size-3.5" />
                  <span>Log Consent</span>
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Lock className="size-4 text-emerald-600" />
                  <span>Record DPDP Act Consent</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Record verifiable consent under the Digital Personal Data Protection Act, 2023.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateConsent} className="space-y-3.5 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Entity Type</Label>
                    <Select
                      value={entityType}
                      onValueChange={(val) => {
                        if (val === "CUSTOMER" || val === "EMPLOYEE") setEntityType(val);
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUSTOMER">Customer / Client</SelectItem>
                        <SelectItem value="EMPLOYEE">Employee / Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Purpose</Label>
                    <Select
                      value={purpose}
                      onValueChange={(val) => {
                        if (val) setPurpose(val as DpdpConsentPurpose);
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRANSACTIONAL_INVOICES">Transactional Invoices</SelectItem>
                        <SelectItem value="PAYMENT_REMINDERS">Payment Reminders (UPI)</SelectItem>
                        <SelectItem value="MARKETING_OFFERS">Marketing / Catalog</SelectItem>
                        <SelectItem value="BIOMETRIC_ATTENDANCE">Biometrics (Face/Finger)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    placeholder="e.g. Ramesh Hardware or Anand Kumar"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Phone / Email</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Channel / Verification Method</Label>
                  <Input
                    placeholder="e.g. WhatsApp Opt-in, Store Counter, Biometric Kiosk"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Audit Notes (Optional)</Label>
                  <Input
                    placeholder="e.g. Authorized digital invoice PDF and WhatsApp UPI payment notifications"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={saving}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    {saving ? "Saving..." : "Record Consent"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Annual Turnover */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              FY 2026-27 Turnover
            </CardTitle>
            <ShieldCheck className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-black font-mono text-foreground">
              {formatCurrency(data.turnover, "INR")}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-[10px] font-mono">
                {data.isGstRegistered ? "GST Registered" : "Composition / Regular"}
              </Badge>
              <span>({data.companyGstin || "Unregistered"})</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Goods Threshold */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              GST Threshold (Goods)
            </CardTitle>
            <Truck className="size-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-foreground">
                {Math.round(data.goodsProgress)}% of ₹40.00L
              </span>
              <span className="text-[10px] text-muted-foreground">Limit: ₹40L</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  data.goodsProgress >= 100
                    ? "bg-rose-500"
                    : data.goodsProgress > 80
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, data.goodsProgress)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground pt-0.5">
              {data.goodsExceeded
                ? "Mandatory GST Registration required!"
                : `₹${((4000000 - data.turnover) / 100000).toFixed(1)}L remaining before threshold`}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: E-Invoicing Threshold */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mandatory E-Invoice
            </CardTitle>
            <FileCheck className="size-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-foreground">
                {data.eInvoicingProgress.toFixed(1)}% of ₹5.00 Cr
              </span>
              <Badge variant="secondary" className="text-[9px]">
                B2B Mandatory
              </Badge>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.min(100, data.eInvoicingProgress)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground pt-0.5">
              Mandatory IRN reporting on govt portal if turnover &gt; ₹5 Cr
            </p>
          </CardContent>
        </Card>

        {/* Card 4: DPDP Consents */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              DPDP Act Consents
            </CardTitle>
            <UserCheck className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {data.dpdpStats.totalActive} Active
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>{data.dpdpStats.biometricConsents} Biometrics</span>
              <span>•</span>
              <span>{data.dpdpStats.customerConsents} Customers</span>
              {data.dpdpStats.withdrawn > 0 && (
                <>
                  <span>•</span>
                  <span className="text-rose-500">{data.dpdpStats.withdrawn} Revoked</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="thresholds" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="thresholds" className="text-xs font-semibold gap-1.5">
            <Shield className="size-3.5" />
            <span>GST &amp; E-Invoicing Thresholds</span>
          </TabsTrigger>
          <TabsTrigger value="irp" className="text-xs font-semibold gap-1.5">
            <Clock className="size-3.5" />
            <span>30-Day IRP Rule Auditor</span>
            {data.irpAuditList.filter((i) => i.isOverdue).length > 0 && (
              <Badge className="ml-1 bg-rose-500 text-white text-[9px] px-1 py-0 h-4">
                {data.irpAuditList.filter((i) => i.isOverdue).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="dpdp" className="text-xs font-semibold gap-1.5">
            <Lock className="size-3.5" />
            <span>DPDP Act Consent Ledger</span>
            <Badge variant="secondary" className="ml-1 text-[9px] px-1 py-0 h-4">
              {data.consentRecords.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rules" className="text-xs font-semibold gap-1.5">
            <Info className="size-3.5" />
            <span>Statutory Rule Book (2026)</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: GST & E-Invoicing Thresholds */}
        <TabsContent value="thresholds" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Goods Threshold Card */}
            <Card className="shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Truck className="size-4 text-emerald-600" />
                    <span>Sale of Goods Threshold (₹40,00,000)</span>
                  </CardTitle>
                  <Badge
                    className={
                      data.goodsExceeded
                        ? "bg-rose-500/15 text-rose-600 border-none"
                        : "bg-emerald-500/15 text-emerald-600 border-none"
                    }
                  >
                    {data.goodsExceeded ? "MANDATORY REGISTRATION" : "WITHIN EXEMPTION"}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Section 22 of CGST Act. Businesses exclusively engaged in goods supply in standard states are exempt up to ₹40 Lakhs turnover.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Current Gross Turnover</span>
                    <span className="font-mono font-bold">{formatCurrency(data.turnover, "INR")}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Exemption Limit</span>
                    <span className="font-mono font-bold">₹40,00,000.00</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, data.goodsProgress)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Threshold Card */}
            <Card className="shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <span>Supply of Services Threshold (₹20,00,000)</span>
                  </CardTitle>
                  <Badge
                    className={
                      data.servicesExceeded
                        ? "bg-rose-500/15 text-rose-600 border-none"
                        : "bg-emerald-500/15 text-emerald-600 border-none"
                    }
                  >
                    {data.servicesExceeded ? "MANDATORY REGISTRATION" : "WITHIN EXEMPTION"}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  For service providers and mixed suppliers, mandatory GST registration applies once turnover exceeds ₹20 Lakhs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Current Gross Turnover</span>
                    <span className="font-mono font-bold">{formatCurrency(data.turnover, "INR")}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Services Exemption Limit</span>
                    <span className="font-mono font-bold">₹20,00,000.00</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, data.servicesProgress)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* E-Way Bill Tracker Card */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="size-4 text-emerald-600" />
                  <CardTitle className="text-sm font-bold">E-Way Bill Compliance (Consignments &gt; ₹50,000)</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  Rule 138 CGST
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Under GST Rule 138, every registered person who causes movement of goods of consignment value exceeding ₹50,000 must generate an e-Way Bill before transportation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-border bg-card">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">Eligible Invoices</span>
                  <div className="text-lg font-mono font-bold mt-1">{data.eWayBillEligibleCount} bills</div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">Total Consignment Value</span>
                  <div className="text-lg font-mono font-bold mt-1 text-emerald-600">
                    {formatCurrency(data.totalEWayBillValue, "INR")}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card flex flex-col justify-center">
                  <Link
                    href="/invoices"
                    className="inline-flex items-center justify-between text-xs font-semibold text-primary hover:underline"
                  >
                    <span>View Qualifying Bills</span>
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: 30-Day IRP Rule Auditor */}
        <TabsContent value="irp" className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-amber-500" />
                  <CardTitle className="text-sm font-bold">30-Day IRP Reporting Rule Tracker</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  Govt Time-Bar Check
                </Badge>
              </div>
              <CardDescription className="text-xs leading-relaxed">
                National Informatics Centre (NIC) and GSTN mandate that B2B invoices, credit notes, and debit notes must be reported to the Invoice Registration Portal (IRP) within 30 days of the invoice date. Invoices beyond 30 days are blocked from IRN generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client Name</TableHead>
                      <TableHead>GSTIN</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Age</TableHead>
                      <TableHead className="text-center">IRP Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.irpAuditList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No B2B invoices found in current period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.irpAuditList.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-mono font-bold text-foreground">
                            {row.invoiceNumber}
                          </TableCell>
                          <TableCell className="font-medium">{row.customerName}</TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {row.gstin || "N/A"}
                          </TableCell>
                          <TableCell className="font-mono">{row.issueDate}</TableCell>
                          <TableCell className="text-right font-mono font-bold">
                            {formatCurrency(row.amount, "INR")}
                          </TableCell>
                          <TableCell className="text-center font-mono">
                            {row.daysOld} days
                          </TableCell>
                          <TableCell className="text-center">
                            {row.isOverdue ? (
                              <Badge className="bg-rose-500/15 text-rose-600 border-none text-[10px]">
                                <AlertTriangle className="size-3 mr-1" />
                                &gt; 30 Days Barred
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/15 text-emerald-600 border-none text-[10px]">
                                <CheckCircle2 className="size-3 mr-1" />
                                Within 30 Days
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: DPDP Act Consent Ledger */}
        <TabsContent value="dpdp" className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Lock className="size-4 text-emerald-600" />
                    <span>DPDP Act (Digital Personal Data Protection) Consent Ledger</span>
                  </CardTitle>
                  <CardDescription className="text-xs pt-1">
                    India&apos;s DPDP Act mandates recording lawful, specific, informed and unambiguous consent before processing customer contact info or employee biometrics.
                  </CardDescription>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search entity name, phone, channel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs bg-background"
                  />
                </div>

                <Select value={statusFilter} onValueChange={(v) => { if (v) setStatusFilter(v); }}>
                  <SelectTrigger className="h-8 text-xs w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="GRANTED">Granted</SelectItem>
                    <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={purposeFilter} onValueChange={(v) => { if (v) setPurposeFilter(v); }}>
                  <SelectTrigger className="h-8 text-xs w-[160px]">
                    <SelectValue placeholder="Purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Purposes</SelectItem>
                    <SelectItem value="TRANSACTIONAL_INVOICES">Transactional Invoices</SelectItem>
                    <SelectItem value="PAYMENT_REMINDERS">Payment Reminders</SelectItem>
                    <SelectItem value="MARKETING_OFFERS">Marketing Offers</SelectItem>
                    <SelectItem value="BIOMETRIC_ATTENDANCE">Biometrics (Attendance)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Entity / Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Granted Date</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No consent records match current filter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((rec) => (
                        <TableRow key={rec.id}>
                          <TableCell>
                            <div className="font-bold text-foreground">{rec.entityName}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{rec.contact}</div>
                            {rec.notes && <div className="text-[10px] text-muted-foreground italic mt-0.5">{rec.notes}</div>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {rec.entityType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">
                              {rec.purpose === "TRANSACTIONAL_INVOICES" && "Digital Invoices (WhatsApp/SMS)"}
                              {rec.purpose === "PAYMENT_REMINDERS" && "Payment Reminders (UPI Link)"}
                              {rec.purpose === "MARKETING_OFFERS" && "Marketing & Broadcasts"}
                              {rec.purpose === "BIOMETRIC_ATTENDANCE" && "Biometric Attendance Processing"}
                            </div>
                            <span className="text-[9px] text-muted-foreground font-mono">
                              Notice: {rec.noticeVersion}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{rec.channel}</TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {new Date(rec.grantedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-center">
                            {rec.status === "GRANTED" ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none text-[10px]">
                                Granted
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-500/15 text-rose-600 border-none text-[10px]">
                                Withdrawn
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(rec.id, rec.status)}
                              className="h-7 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                            >
                              {rec.status === "GRANTED" ? "Revoke" : "Re-grant"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Statutory Rule Book */}
        <TabsContent value="rules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>GST Turnover Thresholds</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  <strong>Goods Suppliers:</strong> Registration is required once aggregate annual turnover exceeds ₹40 Lakhs (₹20 Lakhs in Special Category States like NE states, J&amp;K, Himachal).
                </p>
                <p>
                  <strong>Service Providers:</strong> Exemption threshold is ₹20 Lakhs (₹10 Lakhs in Special Category States).
                </p>
                <p>
                  <strong>Composition Scheme:</strong> Eligible for manufacturers and traders with turnover up to ₹1.50 Crores paying flat tax (1% for traders).
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="size-4 text-indigo-500" />
                  <span>E-Invoicing &amp; IRP Window</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  <strong>Mandatory B2B E-Invoicing:</strong> Applies to businesses with aggregate turnover exceeding ₹5 Crores in any preceding FY.
                </p>
                <p>
                  <strong>30-Day Time Limit:</strong> Government advisory mandates generating IRN on the IRP portal within 30 days of the invoice date. Older invoices are blocked.
                </p>
                <p>
                  <strong>QR Code Validation:</strong> All B2B e-invoices must contain the signed QR code issued by the IRP.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Lock className="size-4 text-emerald-600" />
                  <span>DPDP Act 2023 Principles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  <strong>Consent-First Architecture:</strong> Explicit opt-in is required before dispatching ledger statements or payment collection reminders.
                </p>
                <p>
                  <strong>Biometric Data:</strong> Fingerprint templates (Mantra MFS100) and facial snapshots captured for attendance must have registered employee consent.
                </p>
                <p>
                  <strong>Easy Withdrawal:</strong> Customers and employees can revoke consent at any time, instantly halting promotional messaging.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
