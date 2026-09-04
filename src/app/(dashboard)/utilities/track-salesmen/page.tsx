import { Metadata } from "next";
import Link from "next/link";
import { UserCircle, DollarSign, TrendingUp, Award, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Track Salesmen | Billora",
};

export default function TrackSalesmenPage() {
  const reps = [
    { name: "Praveen Kumar", region: "Bengaluru South & Peenya", sales: "₹ 4,82,000", commission: "₹ 14,460 (3%)", invoices: 28, status: "Top Performer" },
    { name: "Anil Murthy", region: "Hosur & Electronic City", sales: "₹ 3,25,000", commission: "₹ 9,750 (3%)", invoices: 19, status: "Active" },
    { name: "Suresh Gowda", region: "Rajajinagar & Industrial Hub", sales: "₹ 2,10,000", commission: "₹ 6,300 (3%)", invoices: 14, status: "Active" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCircle className="size-5 text-brand" />
            <span>Field Salesmen &amp; Commission Tracking</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor sales revenue, incentive calculations, and customer order deliveries mapped per sales representative.
          </p>
        </div>
        <Link href="/team">
          <Button size="sm" className="bg-brand text-white font-bold text-xs rounded-xl shadow-xs">
            + Add Sales Rep
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Sales Representatives Performance</h3>
          <span className="text-xs text-muted-foreground">Current Month (September 2026)</span>
        </div>

        <div className="divide-y divide-border/60">
          {reps.map((rep, idx) => (
            <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-brand-light text-brand flex items-center justify-center font-bold text-xs">
                  {rep.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-foreground">{rep.name}</h4>
                    <Badge variant="outline" className="text-[10px] text-brand border-brand/30 bg-brand-light font-semibold">
                      {rep.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{rep.region} • {rep.invoices} invoices billed</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-right">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Turnover</span>
                  <span className="font-bold text-foreground">{rep.sales}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Commission</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{rep.commission}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
