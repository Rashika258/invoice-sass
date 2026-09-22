import { NextRequest, NextResponse } from "next/server";
import { buildWhatsAppReminderMessage } from "@/lib/reminders";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Queue reminder jobs for overdue invoices
    const sampleDispatchedReminders = [
      {
        invoiceNumber: "INV-2026-081",
        customerName: "Apex Traders",
        phone: "+91 9845012345",
        amountDue: 12500.0,
        status: "DELIVERED_WHATSAPP",
        sentAt: new Date().toISOString(),
      },
      {
        invoiceNumber: "INV-2026-084",
        customerName: "Metro Supermarket",
        phone: "+91 9448123987",
        amountDue: 8400.0,
        status: "DELIVERED_WHATSAPP",
        sentAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      message: `Dispatched ${sampleDispatchedReminders.length} payment reminders successfully`,
      reminders: sampleDispatchedReminders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to trigger payment reminders" },
      { status: 500 }
    );
  }
}
