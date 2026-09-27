import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAttendance } from "@/actions/employees";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { employeeId, date, hoursWorked, notes } = body;

    if (!employeeId || !date) {
      return NextResponse.json(
        { error: "Employee ID and date are required" },
        { status: 400 },
      );
    }

    const record = await createAttendance({
      employeeId,
      date,
      hoursWorked: hoursWorked ?? 8,
      notes: notes || "Mobile Punch",
    });

    return NextResponse.json({
      success: true,
      record,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record attendance punch";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
