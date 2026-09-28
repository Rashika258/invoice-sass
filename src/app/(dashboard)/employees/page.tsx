import Link from "next/link";
import { format } from "date-fns";
import { CalendarCheck, FileText, Pencil, Plus, UserCircle } from "lucide-react";
import { getEmployees } from "@/actions/employees";
import {
  DeleteEmployeeButton,
  EmployeeFormDialog,
} from "@/components/employees/employee-form-dialog";
import { Button } from "@/components/ui/button";
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

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage staff, hourly rates, and overtime pay settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/attendance">
            <Button variant="outline" className="gap-1.5 text-xs font-semibold h-9 cursor-pointer">
              <CalendarCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Attendance &amp; Payroll Hub</span>
            </Button>
          </Link>
          <EmployeeFormDialog
            trigger={
              <Button className="gap-1.5 text-xs font-semibold h-9 cursor-pointer">
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            }
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {employees.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <UserCircle className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No employees yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>OT Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        {employee.email && (
                          <p className="text-sm text-muted-foreground">
                            {employee.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{employee.position || "—"}</TableCell>
                    <TableCell>{formatCurrency(employee.hourlyRate)}</TableCell>
                    <TableCell>{formatCurrency(employee.overtimeRate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <Link href="/attendance" title="View Payslip & Attendance">
                          <Button
                            variant="outline"
                            size="sm"
                            className="size-8 p-0 flex items-center justify-center cursor-pointer rounded-lg hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30"
                            title="View Payslip & Attendance"
                          >
                            <FileText className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                          </Button>
                        </Link>
                        <EmployeeFormDialog
                          employee={employee}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-8 p-0 flex items-center justify-center cursor-pointer rounded-lg hover:bg-muted"
                              title="Edit Employee"
                            >
                              <Pencil className="size-3.5 text-muted-foreground" />
                            </Button>
                          }
                        />
                        <DeleteEmployeeButton employeeId={employee.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
