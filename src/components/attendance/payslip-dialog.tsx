"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { Printer, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import type { Employee } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/invoice-utils";
import { numberToWordsIndian } from "@/lib/number-to-words";
import { generatePayslipPdf } from "@/lib/payslip-pdf";

export type PayslipData = {
  employee: Employee;
  month: string; // "yyyy-MM"
  daysWorked: number;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  companyName: string;
  logoUrl?: string | null;
  taxId?: string | null;
  phone?: string | null;
  address?: string | null;
  currency?: string;
};

export function PayslipDialog({
  data,
  trigger,
}: {
  data: PayslipData;
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const {
    employee,
    month,
    daysWorked,
    totalHours,
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    totalPay,
    companyName,
    logoUrl,
    taxId,
    phone,
    address,
    currency = "INR",
  } = data;

  const monthDate = new Date(`${month}-01`);
  const monthName = format(monthDate, "MMMM yyyy");

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    try {
      const doc = generatePayslipPdf({
        employeeName: employee.name,
        position: employee.position,
        employeeEmail: employee.email,
        monthYear: monthName,
        baseSalary: regularPay,
        overtimePay: overtimePay,
        grossSalary: totalPay,
        pfDeduction: Math.round(regularPay * 0.12),
        esiDeduction: Math.round(regularPay * 0.0075),
        taxDeduction: 0,
        netSalary: totalPay - Math.round(regularPay * 0.12) - Math.round(regularPay * 0.0075),
        companyName: companyName,
        companyAddress: address || undefined,
      });
      doc.save(`payslip-${employee.name.toLowerCase().replace(/\s+/g, "_")}-${month}.pdf`);
      toast.success("Payslip PDF downloaded successfully!");
    } catch {
      toast.error("Failed to generate Payslip PDF");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (trigger ?? (
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              <FileText className="size-3.5 text-primary" />
              Payslip
            </Button>
          )) as React.ReactElement
        }
      />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 print:p-0 print:border-none print:shadow-none print:max-w-none">
        <DialogHeader className="print:hidden flex flex-row items-center justify-between pb-2 border-b">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            Salary Slip &mdash; {employee.name} ({monthName})
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPdf}
              className="h-8 text-xs gap-1.5 font-semibold"
            >
              <Download className="size-3.5 text-primary" />
              Download PDF
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs gap-1.5 font-semibold"
            >
              <Printer className="size-3.5" />
              Print / PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Slip Container */}
        <div
          ref={printableRef}
          className="border-2 border-slate-900 bg-white text-slate-950 p-4 sm:p-6 text-xs space-y-4 rounded-sm print:border-2 print:p-6"
        >
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={companyName}
                    className="max-h-12 max-w-28 object-contain rounded"
                  />
                ) : (
                  <div className="size-10 rounded bg-[#7c3aed] text-white flex items-center justify-center font-bold text-lg">
                    {companyName ? companyName.charAt(0).toUpperCase() : "V"}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-black tracking-tight text-[#7c3aed] uppercase">
                    {companyName || "Your Company Name"}
                  </h2>
                  {address && <p className="text-[11px] text-slate-600">{address}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-3 text-[10px] text-slate-700 font-medium pt-1">
                {taxId && <span>GSTIN: <b className="font-mono">{taxId}</b></span>}
                {phone && <span>Phone: <b>{phone}</b></span>}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block bg-[#7c3aed] text-white px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                Salary Voucher
              </span>
              <p className="text-[11px] font-bold text-slate-900 mt-1">Period: {monthName}</p>
              <p className="text-[10px] text-slate-500">Date: {format(new Date(), "dd-MM-yyyy")}</p>
            </div>
          </div>

          {/* Employee & Attendance Overview Grid */}
          <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded p-3 bg-slate-50/70">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-500">Employee Details</p>
              <p className="text-sm font-black text-slate-900">{employee.name}</p>
              <p className="text-[11px] text-slate-700">Designation: <b>{employee.position || "Staff"}</b></p>
              {employee.email && <p className="text-[11px] text-slate-600">Email: {employee.email}</p>}
            </div>

            <div className="space-y-1 border-l border-slate-300 pl-4">
              <p className="text-[10px] uppercase font-bold text-slate-500">Shift &amp; Attendance Record</p>
              <div className="grid grid-cols-2 gap-y-1 text-[11px]">
                <span>Standard Shift:</span> <span className="font-bold font-mono">8 Hours/Day</span>
                <span>Days Worked:</span> <span className="font-bold font-mono">{daysWorked} Days</span>
                <span>Regular Shift Hours:</span> <span className="font-bold font-mono">{regularHours.toFixed(1)} hrs</span>
                <span>Overtime (OT) Hours:</span> <span className="font-bold font-mono text-[#7c3aed]">+{overtimeHours.toFixed(1)} hrs</span>
              </div>
            </div>
          </div>

          {/* Salary Breakdown Table */}
          <table className="w-full border-collapse border border-slate-900 text-[11px]">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-900 font-bold uppercase text-[10px] text-slate-800">
                <th className="p-2 border-r border-slate-900 text-left">Earning Component</th>
                <th className="p-2 border-r border-slate-900 text-center">Hours</th>
                <th className="p-2 border-r border-slate-900 text-right">Rate / Hr</th>
                <th className="p-2 text-right">Amount ({currency === "INR" ? "₹" : currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              <tr>
                <td className="p-2 border-r border-slate-900 font-medium">
                  Basic Shift Pay (Standard 8h/day limit)
                </td>
                <td className="p-2 border-r border-slate-900 text-center font-mono font-semibold">
                  {regularHours.toFixed(1)} hrs
                </td>
                <td className="p-2 border-r border-slate-900 text-right font-mono">
                  {formatCurrency(employee.hourlyRate, currency)}
                </td>
                <td className="p-2 text-right font-mono font-bold">
                  {formatCurrency(regularPay, currency)}
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-900 font-medium">
                  Overtime (OT) Allowance (Hours beyond 8h shift)
                </td>
                <td className="p-2 border-r border-slate-900 text-center font-mono font-semibold text-[#7c3aed]">
                  {overtimeHours.toFixed(1)} hrs
                </td>
                <td className="p-2 border-r border-slate-900 text-right font-mono">
                  {formatCurrency(employee.overtimeRate, currency)}
                </td>
                <td className="p-2 text-right font-mono font-bold text-[#7c3aed]">
                  {formatCurrency(overtimePay, currency)}
                </td>
              </tr>
              <tr className="bg-slate-50 font-black text-xs border-t-2 border-slate-900">
                <td colSpan={3} className="p-2 border-r border-slate-900 uppercase">
                  Gross Total Salary Payable
                </td>
                <td className="p-2 text-right font-mono text-sm text-[#7c3aed]">
                  {formatCurrency(totalPay, currency)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Amount in Words */}
          <div className="rounded border border-slate-300 bg-slate-50 p-2 text-[11px]">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Pay in Words:</span>
            <p className="font-bold text-slate-900 italic">
              {numberToWordsIndian(totalPay)}
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-8 text-center text-[10px]">
            <div className="flex flex-col justify-end">
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                Employee Signature
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <p className="font-bold text-xs text-[#7c3aed] mb-1">
                For {companyName || "Employer"}
              </p>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
