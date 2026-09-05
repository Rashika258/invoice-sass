"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  CornerDownLeft,
  Loader2,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { askBusinessAi, type AiInsightResult } from "@/actions/business-ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const SUGGESTED_QUERIES = [
  { label: "💰 Who owes me the most money?", query: "Who owes me the most money?" },
  { label: "🏆 Top selling items", query: "What are my top selling items this month?" },
  { label: "⚠️ Low stock reorder alerts", query: "Which items are running low on stock?" },
  { label: "📊 Profit margin breakdown", query: "Show net profit margin and business health" },
];

export function AiBusinessAssistant() {
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiInsightResult | null>(null);

  const handleAsk = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await askBusinessAi(query);
      setResult(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze business data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-primary/20 bg-linear-to-br from-card via-card to-primary/5 shadow-xs overflow-hidden select-none">
      <CardHeader className="p-4 sm:p-5 border-b border-border/40 bg-card/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold text-foreground">
                  Billora Business OS • AI Brain &amp; Assistant
                </CardTitle>
                <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[9px] font-bold">
                  NLP INSIGHTS
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Instant answers to financial health, pending dues, profitability &amp; inventory trends.
              </p>
            </div>
          </div>
        </div>

        {/* Query Suggestion Chips */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto">
          {SUGGESTED_QUERIES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setInputQuery(item.query);
                handleAsk(item.query);
              }}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all shrink-0 cursor-pointer border border-border/40"
            >
              {item.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything (e.g. 'How much GST did I collect?', 'Which customers have overdue bills?')..."
              className="h-10 text-xs rounded-xl pr-10 bg-background"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs shrink-0"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <span>Ask AI</span>
                <Send className="size-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </form>

        {/* AI Answer Card */}
        {result && (
          <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3.5 animate-in fade-in duration-300">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Bot className="size-3.5" />
                  <span>AI Business Insight</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">Analyzed live from database</span>
              </div>
              <h4 className="text-sm font-black text-foreground mt-1">{result.headline}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{result.summary}</p>
            </div>

            {/* Metrics Strip */}
            {result.metrics && result.metrics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {result.metrics.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-border/60 bg-card">
                    <span className="text-[10px] text-muted-foreground font-medium">{m.label}</span>
                    <div className="text-sm font-bold font-mono text-foreground mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Items List Breakdown */}
            {result.itemsList && result.itemsList.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card divide-y divide-border overflow-hidden text-xs">
                {result.itemsList.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground">{item.name}</span>
                      <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                    </div>
                    <div className="text-right">
                      {item.amount && <div className="font-mono font-bold text-foreground">{item.amount}</div>}
                      {item.badge && (
                        <Badge className="bg-primary/10 text-primary border-none text-[9px] mt-0.5">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Button */}
            {result.actionLabel && result.actionHref && (
              <div className="pt-1">
                <Link
                  href={result.actionHref}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition-all active:scale-[0.98]"
                >
                  <span>{result.actionLabel}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
