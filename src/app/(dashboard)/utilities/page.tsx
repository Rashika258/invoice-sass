import Link from "next/link";
import {
  Barcode,
  CalendarClock,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  FileUp,
  Package,
  Sparkles,
  Upload,
  UserCheck,
  UserCircle,
  Users,
  Wrench,
} from "lucide-react";

const UTILITIES = [
  {
    href: "/utilities/setup-business",
    icon: Sparkles,
    title: "Set Up My Business",
    desc: "Configure business profile, GSTIN, address and logo in one guided flow.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    href: "/utilities/import-items",
    icon: Package,
    title: "Import Items",
    desc: "Bulk import your product/service catalogue from an Excel or CSV file.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    href: "/utilities/import-parties",
    icon: Users,
    title: "Import Parties",
    desc: "Import customers and suppliers in bulk from Excel.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    href: "/utilities/export-items",
    icon: Download,
    title: "Export Items",
    desc: "Download your full items catalogue as an Excel spreadsheet.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    href: "/utilities/bulk-update",
    icon: Database,
    title: "Update Items In Bulk",
    desc: "Apply price changes, tax rates or unit updates to multiple items at once.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    href: "/utilities/barcode-generator",
    icon: Barcode,
    title: "Barcode Generator",
    desc: "Generate printable EAN-13, QR Code or Code-128 barcodes for your items.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    href: "/utilities/accountant-access",
    icon: UserCheck,
    title: "Accountant Access",
    desc: "Grant read-only or CA-restricted access to your accountant.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    href: "/utilities/track-salesmen",
    icon: UserCircle,
    title: "Track Your Salesmen",
    desc: "Assign invoices to sales reps and track individual performance.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    href: "/utilities/verify-data",
    icon: CheckCircle2,
    title: "Verify My Data",
    desc: "Run a data integrity check to detect orphaned records or mismatched balances.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
  {
    href: "/utilities/close-fy",
    icon: CalendarClock,
    title: "Close Financial Year",
    desc: "Archive current FY transactions and open a fresh ledger for the new year.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    href: "/utilities/export-tally",
    icon: FileSpreadsheet,
    title: "Export to Tally",
    desc: "Export sales, purchases and ledger data in Tally XML/CSV format.",
    color: "text-green-600",
    bg: "bg-green-500/10",
  },
  {
    href: "/utilities/import-tally",
    icon: FileUp,
    title: "Import from Tally",
    desc: "Migrate existing Tally ledgers and vouchers into Billora.",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
];

export default function UtilitiesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Wrench className="size-6 text-brand" />
          Utilities
        </h1>
        <p className="text-xs text-muted-foreground">
          Powerful tools to import, export, bulk-update and maintain your Billora data.
        </p>
      </div>

      {/* Utilities Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {UTILITIES.map((u) => {
          const Icon = u.icon;
          return (
            <Link
              key={u.href}
              href={u.href}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-xs hover:shadow-md hover:border-brand/40 transition-all duration-200"
            >
              <div className={`flex size-10 items-center justify-center rounded-xl ${u.bg}`}>
                <Icon className={`size-5 ${u.color}`} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                  {u.title}
                </h3>
                <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                  {u.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
