import { DocumentEditPage } from "@/components/documents/document-form-pages";

export const dynamic = "force-dynamic";

export default async function EditPurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DocumentEditPage id={id} />;
}
