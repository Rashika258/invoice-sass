import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { getPublicProducts } from "@/actions/items";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/invoice-utils";

export const dynamic = "force-dynamic";

export default async function PublicProductsPage() {
  const products = await getPublicProducts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" render={<Link href="/" />}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Product Catalog</h1>
              <p className="text-sm text-muted-foreground">No login required</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" render={<Link href="/login" />}>
              Business login
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground" />
              <div>
                <h2 className="text-xl font-semibold">No products available yet</h2>
                <p className="mt-1 text-muted-foreground">
                  Check back soon or sign in to publish your own catalog.
                </p>
              </div>
              <Button render={<Link href="/register" />}>Create a business account</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardContent className="space-y-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.organization.profile?.companyName ?? "Business"}
                    </p>
                  </div>
                  {product.description && (
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {product.unit ?? "unit"}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(
                        product.unitPrice,
                        product.organization.profile?.currency ?? "USD",
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
