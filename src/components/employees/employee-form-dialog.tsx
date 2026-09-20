"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Employee } from "@/generated/prisma/client";
import {
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from "@/actions/employees";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EmployeeFormDialogProps = {
  employee?: Employee;
  trigger?: React.ReactElement;
  onSuccess?: () => void;
};

export function EmployeeFormDialog({
  employee,
  trigger,
  onSuccess,
}: EmployeeFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      position: String(formData.get("position") ?? ""),
      hourlyRate: Number(formData.get("hourlyRate") ?? 0),
      overtimeRate: Number(formData.get("overtimeRate") ?? 0),
    };

    try {
      if (employee) {
        await updateEmployee(employee.id, data);
        toast.success("Employee updated");
      } else {
        await createEmployee(data);
        toast.success("Employee added");
      }

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (trigger ?? (
            <Button>{employee ? "Edit Employee" : "Add Employee"}</Button>
          )) as React.ReactElement
        }
      />
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add Employee"}</DialogTitle>
          <DialogDescription>
            {employee
              ? "Update staff rates and position information."
              : "Add a staff member to track attendance and generate payslips."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <DialogBody>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">Full Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Rahul Sharma"
                defaultValue={employee?.name}
                required
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Email Address (Optional, for digital salary slips)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="rahul@company.com"
                defaultValue={employee?.email ?? ""}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="position" className="text-xs font-semibold">Position / Designation</Label>
              <Input
                id="position"
                name="position"
                placeholder="e.g. Billing Staff, Store Manager, Sales Executive"
                defaultValue={employee?.position ?? ""}
                className="h-9 text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="hourlyRate" className="text-xs font-semibold">Hourly Rate (₹)</Label>
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Base rate per 8-hour workday"
                  defaultValue={employee?.hourlyRate ?? 0}
                  required
                  className="h-9 text-sm font-mono"
                />
                <p className="text-[10px] text-muted-foreground">Base rate per 8-hour workday</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="overtimeRate" className="text-xs font-semibold">Overtime (OT) Rate (₹/hr)</Label>
                <Input
                  id="overtimeRate"
                  name="overtimeRate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Rate applied for hours worked beyond 8 hours"
                  defaultValue={employee?.overtimeRate ?? 0}
                  required
                  className="h-9 text-sm font-mono"
                />
                <p className="text-[10px] text-muted-foreground">Rate applied for hours worked beyond 8 hours</p>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs font-bold bg-primary text-primary-foreground">
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteEmployeeButton({ employeeId }: { employeeId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this employee and all attendance records?")) return;

    setIsDeleting(true);
    try {
      await deleteEmployee(employeeId);
      toast.success("Employee deleted");
    } catch {
      toast.error("Failed to delete employee");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isDeleting}>
      Delete
    </Button>
  );
}
