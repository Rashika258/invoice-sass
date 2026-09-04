import Link from "next/link";
import { ArrowLeft, CheckCircle2, Copy, ExternalLink, Globe, Star, ThumbsUp } from "lucide-react";
import { getCompanyProfile } from "@/actions/settings";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GoogleProfilePage() {
  const profile = await getCompanyProfile();
  const companyName = profile?.companyName || "My Business";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/grow/online-store"
            className="flex size-8 items-center justify-center rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Globe className="size-5 text-blue-500" />
              Google Profile Manager
            </h1>
            <p className="text-xs text-muted-foreground">
              Boost your local business visibility, collect 5-star customer reviews, and rank on Google Maps.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500 font-black text-xl">
              G
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{companyName}</h3>
              <div className="flex items-center gap-1 text-amber-500 text-xs mt-0.5">
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <span className="text-muted-foreground ml-1">(5.0 • 48 reviews)</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            88% of local buyers check Google reviews before visiting a store or placing an order. Share your review link on WhatsApp bills.
          </p>

          <div className="rounded-xl border border-border/80 bg-muted/30 p-3 flex items-center justify-between text-xs font-mono">
            <span className="truncate">https://g.page/r/{companyName.toLowerCase().replace(/\s+/g, "")}/review</span>
            <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold">
              <Copy className="size-3 mr-1" />
              Copy
            </Button>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Review Request Strategy
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Auto-include Google review link on WhatsApp invoices</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Send automated thank-you note when payment is received</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Display verified Google badge on printed invoices</span>
            </div>
          </div>

          <Link
            href="/settings"
            className={cn(buttonVariants(), "w-full text-xs font-semibold rounded-xl mt-4")}
          >
            Configure Profile Settings
          </Link>
        </Card>
      </div>
    </div>
  );
}
