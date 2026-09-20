"use client";

import { useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { toast } from "sonner";
import { createAppointment } from "@/actions/appointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AppointmentBookingModal({
  customers,
  employees,
  services,
}: {
  customers: any[];
  employees: any[];
  services: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      await createAppointment({
        customerId: String(formData.get("customerId")),
        employeeId: String(formData.get("employeeId") || ""),
        serviceName: String(formData.get("serviceName")),
        appointmentDate: String(formData.get("appointmentDate")),
        amount: Number(formData.get("amount") || 0),
        notes: String(formData.get("notes") || ""),
      });

      toast.success("Appointment scheduled successfully!");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to book appointment");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-8 rounded-lg">
        <Plus className="size-4" />
        <span>Book Appointment</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Calendar className="size-5 text-indigo-600" />
                <span>Book Salon / Clinic Visit</span>
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label htmlFor="customerId">Client / Customer *</Label>
                <select
                  id="customerId"
                  name="customerId"
                  required
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs font-medium"
                >
                  <option value="">Select Client...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="serviceName">Service Item *</Label>
                <input
                  id="serviceName"
                  name="serviceName"
                  required
                  placeholder="E.g. Haircut & Styling, Facial, Dental Checkup"
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="employeeId">Assign Stylist / Doctor</Label>
                  <select
                    id="employeeId"
                    name="employeeId"
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs font-medium"
                  >
                    <option value="">Any Available Staff</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="amount">Est. Charge (₹)</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" defaultValue="500" className="h-8 text-xs font-medium" />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="appointmentDate">Date &amp; Time *</Label>
                <Input id="appointmentDate" name="appointmentDate" type="datetime-local" required className="h-8 text-xs font-medium" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  {isSubmitting ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
