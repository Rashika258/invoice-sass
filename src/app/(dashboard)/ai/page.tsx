import { Metadata } from "next";
import { AiBusinessAssistant } from "@/components/dashboard/ai-business-assistant";

export const metadata: Metadata = {
  title: "AI Business Brain & Autopilot | Billora OS",
  description: "Instant natural language business answers, predictive stock alerts, customer aging analysis, and automated workflows.",
};

export const dynamic = "force-dynamic";

export default function AiHubPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      <div className="space-y-1 border-b border-border pb-4">
        <h1 className="text-xl font-black tracking-tight text-foreground">
          AI Business Brain &amp; Autopilot
        </h1>
        <p className="text-xs text-muted-foreground">
          Ask natural language questions about your revenue, overdue balances, profit margins, and reorder forecasts.
        </p>
      </div>

      <AiBusinessAssistant />
    </div>
  );
}
