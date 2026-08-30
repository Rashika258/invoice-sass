import { format } from "date-fns";
import { Plus, UserCircle } from "lucide-react";
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
        <EmployeeFormDialog
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          }
        />
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
                      <div className="flex justify-end gap-2">
                        <EmployeeFormDialog
                          employee={employee}
                          trigger={<Button variant="ghost" size="sm">Edit</Button>}
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
