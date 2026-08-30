"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { Employee } from "@/generated/prisma/client";
import { createAttendance } from "@/actions/employees";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AttendanceForm({ employees }: { employees: Employee[] }) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!employeeId) {
      toast.error("Select an employee");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      await createAttendance({
        employeeId,
        date: String(formData.get("date")),
        hoursWorked: Number(formData.get("hoursWorked")),
        notes: String(formData.get("notes") ?? ""),
      });
      toast.success("Attendance recorded");
      router.refresh();
      (event.target as HTMLFormElement).reset();
      setEmployeeId("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Employee</Label>
            <Select
              value={employeeId}
              onValueChange={(value) => {
                if (typeof value === "string") setEmployeeId(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hoursWorked">Hours Worked</Label>
            <Input
              id="hoursWorked"
              name="hoursWorked"
              type="number"
              min="0"
              max="24"
              step="0.5"
              defaultValue={8}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting || employees.length === 0}>
              {isSubmitting ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
