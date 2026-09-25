"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Employee } from "@/generated/prisma/client";
import { createEmployee, deleteEmployee, updateEmployee } from "@/actions/employees";
import { Button } from "@/components/ui/button";
import {
  FormDialog,
  FormFieldInput,
  FormFieldNumber,
  ConfirmActionButton,
} from "@/components/ui";

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
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title={employee ? "Edit Employee" : "Add Employee"}
      description={
        employee
          ? "Update staff rates and position information."
          : "Add a staff member to track attendance and generate payslips."
      }
      trigger={trigger ?? <Button>{employee ? "Edit Employee" : "Add Employee"}</Button>}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitText="Save changes"
    >
      <FormFieldInput
        label="Full Name"
        name="name"
        placeholder="e.g. Rahul Sharma"
        defaultValue={employee?.name}
        required
      />

      <FormFieldInput
        label="Email Address (Optional, for digital salary slips)"
        name="email"
        type="email"
        placeholder="rahul@company.com"
        defaultValue={employee?.email ?? ""}
      />

      <FormFieldInput
        label="Position / Designation"
        name="position"
        placeholder="e.g. Billing Staff, Store Manager, Sales Executive"
        defaultValue={employee?.position ?? ""}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormFieldNumber
          label="Hourly Rate"
          name="hourlyRate"
          step="0.01"
          placeholder="Base rate per 8-hour workday"
          defaultValue={employee?.hourlyRate ?? 0}
          currencySymbol="₹"
          helperText="Base rate per 8-hour workday"
          required
        />

        <FormFieldNumber
          label="Overtime (OT) Rate"
          name="overtimeRate"
          step="0.01"
          placeholder="Rate applied for hours worked beyond 8 hours"
          defaultValue={employee?.overtimeRate ?? 0}
          currencySymbol="₹"
          helperText="Rate applied for hours worked beyond 8 hours"
          required
        />
      </div>
    </FormDialog>
  );
}

export function DeleteEmployeeButton({ employeeId }: { employeeId: string }) {
  const handleDelete = async () => {
    try {
      await deleteEmployee(employeeId);
      toast.success("Employee deleted");
    } catch {
      toast.error("Failed to delete employee");
    }
  };

  return (
    <ConfirmActionButton
      confirmMessage="Delete this employee and all attendance records?"
      onConfirm={handleDelete}
      variant="ghost"
      size="sm"
    >
      Delete
    </ConfirmActionButton>
  );
}
