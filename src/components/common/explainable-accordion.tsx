import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ExplainableAccordionProps {
  title: string;
  /** Content can be any React node, typically markdown rendered via a component */
  content: React.ReactNode;
}

export function ExplainableAccordion({ title, content }: ExplainableAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="explainable">
        <AccordionTrigger className="text-sm font-medium">
          {title}
        </AccordionTrigger>
        <AccordionContent className="text-xs text-muted-foreground">
          {content}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
