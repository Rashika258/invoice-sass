import jsPDF from "jspdf";

export interface PayslipData {
  employeeName: string;
  position?: string | null;
  employeeEmail?: string | null;
  monthYear: string;
  baseSalary: number;
  overtimePay: number;
  grossSalary: number;
  pfDeduction: number;
  esiDeduction: number;
  taxDeduction: number;
  netSalary: number;
  companyName?: string;
  companyAddress?: string;
}

export function generatePayslipPdf(data: PayslipData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const company = data.companyName || "Billora Enterprises";
  const address = data.companyAddress || "Bengaluru, Karnataka, India";

  // Header Box
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(company, 15, 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(address, 15, 22);
  doc.text(`SALARY PAYSLIP — ${data.monthYear.toUpperCase()}`, 15, 29);

  // Employee Information Box
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("EMPLOYEE DETAILS", 15, 48);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Employee Name: ${data.employeeName}`, 15, 55);
  doc.text(`Designation: ${data.position || "Staff Member"}`, 15, 61);
  doc.text(`Email: ${data.employeeEmail || "N/A"}`, 15, 67);
  doc.text(`Pay Period: ${data.monthYear}`, 120, 55);
  doc.text(`Status: PROCESSED & DISBURSED`, 120, 61);

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 73, 195, 73);

  // Earnings Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 78, 85, 8, "F");
  doc.rect(110, 78, 85, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.text("EARNINGS", 18, 83);
  doc.text("AMOUNT (INR)", 70, 83);

  doc.text("DEDUCTIONS", 113, 83);
  doc.text("AMOUNT (INR)", 165, 83);

  // Table Body Rows
  doc.setFont("helvetica", "normal");
  doc.text("Basic Salary", 18, 92);
  doc.text(`₹${data.baseSalary.toLocaleString("en-IN")}`, 70, 92);

  doc.text("Provident Fund (PF)", 113, 92);
  doc.text(`₹${data.pfDeduction.toLocaleString("en-IN")}`, 165, 92);

  doc.text("Overtime Allowance", 18, 100);
  doc.text(`₹${data.overtimePay.toLocaleString("en-IN")}`, 70, 100);

  doc.text("ESI Contribution", 113, 100);
  doc.text(`₹${data.esiDeduction.toLocaleString("en-IN")}`, 165, 100);

  doc.text("Income Tax (TDS)", 113, 108);
  doc.text(`₹${data.taxDeduction.toLocaleString("en-IN")}`, 165, 108);

  // Totals Line
  doc.line(15, 115, 195, 115);

  doc.setFont("helvetica", "bold");
  doc.text("Gross Earnings:", 18, 122);
  doc.text(`₹${data.grossSalary.toLocaleString("en-IN")}`, 70, 122);

  const totalDeductions = data.pfDeduction + data.esiDeduction + data.taxDeduction;
  doc.text("Total Deductions:", 113, 122);
  doc.text(`₹${totalDeductions.toLocaleString("en-IN")}`, 165, 122);

  // Net Pay Box
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(15, 132, 180, 14, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("NET TAKE-HOME SALARY:", 20, 141);
  doc.text(`₹${data.netSalary.toLocaleString("en-IN")}`, 150, 141);

  // Footer Note
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("This is a computer-generated payslip issued by Billora Payroll Engine and requires no physical signature.", 15, 160);

  return doc;
}
