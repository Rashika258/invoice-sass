import { DocumentEditPage } from "@/components/documents/document-form-pages";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DocumentEditPage id={id} />;
}
