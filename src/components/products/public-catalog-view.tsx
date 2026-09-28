"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Eye,
  Filter,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/invoice-utils";

export type PublicProduct = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  hsn: string | null;
  unitPrice: number;
  unit: string | null;
  gstRate: number;
  stockQty: number;
  minStock: number;
  itemType: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    profile: {
      companyName: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
      city: string | null;
      state: string | null;
      currency: string | null;
      logo: string | null;
    } | null;
  };
};

export function PublicCatalogView({ products }: { products: PublicProduct[] }) {
  const [search, setSearch] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);

  // Extract unique businesses for filtering
  const businesses = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      const name = p.organization.profile?.companyName || p.organization.name || "Business";
      map.set(p.organizationId, name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  // Filter & sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const query = search.toLowerCase().trim();
        const bizName = (p.organization.profile?.companyName || p.organization.name).toLowerCase();
        const matchesSearch =
          !query ||
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          bizName.includes(query) ||
          (p.hsn && p.hsn.toLowerCase().includes(query));

        const matchesBiz = selectedBusiness === "ALL" || p.organizationId === selectedBusiness;

        return matchesSearch && matchesBiz;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.unitPrice - b.unitPrice;
        if (sortBy === "price-desc") return b.unitPrice - a.unitPrice;
        return 0;
      });
  }, [products, search, selectedBusiness, sortBy]);

  // Helper to build WhatsApp direct link
  const buildWhatsAppUrl = (product: PublicProduct) => {
    const rawPhone = product.organization.profile?.phone || "919483374137";
    const phone = rawPhone.replace(/[^0-9]/g, "");
    const company = product.organization.profile?.companyName || product.organization.name;
    const currency = product.organization.profile?.currency || "INR";
    const price = formatCurrency(product.unitPrice, currency);
    const unit = product.unit || "unit";

    const text = encodeURIComponent(
      `Hello ${company}! 👋\n\nI am interested in ordering:\n📦 *${product.name}*\n💰 Price: ${price} / ${unit}\n\nCould you please confirm availability and payment/delivery details? Thank you!`
    );

    return `https://wa.me/${phone.startsWith("91") || phone.length > 10 ? phone : `91${phone}`}?text=${text}`;
  };

  // Helper to build Store link
  const buildStoreUrl = (product: PublicProduct) => {
    const compName = product.organization.profile?.companyName || product.organization.name;
    const slug = compName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `/store/${slug || product.organizationId}`;
  };

  const handleShare = (product: PublicProduct) => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} on Billora!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Catalog link copied to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, specs, or company..."
              className="pl-9 h-10 text-xs sm:text-sm rounded-xl border-border bg-muted/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="h-10 rounded-xl border border-border bg-muted/30 px-3 text-xs font-semibold text-foreground outline-hidden cursor-pointer"
            >
              <option value="ALL">All Businesses ({businesses.length})</option>
              {businesses.map((biz) => (
                <option key={biz.id} value={biz.id}>
                  {biz.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 rounded-xl border border-border bg-muted/30 px-3 text-xs font-semibold text-foreground outline-hidden cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Counter and quick badges */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} available
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
              <CheckCircle2 className="size-3" /> Live Inventory
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Direct WhatsApp ordering &amp; instant invoices
          </span>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <h2 className="text-xl font-semibold">No products found</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {search
                  ? `No items matched "${search}". Try clearing your search or filter.`
                  : "No products are currently published in this catalog."}
              </p>
            </div>
            {search && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedBusiness("ALL");
                }}
              >
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const companyName =
              product.organization.profile?.companyName || product.organization.name || "Business";
            const currency = product.organization.profile?.currency || "INR";
            const isAvailable = product.stockQty > 0;
            const waUrl = buildWhatsAppUrl(product);
            const storeUrl = buildStoreUrl(product);

            return (
              <Card
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-xl cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="space-y-3">
                  {/* Product Image Area */}
                  <div className="relative aspect-square sm:aspect-4/3 w-full overflow-hidden bg-muted/40 flex items-center justify-center border-b border-border/60">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                          <Package className="size-7" />
                        </div>
                        <span className="text-[11px] font-medium opacity-60">No image uploaded</span>
                      </div>
                    )}

                    {/* Stock badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-md shadow-xs ${
                          isAvailable
                            ? "bg-emerald-500/90 text-white"
                            : "bg-muted/90 text-muted-foreground"
                        }`}
                      >
                        {isAvailable ? "In Stock" : "On Request"}
                      </span>
                    </div>

                    {/* Quick View Pill on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-bold text-foreground shadow-lg backdrop-blur">
                        <Eye className="size-3.5" /> Quick View
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 pt-1 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <Store className="size-3 text-primary shrink-0" />
                      <span className="truncate">{companyName}</span>
                    </div>

                    <h3
                      className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors"
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Pricing & Action Bar */}
                <div className="p-4 pt-0 space-y-3">
                  <div className="flex items-baseline justify-between border-t border-border/60 pt-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      Per {product.unit ?? "unit"}
                    </span>
                    <span className="text-lg font-bold font-mono text-primary">
                      {formatCurrency(product.unitPrice, currency)}
                    </span>
                  </div>

                  {/* Action Buttons: Next Steps */}
                  <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                      title="Order directly on WhatsApp"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <Link
                      href={storeUrl}
                      className="flex items-center justify-center gap-1.5 h-8 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold shadow-xs transition-colors"
                      title="Visit business storefront"
                    >
                      <ShoppingBag className="size-3.5 text-primary" />
                      <span>Store</span>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Interactive Next-Step Product Detail Modal */}
      <Dialog
        open={Boolean(selectedProduct)}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        {selectedProduct && (
          <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="max-h-[85vh] overflow-y-auto">
              {/* Product Large Image Preview */}
              <div className="relative aspect-video sm:aspect-16/9 w-full bg-muted/50 overflow-hidden flex items-center justify-center border-b border-border/60">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                      <Package className="size-8" />
                    </div>
                    <span className="text-xs font-semibold">No image available for this product</span>
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-md ${
                      selectedProduct.stockQty > 0
                        ? "bg-emerald-600 text-white"
                        : "bg-muted/90 text-muted-foreground"
                    }`}
                  >
                    <CheckCircle2 className="size-3.5" />
                    {selectedProduct.stockQty > 0
                      ? `${selectedProduct.stockQty} ${selectedProduct.unit || "units"} In Stock`
                      : "Available on Order"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleShare(selectedProduct)}
                  className="absolute top-3 right-3 size-8 rounded-full bg-background/80 hover:bg-background text-foreground flex items-center justify-center shadow-md backdrop-blur transition-colors cursor-pointer"
                  title="Share product link"
                >
                  <Share2 className="size-4" />
                </button>
              </div>

              {/* Product Specifications & Details */}
              <div className="p-6 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {selectedProduct.itemType}
                    </Badge>
                    {selectedProduct.hsn && (
                      <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                        HSN: {selectedProduct.hsn}
                      </Badge>
                    )}
                    {selectedProduct.gstRate > 0 && (
                      <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                        GST: {selectedProduct.gstRate}%
                      </Badge>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-foreground leading-snug">
                    {selectedProduct.name}
                  </h2>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-primary">
                      {formatCurrency(
                        selectedProduct.unitPrice,
                        selectedProduct.organization.profile?.currency || "INR"
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      / {selectedProduct.unit ?? "unit"} (incl. taxes)
                    </span>
                  </div>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <div className="space-y-1.5 rounded-xl border border-border/70 bg-muted/20 p-3.5">
                    <h4 className="text-xs font-semibold text-foreground">Specifications &amp; Details</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                {/* Seller & Business Card */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                        <Store className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-foreground">
                            {selectedProduct.organization.profile?.companyName ||
                              selectedProduct.organization.name}
                          </h4>
                          <span title="Verified Seller">
                            <ShieldCheck className="size-3.5 text-primary" />
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="size-3" />
                          <span>
                            {selectedProduct.organization.profile?.city ||
                              selectedProduct.organization.profile?.address ||
                              "Verified Supplier"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <Link
                      href={buildStoreUrl(selectedProduct)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Visit Store</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>

                  {selectedProduct.organization.profile?.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
                      <Phone className="size-3 text-muted-foreground" />
                      <span>Seller Contact: {selectedProduct.organization.profile.phone}</span>
                    </div>
                  )}
                </div>

                {/* Next Step Primary Actions */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    <span>Next Step: Order or Inquire</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={buildWhatsAppUrl(selectedProduct)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <MessageCircle className="size-4" />
                      <span>Order on WhatsApp</span>
                    </a>

                    <Link
                      href={buildStoreUrl(selectedProduct)}
                      className="flex items-center justify-center gap-2 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <ShoppingBag className="size-4" />
                      <span>Checkout on Store</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
