"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  Send,
  Loader2,
  X,
  ArrowRight,
  TrendingUp,
  Package,
  Users,
  Wallet,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { processAiUserQuery, type ChatMessage } from "@/actions/ai-agent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTED_PROMPTS = [
  "💰 Who owes me the most money?",
  "⚠️ Which products are running low on stock?",
  "📊 What is my profit margin this month?",
  "🧾 Show top selling items & revenue",
  "💸 How much did I spend on expenses?",
];

export function AiChatDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am the AI Business Brain of Billora Business OS. Ask me anything about your sales, pending customer dues, stock shortages, profit margins, or expenses.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (customPrompt?: string) => {
    const queryText = customPrompt || input;
    if (!queryText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      content: queryText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput("");
    setLoading(true);

    try {
      const response = await processAiUserQuery(queryText.trim(), messages);
      setMessages((prev) => [...prev, response.message]);
    } catch (e: any) {
      toast.error(e.message || "Failed to process AI query");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg h-full bg-card border-l border-border flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand text-white shadow-xs">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">AI Business Brain</h3>
                <Badge className="bg-brand-light text-brand border-brand/20 text-[9px] font-bold">
                  AUTOPILOT
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">Billora Business OS Intelligence</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="p-3 border-b border-border/60 bg-background/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-muted/60 hover:bg-brand-light hover:text-brand text-muted-foreground border border-border/60 transition-all shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="size-7 rounded-lg bg-brand text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="size-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed space-y-2 ${
                  msg.role === "user"
                    ? "bg-brand text-white font-medium rounded-tr-xs"
                    : "bg-muted/50 border border-border/80 text-foreground rounded-tl-xs"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.toolResult && (
                  <div className="mt-2 pt-2 border-t border-border/60 text-[11px] space-y-1">
                    <span className="font-bold text-brand">Live Tool Query:</span>
                    <pre className="p-2 rounded bg-background font-mono text-[10px] overflow-x-auto">
                      {JSON.stringify(msg.toolResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center text-muted-foreground">
              <div className="size-7 rounded-lg bg-brand/20 text-brand flex items-center justify-center shrink-0">
                <Loader2 className="size-4 animate-spin" />
              </div>
              <span className="text-xs font-semibold text-brand">Analyzing live database...</span>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-border bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your business..."
              className="h-10 text-xs rounded-xl bg-background"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 px-4 rounded-xl bg-brand text-white hover:opacity-90 font-bold text-xs shrink-0 cursor-pointer"
            >
              <Send className="size-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
