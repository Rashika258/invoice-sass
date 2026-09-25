import { Metadata } from "next";
import { ApprovalCenterView } from "@/components/approvals/approval-center-view";

export const metadata: Metadata = {
  title: "Approval Queues | Billora ERP",
  description: "Maker-checker review workflows for high-value discounts, credit notes, stock adjustments, and cancellations.",
};

export default function ApprovalsPage() {
  return <ApprovalCenterView />;
}
