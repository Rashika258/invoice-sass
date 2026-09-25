import type { Metadata } from "next";
import { FeatureMaturityView } from "@/components/settings/feature-maturity-view";

export const metadata: Metadata = {
  title: "Feature Maturity Index | Billora ERP",
  description:
    "Current production readiness status for all Billora features — Stable, Beta, Experimental, Needs Setup, and Online Only.",
};

export default function FeatureMaturityPage() {
  return <FeatureMaturityView />;
}
