import Link from "next/link";
import { Calendar, Clock, Plus, Scissors, User } from "lucide-react";
import { getAppointments } from "@/actions/appointments";
import { getCustomers } from "@/actions/customers";
import { getEmployees } from "@/actions/employees";
import { getItems } from "@/actions/items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentBookingModal } from "@/components/appointments/appointment-booking-modal";
import { formatCurrency } from "@/lib/invoice-utils";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const [appointments, customers, employees, items] = await Promise.all([
    getAppointments(),
    getCustomers(),
    getEmployees(),
    getItems(),
  ]);

  const serviceItems = items.filter((i: any) => i.itemType === "SERVICE");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Scissors className="size-6 text-indigo-600 dark:text-indigo-400" />
            <span>Salon &amp; Clinic Appointments</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Schedule client visits, assign stylists/therapists, and manage service bookings.
          </p>
        </div>

        <AppointmentBookingModal
          customers={customers}
          employees={employees}
          services={serviceItems.length > 0 ? serviceItems : items}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-indigo-600 bg-card">
          <div className="text-xs font-medium text-muted-foreground">Total Scheduled</div>
          <div className="text-2xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">
            {appointments.filter((a: any) => a.status === "SCHEDULED").length}
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-600 bg-card">
          <div className="text-xs font-medium text-muted-foreground">Completed Today</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
            {appointments.filter((a: any) => a.status === "COMPLETED").length}
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-rose-600 bg-card">
          <div className="text-xs font-medium text-muted-foreground">Cancelled / No-show</div>
          <div className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">
            {appointments.filter((a: any) => a.status === "CANCELLED").length}
          </div>
        </Card>
      </div>

      <Card className="rounded-xl border border-border/60 shadow-xs">
        <CardHeader className="p-4 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider">
            Appointment Bookings ({appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No appointments booked yet. Click &quot;Book Appointment&quot; above to schedule one.
              </div>
            ) : (
              appointments.map((apt: any) => (
                <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold text-xs flex flex-col items-center justify-center min-w-[50px]">
                      <Calendar className="size-4 mb-0.5" />
                      <span>{new Date(apt.appointmentDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                    </div>

                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        {apt.serviceName}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <User className="size-3" />
                          {apt.customer?.name ?? "Client"}
                        </span>
                        {apt.employee && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 dark:text-indigo-400">
                              Stylist: {apt.employee.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-foreground">
                        {formatCurrency(apt.amount)}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-semibold mt-0.5 ${
                          apt.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-300"
                            : apt.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/20 dark:text-rose-300"
                            : "bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/20 dark:text-indigo-300"
                        }`}
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
