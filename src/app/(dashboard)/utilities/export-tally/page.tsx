import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Redirect old export-tally URL to the new unified Tally Hub
export default function ExportTallyPage() {
  redirect("/tally");
}
