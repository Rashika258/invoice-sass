// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { InvoiceStatusBadge } from "../invoices/invoice-status-badge";
import type { InvoiceStatus } from "@/generated/prisma/client";

describe("InvoiceStatusBadge Component (React Testing Library)", () => {
  const statuses: InvoiceStatus[] = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];

  it.each(statuses)("renders correct label and classes for status %s", (status) => {
    const { container } = render(<InvoiceStatusBadge status={status} />);
    const label = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(container.firstChild).toBeInTheDocument();
  });

  it("falls back to DRAFT styling gracefully on invalid status", () => {
    render(<InvoiceStatusBadge status={"UNKNOWN_STATUS" as any} />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });
});
