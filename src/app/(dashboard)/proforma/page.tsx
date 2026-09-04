import { DocumentListPage } from "@/components/documents/document-list-page";

export const dynamic = "force-dynamic";

export default function ProformaPage() {
  return <DocumentListPage documentType="PROFORMA" />;
}
