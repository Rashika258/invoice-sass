import { describe, expect, it } from "vitest";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";

describe("Generic UI Component Suite", () => {
  it("should export PageHeader component", () => {
    expect(typeof PageHeader).toBe("function");
  });

  it("should export MetricCard component", () => {
    expect(typeof MetricCard).toBe("function");
  });

  it("should export StatusBadge component", () => {
    expect(typeof StatusBadge).toBe("function");
  });
});
