"use client";

import { useState } from "react";
import { BookOpen, HelpCircle, Search, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface GlossaryItem {
  term: string;
  simpleExplanation: string;
  technicalTerm: string;
  category: "ACCOUNTING" | "GST" | "INVENTORY" | "PAYMENTS";
}

const GLOSSARY: GlossaryItem[] = [
  {
    term: "Receivables",
    simpleExplanation: "Total money your customers still owe you for sales billed on credit.",
    technicalTerm: "Sundry Debtors / Accounts Receivable",
    category: "ACCOUNTING",
  },
  {
    term: "Payables",
    simpleExplanation: "Total money you owe to suppliers/vendors for purchases or raw materials.",
    technicalTerm: "Sundry Creditors / Accounts Payable",
    category: "ACCOUNTING",
  },
  {
    term: "Trial Balance",
    simpleExplanation: "A safety check verifying that total debit amounts equal total credit amounts across all ledgers.",
    technicalTerm: "Trial Balance Statement",
    category: "ACCOUNTING",
  },
  {
    term: "Contra Voucher",
    simpleExplanation: "A internal money transfer between your cash drawer and bank account (or bank-to-bank).",
    technicalTerm: "Contra Entry (F4 in Tally)",
    category: "ACCOUNTING",
  },
  {
    term: "Credit Note",
    simpleExplanation: "A document issued to a customer when they return goods or receive a discount after invoicing.",
    technicalTerm: "Sales Return / Credit Note (Form GST INV-1)",
    category: "GST",
  },
  {
    term: "HSN / SAC Code",
    simpleExplanation: "Standard government code used to categorize goods (HSN) or services (SAC) for GST tax calculation.",
    technicalTerm: "Harmonized System of Nomenclature",
    category: "GST",
  },
  {
    term: "Reorder Level / Buffer",
    simpleExplanation: "The minimum quantity threshold where Billora alerts you to reorder before stock runs out.",
    technicalTerm: "Minimum Stock Threshold",
    category: "INVENTORY",
  },
];

export function HelpCenterModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [search, setSearch] = useState("");

  const filtered = GLOSSARY.filter(
    (g) =>
      g.term.toLowerCase().includes(search.toLowerCase()) ||
      g.simpleExplanation.toLowerCase().includes(search.toLowerCase()) ||
      g.technicalTerm.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 select-none">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-base font-extrabold flex items-center gap-2 text-foreground">
            <HelpCircle className="size-5 text-brand" />
            <span>Billora Business Help Center &amp; Dictionary</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Plain-language explanations of Indian accounting terms, GST rules, and software workflows.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search terms like Receivables, Contra, Credit Note, GST..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
              autoFocus
            />
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No matching business terms found for &quot;{search}&quot;.
              </p>
            ) : (
              filtered.map((item) => (
                <div key={item.term} className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-foreground">{item.term}</h4>
                    <Badge variant="outline" className="text-[9px] font-mono font-bold">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.simpleExplanation}
                  </p>
                  <div className="text-[10px] text-brand font-mono font-semibold pt-0.5">
                    Technical Term: {item.technicalTerm}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
