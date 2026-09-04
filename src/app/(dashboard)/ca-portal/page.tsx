import { getCaPortalData } from "@/actions/ca-portal";
import { CaAuditorView } from "@/components/accounting/ca-auditor-view";

export const dynamic = "force-dynamic";

export default async function CaPortalPage() {
  const data = await getCaPortalData();

  return <CaAuditorView data={data} />;
}
