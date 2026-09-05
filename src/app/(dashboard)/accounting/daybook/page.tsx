import { Metadata } from "next";
import { getDayBook } from "@/actions/accounting";
import { DayBookView } from "@/components/accounting/day-book-view";

export const metadata: Metadata = {
  title: "Day Book | Billora Accounting",
  description: "View all posted financial vouchers for any selected date.",
};

export const dynamic = "force-dynamic";

export default async function DayBookPage() {
  const today = new Date().toISOString().slice(0, 10);
  const rawVouchers = await getDayBook(today);

  // Format date to ISO string for Client Component
  const vouchers = rawVouchers.map((v) => ({
    ...v,
    date: v.date.toISOString().slice(0, 10),
  }));

  return <DayBookView initialDate={today} vouchers={vouchers} />;
}
