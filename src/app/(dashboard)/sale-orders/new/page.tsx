import { DocumentNewPage } from "@/components/documents/document-form-pages";

export const dynamic = "force-dynamic";

export default function NewSaleOrderPage() {
  return <DocumentNewPage documentType="SALE_ORDER" />;
}
