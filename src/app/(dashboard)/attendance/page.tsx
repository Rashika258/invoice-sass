import { format } from "date-fns";
import { Clock, Users, CalendarCheck, Wallet, Plus } from "lucide-react";
import { getAttendanceRecords, getEmployees } from "@/actions/employees";
import { getCompanyProfile } from "@/actions/settings";
import { AttendanceForm } from "@/components/attendance/attendance-form";
import { PayslipDialog } from "@/components/attendance/payslip-dialog";
import { DeleteAttendanceButton } from "@/components/attendance/delete-attendance-button";
import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog";
import { MonthFilter } from "@/components/attendance/month-filter";
import { CctvViewerModal } from "@/components/attendance/cctv-viewer-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/invoice-utils";
import {
  calculateDayPay,
  calculatePeriodSalary,
  STANDARD_WORK_HOURS,
} from "@/lib/salary-utils";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month = format(new Date(), "yyyy-MM") } = await searchParams;
  const [employees, records, profile] = await Promise.all([
    getEmployees(),
    getAttendanceRecords(month),
    getCompanyProfile(),
  ]);

  const currency = profile?.currency ?? "INR";
  const companyName = profile?.companyName || "My Business";
  const logoUrl = profile?.logoUrl;
  const taxId = profile?.taxId;
  const phone = profile?.phone;
  const address = profile?.address;

  const salarySummary = employees.map((employee) => {
    const employeeRecords = records.filter(
      (record) => record.employeeId === employee.id,
    );
    const salary = calculatePeriodSalary(
      employeeRecords,
      employee.hourlyRate,
      employee.overtimeRate,
    );

    return { employee, salary, records: employeeRecords };
  });

  const totalPayroll = salarySummary.reduce(
    (sum, item) => sum + item.salary.totalPay,
    0,
  );

  const totalOtHours = salarySummary.reduce(
    (sum, item) => sum + item.salary.overtimeHours,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header with Title and Month Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Attendance &amp; Payroll
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Standard shift is {STANDARD_WORK_HOURS} hours. Overtime (OT) is calculated per extra hour worked.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MonthFilter defaultValue={month} />
          <CctvViewerModal />
          <EmployeeFormDialog
            trigger={
              <Button size="sm" className="h-9 text-xs font-bold gap-1.5 shadow-xs">
                <Plus className="size-3.5" />
                Add Employee
              </Button>
            }
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Staff
              </span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-3.5" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {employees.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Active employees</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Days Logged
              </span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CalendarCheck className="size-3.5" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {records.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Entries for {format(new Date(`${month}-01`), "MMM yyyy")}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total OT Hours
              </span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="size-3.5" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold tracking-tight text-primary font-mono">
              +{totalOtHours.toFixed(1)} hrs
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Overtime beyond 8h shift</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Monthly Payroll
              </span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <Wallet className="size-3.5" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold tracking-tight text-emerald-600 font-mono">
              {formatCurrency(totalPayroll, currency)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Regular + OT compensation</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Form with 8h Shift Engine */}
      <AttendanceForm employees={employees} currency={currency} />

      {/* Monthly Salary Summary Table with Payslip Generation */}
      <Card className="rounded-xl shadow-xs border">
        <CardHeader className="border-b bg-card/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Staff Payroll &amp; Salary Summary &mdash; {format(new Date(`${month}-01`), "MMMM yyyy")}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Calculated based on {STANDARD_WORK_HOURS}-hour standard shifts and hourly overtime. Generate individual printable payslips below.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {salarySummary.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No employees configured yet. Add employees from the Employees tab.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Employee</TableHead>
                  <TableHead className="text-xs font-bold text-center">Days</TableHead>
                  <TableHead className="text-xs font-bold text-center">Total Hours</TableHead>
                  <TableHead className="text-xs font-bold text-center">Regular (8h Base)</TableHead>
                  <TableHead className="text-xs font-bold text-center">Overtime (OT)</TableHead>
                  <TableHead className="text-xs font-bold text-right">Regular Pay</TableHead>
                  <TableHead className="text-xs font-bold text-right">OT Pay</TableHead>
                  <TableHead className="text-xs font-bold text-right">Total Salary</TableHead>
                  <TableHead className="text-xs font-bold text-center">Payslip</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salarySummary.map(({ employee, salary, records: empRecords }) => (
                  <TableRow key={employee.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-xs text-foreground">{employee.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {employee.position || "Staff"} · ₹{employee.hourlyRate}/h (OT: ₹{employee.overtimeRate}/h)
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">{empRecords.length}</TableCell>
                    <TableCell className="text-center font-mono text-xs font-semibold">{salary.totalHours.toFixed(1)}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{salary.regularHours.toFixed(1)}</TableCell>
                    <TableCell className="text-center">
                      {salary.overtimeHours > 0 ? (
                        <Badge className="bg-primary text-primary-foreground font-mono text-[10px] font-bold">
                          +{salary.overtimeHours.toFixed(1)}h
                        </Badge>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">0.0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {formatCurrency(salary.regularPay, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold text-primary">
                      {formatCurrency(salary.overtimePay, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-black text-foreground">
                      {formatCurrency(salary.totalPay, currency)}
                    </TableCell>
                    <TableCell className="text-center">
                      <PayslipDialog
                        data={{
                          employee,
                          month,
                          daysWorked: empRecords.length,
                          totalHours: salary.totalHours,
                          regularHours: salary.regularHours,
                          overtimeHours: salary.overtimeHours,
                          regularPay: salary.regularPay,
                          overtimePay: salary.overtimePay,
                          totalPay: salary.totalPay,
                          companyName,
                          logoUrl,
                          taxId,
                          phone,
                          address,
                          currency,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Daily Attendance Logs */}
      <Card className="rounded-xl shadow-xs border">
        <CardHeader className="border-b bg-card/60 p-4">
          <CardTitle className="text-base font-semibold">
            Daily Attendance Logs &mdash; {format(new Date(`${month}-01`), "MMMM yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {records.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No daily attendance records found for this month.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Date</TableHead>
                  <TableHead className="text-xs font-bold">Employee</TableHead>
                  <TableHead className="text-xs font-bold text-center">Total Hours</TableHead>
                  <TableHead className="text-xs font-bold text-center">Shift Breakdown</TableHead>
                  <TableHead className="text-xs font-bold">Shift Notes / Remarks</TableHead>
                  <TableHead className="text-xs font-bold text-right">Day Earnings</TableHead>
                  <TableHead className="w-10 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => {
                  const dayPay = calculateDayPay(
                    record.hoursWorked,
                    record.employee.hourlyRate,
                    record.employee.overtimeRate,
                  );

                  return (
                    <TableRow key={record.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs font-medium">
                        {format(new Date(record.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-xs text-foreground">
                          {record.employee.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1.5">
                          ({record.employee.position || "Staff"})
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs font-bold">
                        {record.hoursWorked} hrs
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-1.5 text-[11px]">
                          <span className="font-mono text-muted-foreground">
                            {dayPay.regularHours}h reg
                          </span>
                          {dayPay.overtimeHours > 0 && (
                            <Badge className="bg-primary text-primary-foreground font-mono text-[9px] font-bold px-1.5 py-0.2">
                              +{dayPay.overtimeHours}h OT
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {record.notes || "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-emerald-600">
                        {formatCurrency(dayPay.totalPay, currency)}
                      </TableCell>
                      <TableCell className="text-center">
                        <DeleteAttendanceButton recordId={record.id} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
