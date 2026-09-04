import { DocumentListPage } from "@/components/documents/document-list-page";

export const dynamic = "force-dynamic";

export default function SaleOrdersPage() {
  return <DocumentListPage documentType="SALE_ORDER" />;
}
