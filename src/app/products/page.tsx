import Link from "next/link";
import { ArrowLeft, Package, PlusCircle, ShieldCheck } from "lucide-react";
import { getPublicProducts } from "@/actions/items";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { PublicCatalogView } from "@/components/products/public-catalog-view";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PublicProductsPage() {
  const products = await getPublicProducts();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-xl")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-foreground">Product Catalog</h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  <ShieldCheck className="size-3" /> Verified Directory
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Public storefront &amp; order inquiries • No login required
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl font-semibold text-xs")}
            >
              Business Login
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "sm" }), "rounded-xl font-semibold text-xs hidden sm:flex")}
            >
              <PlusCircle className="mr-1.5 size-3.5" />
              List Products
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <Card className="mt-8 rounded-2xl border border-border/80 shadow-xs">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground/60" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">No products available yet</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check back soon or sign in to publish your business catalog.
                </p>
              </div>
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "sm" }), "rounded-xl font-semibold")}
              >
                Create a business account
              </Link>
            </CardContent>
          </Card>
        ) : (
          <PublicCatalogView products={products as any} />
        )}
      </main>
    </div>
  );
}
