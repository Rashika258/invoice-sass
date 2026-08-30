import { format } from "date-fns";
import { getAttendanceRecords, getEmployees } from "@/actions/employees";
import { getCompanyProfile } from "@/actions/settings";
import { AttendanceForm } from "@/components/attendance/attendance-form";
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

  const currency = profile?.currency ?? "USD";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance & Payroll</h1>
          <p className="text-muted-foreground">
            Track daily hours. Standard day is {STANDARD_WORK_HOURS} hours; overtime
            is paid per extra hour.
          </p>
        </div>
        <form className="flex items-end gap-2">
          <div>
            <label htmlFor="month" className="mb-1 block text-sm font-medium">
              Month
            </label>
            <input
              id="month"
              name="month"
              type="month"
              defaultValue={month}
              className="flex h-9 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>
          <button
            type="submit"
            className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{employees.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{records.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total OT Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {salarySummary
                .reduce((sum, item) => sum + item.salary.overtimeHours, 0)
                .toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(totalPayroll, currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      <AttendanceForm employees={employees} />

      <Card>
        <CardHeader>
          <CardTitle>Salary Summary — {format(new Date(`${month}-01`), "MMMM yyyy")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Regular</TableHead>
                <TableHead>OT Hours</TableHead>
                <TableHead>Regular Pay</TableHead>
                <TableHead>OT Pay</TableHead>
                <TableHead className="text-right">Total Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salarySummary.map(({ employee, salary, records: empRecords }) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{empRecords.length}</TableCell>
                  <TableCell>{salary.totalHours.toFixed(1)}</TableCell>
                  <TableCell>{salary.regularHours.toFixed(1)}</TableCell>
                  <TableCell>{salary.overtimeHours.toFixed(1)}</TableCell>
                  <TableCell>{formatCurrency(salary.regularPay, currency)}</TableCell>
                  <TableCell>{formatCurrency(salary.overtimePay, currency)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(salary.totalPay, currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {records.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No attendance records for this month.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Regular</TableHead>
                  <TableHead>OT</TableHead>
                  <TableHead className="text-right">Day Pay</TableHead>
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
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(record.date, "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{record.employee.name}</TableCell>
                      <TableCell>{record.hoursWorked}</TableCell>
                      <TableCell>{dayPay.regularHours}</TableCell>
                      <TableCell>{dayPay.overtimeHours}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(dayPay.totalPay, currency)}
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
