"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Clock, CheckCircle2, Zap, AlertCircle, Plus } from "lucide-react";
import type { Employee } from "@/generated/prisma/client";
import { createAttendance } from "@/actions/employees";
import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog";
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
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/invoice-utils";
import {
  calculateDayPay,
  calculateShiftFromTimes,
  STANDARD_WORK_HOURS,
} from "@/lib/salary-utils";

import { DatePicker } from "@/components/ui/date-picker";

export function AttendanceForm({
  employees,
  currency = "INR",
}: {
  employees: Employee[];
  currency?: string;
}) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [hoursWorked, setHoursWorked] = useState<number>(STANDARD_WORK_HOURS);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time calculator mode
  const [useTimeInputs, setUseTimeInputs] = useState(false);
  const [checkInTime, setCheckInTime] = useState("09:00");
  const [checkOutTime, setCheckOutTime] = useState("18:00");

  const selectedEmployee = useMemo(
    () => employees.find((emp) => emp.id === employeeId),
    [employees, employeeId],
  );

  // When checkIn or checkOut changes in time mode, calculate hours
  const handleTimeChange = (checkIn: string, checkOut: string) => {
    setCheckInTime(checkIn);
    setCheckOutTime(checkOut);
    const result = calculateShiftFromTimes(checkIn, checkOut);
    if (result.hours > 0) {
      setHoursWorked(result.hours);
    }
  };

  // Calculate live breakdown
  const payBreakdown = useMemo(() => {
    if (!selectedEmployee) return null;
    return calculateDayPay(
      hoursWorked,
      selectedEmployee.hourlyRate,
      selectedEmployee.overtimeRate,
    );
  }, [selectedEmployee, hoursWorked]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!employeeId) {
      toast.error("Please select an employee");
      return;
    }
    if (hoursWorked < 0 || hoursWorked > 24) {
      toast.error("Hours worked must be between 0 and 24");
      return;
    }

    setIsSubmitting(true);

    try {
      const autoNote = useTimeInputs
        ? `${checkInTime} - ${checkOutTime}${notes ? ` | ${notes}` : ""}`
        : notes;

      await createAttendance({
        employeeId,
        date,
        hoursWorked,
        notes: autoNote || undefined,
      });

      toast.success(
        `Attendance recorded: ${hoursWorked} hrs (${payBreakdown ? `${payBreakdown.regularHours}h reg + ${payBreakdown.overtimeHours}h OT` : ""})`,
      );
      router.refresh();
      setNotes("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-xl border shadow-xs">
      <CardHeader className="border-b bg-card/60 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Log Daily Attendance &amp; OT</CardTitle>
              <p className="text-xs text-muted-foreground">
                Standard shift: {STANDARD_WORK_HOURS} hours. Extra hours calculated automatically as Overtime (OT).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const next = !useTimeInputs;
                setUseTimeInputs(next);
                if (next) {
                  const res = calculateShiftFromTimes(checkInTime, checkOutTime);
                  setHoursWorked(res.hours);
                }
              }}
              className="text-[11px] font-medium text-primary hover:underline"
            >
              {useTimeInputs ? "Switch to Manual Hours" : "Use Check-In / Check-Out Times"}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Employee Picker */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Select Employee *</Label>
                <EmployeeFormDialog
                  onSuccess={() => router.refresh()}
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <Plus className="size-3" />
                      Add Employee
                    </button>
                  }
                />
              </div>
              <Select
                value={employeeId}
                onValueChange={(val) => {
                  if (typeof val === "string") setEmployeeId(val);
                }}
              >
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="Choose employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} {emp.position ? `(${emp.position})` : ""} · ₹{emp.hourlyRate}/h (OT: ₹{emp.overtimeRate}/h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Date *</Label>
              <DatePicker
                value={date}
                onChange={(val) => setDate(val)}
              />
            </div>

            {/* Hours Input or Time Pickers */}
            {!useTimeInputs ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hoursWorked" className="text-xs font-semibold">Hours Worked *</Label>
                  <span className="text-[11px] font-mono font-medium text-muted-foreground">
                    {hoursWorked}h total
                  </span>
                </div>
                <Input
                  id="hoursWorked"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(parseFloat(e.target.value) || 0)}
                  required
                  className="h-9 text-sm font-semibold"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Shift In / Out Times</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => handleTimeChange(e.target.value, checkOutTime)}
                    className="h-9 text-xs"
                    title="Check-In Time"
                  />
                  <Input
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => handleTimeChange(checkInTime, e.target.value)}
                    className="h-9 text-xs"
                    title="Check-Out Time"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Shift Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">Quick Shift Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHoursWorked(STANDARD_WORK_HOURS)}
                className={`h-7 px-2.5 text-xs rounded-md ${hoursWorked === 8 ? "border-primary bg-primary/10 text-primary font-semibold" : ""}`}
              >
                Standard (8h)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHoursWorked(9)}
                className={`h-7 px-2.5 text-xs rounded-md ${hoursWorked === 9 ? "border-primary bg-primary/10 text-primary font-semibold" : ""}`}
              >
                +1h OT (9h)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHoursWorked(10)}
                className={`h-7 px-2.5 text-xs rounded-md ${hoursWorked === 10 ? "border-primary bg-primary/10 text-primary font-semibold" : ""}`}
              >
                +2h OT (10h)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHoursWorked(11)}
                className={`h-7 px-2.5 text-xs rounded-md ${hoursWorked === 11 ? "border-primary bg-primary/10 text-primary font-semibold" : ""}`}
              >
                +3h OT (11h)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHoursWorked(12)}
                className={`h-7 px-2.5 text-xs rounded-md ${hoursWorked === 12 ? "border-primary bg-primary/10 text-primary font-semibold" : ""}`}
              >
                +4h OT (12h)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHoursWorked(4)}
                className={`h-7 px-2.5 text-xs rounded-md ${hoursWorked === 4 ? "border-primary bg-primary/10 text-primary font-semibold" : ""}`}
              >
                Half Day (4h)
              </Button>
            </div>
          </div>

          {/* Live Pay & Overtime Breakdown Card */}
          {selectedEmployee && payBreakdown && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-primary/15 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    Live Calculation Preview for {selectedEmployee.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-background text-[11px] font-mono">
                    Regular: {payBreakdown.regularHours}h
                  </Badge>
                  {payBreakdown.overtimeHours > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-[11px] font-mono font-bold">
                      OT: +{payBreakdown.overtimeHours}h
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-[11px] text-muted-foreground">Regular Shift Pay</p>
                  <p className="font-semibold font-mono text-sm mt-0.5">
                    {formatCurrency(payBreakdown.regularPay, currency)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {payBreakdown.regularHours}h × {formatCurrency(selectedEmployee.hourlyRate, currency)}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground">Overtime (OT) Pay</p>
                  <p className="font-semibold font-mono text-sm text-primary mt-0.5">
                    {formatCurrency(payBreakdown.overtimePay, currency)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {payBreakdown.overtimeHours > 0
                      ? `${payBreakdown.overtimeHours}h × ${formatCurrency(selectedEmployee.overtimeRate, currency)}`
                      : "0 hrs OT"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground">Shift Structure</p>
                  <p className="font-semibold text-sm mt-0.5">
                    {hoursWorked > 8 ? "8h Shift + OT" : `${hoursWorked}h Standard`}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    8h baseline limit
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium text-foreground">Est. Total Day Pay</p>
                  <p className="font-black font-mono text-base text-primary mt-0.5">
                    {formatCurrency(payBreakdown.totalPay, currency)}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-medium">
                    Calculated accurately
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold">Notes / Work Remarks (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Extended shift for warehouse inventory dispatch, machine maintenance..."
              rows={2}
              className="text-xs"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={isSubmitting || employees.length === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-xs active:scale-[0.98] transition-all"
            >
              {isSubmitting ? "Saving Record..." : "Save Attendance"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
