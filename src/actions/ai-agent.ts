"use server";

import { requireOrganization } from "@/lib/organization";
import { AI_TOOL_DEFINITIONS, executeAiTool } from "@/lib/ai-tools";
import { askBusinessAi } from "@/actions/business-ai";

export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  toolCalls?: Array<{ name: string; args: any }>;
  toolResult?: any;
  createdAt: string;
}

export interface AiAgentResponse {
  message: ChatMessage;
  executedTools?: Array<{ toolName: string; args: any; result: any }>;
  actionHref?: string;
  actionLabel?: string;
}

export async function processAiUserQuery(
  userQuery: string,
  history: ChatMessage[] = []
): Promise<AiAgentResponse> {
  const org = await requireOrganization();
  const query = userQuery.trim();

  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // ─── 1. If OpenAI API key is configured ────────────────────────────────────
  if (openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are the AI Business Brain of Billora Business OS for ${org.name}. Answer user questions concisely based on live tool data. Speak professionally, encouraging growth and tight cash management.`,
            },
            ...history.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: query },
          ],
          tools: AI_TOOL_DEFINITIONS.map((t) => ({
            type: "function",
            function: { name: t.name, description: t.description, parameters: t.parameters },
          })),
          tool_choice: "auto",
        }),
      });

      const data = await response.json();
      const choice = data.choices?.[0]?.message;

      if (choice?.tool_calls?.length > 0) {
        const executedTools = [];
        for (const call of choice.tool_calls) {
          const toolName = call.function.name;
          const args = JSON.parse(call.function.arguments || "{}");
          const result = await executeAiTool(toolName, args);
          executedTools.push({ toolName, args, result });
        }

        // Second pass to LLM with tool result
        const followUp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are the AI Business Brain of Billora Business OS for ${org.name}. Summarize tool execution cleanly for the user.`,
              },
              ...history.map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: query },
              choice,
              {
                role: "tool",
                tool_call_id: choice.tool_calls[0].id,
                content: JSON.stringify(executedTools[0].result),
              },
            ],
          }),
        });

        const followData = await followUp.json();
        const finalContent = followData.choices?.[0]?.message?.content || "Executed tool actions successfully.";

        return {
          message: {
            id: Math.random().toString(36).slice(2),
            role: "assistant",
            content: finalContent,
            createdAt: new Date().toISOString(),
          },
          executedTools,
          actionHref: (executedTools[0]?.result as any)?.actionHref,
          actionLabel: (executedTools[0]?.result as any)?.actionLabel,
        };
      }

      if (choice?.content) {
        return {
          message: {
            id: Math.random().toString(36).slice(2),
            role: "assistant",
            content: choice.content,
            createdAt: new Date().toISOString(),
          },
        };
      }
    } catch (err) {
      console.error("OpenAI call error, falling back to analytical router:", err);
    }
  }

  // ─── 2. Analytical Router & Multi-Tool Fallback Engine ──────────────────────
  const q = query.toLowerCase();

  let toolName = "get_business_summary";
  let args: Record<string, any> = {};

  if (q.includes("owe") || q.includes("due") || q.includes("pending") || q.includes("debt") || q.includes("collect") || q.includes("customer")) {
    toolName = "get_outstanding_receivables";
  } else if (q.includes("stock") || q.includes("low") || q.includes("reorder") || q.includes("inventory") || q.includes("item")) {
    toolName = "get_inventory_alerts";
  } else if (q.includes("profit") || q.includes("loss") || q.includes("margin") || q.includes("p&l") || q.includes("income")) {
    toolName = "get_profit_and_loss_summary";
  } else if (q.includes("expense") || q.includes("spend") || q.includes("cost") || q.includes("outflow")) {
    toolName = "get_expenses_summary";
  } else if (q.includes("sales") || q.includes("top") || q.includes("best") || q.includes("revenue")) {
    toolName = "get_sales_analytics";
  }

  const toolResult = await executeAiTool(toolName, args);

  // Synthesize natural language answer
  const legacyInsight = await askBusinessAi(query);

  return {
    message: {
      id: Math.random().toString(36).slice(2),
      role: "assistant",
      content: `${legacyInsight.headline}\n\n${legacyInsight.summary}`,
      createdAt: new Date().toISOString(),
    },
    executedTools: [{ toolName, args, result: toolResult }],
    actionHref: legacyInsight.actionHref,
    actionLabel: legacyInsight.actionLabel,
  };
}
