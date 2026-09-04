import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Redirect old import-tally URL to the new unified Tally Hub
export default function ImportTallyPage() {
  redirect("/tally");
}
