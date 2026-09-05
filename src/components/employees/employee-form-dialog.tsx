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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add Employee"}</DialogTitle>
          <DialogDescription>
            {employee
              ? "Update staff rates and position information."
              : "Add a staff member to track attendance and generate payslips."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" defaultValue={employee?.name} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={employee?.email ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                defaultValue={employee?.position ?? ""}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate *</Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                defaultValue={employee?.hourlyRate ?? 0}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overtimeRate">OT Rate / hour *</Label>
              <Input
                id="overtimeRate"
                name="overtimeRate"
                type="number"
                min="0"
                step="0.01"
                defaultValue={employee?.overtimeRate ?? 0}
                required
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Standard day is 8 hours. Hours beyond 8 are paid at the overtime rate.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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
