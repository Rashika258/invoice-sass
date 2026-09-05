import { NextResponse } from "next/server";
import { createAttendance } from "@/actions/employees";

export async function POST(req: Request) {
  try {
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to record attendance punch" },
      { status: 500 },
    );
  }
}
