import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background">
      <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4 font-bold text-2xl text-muted-foreground">
        📶
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">You are currently offline</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        Billora has cached your recent forms. Please reconnect to the internet to sync pending transactions.
      </p>
      <div className="mt-6">
        <Link href="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
