import { Plus } from "lucide-react";
import { getItems } from "@/actions/items";
import { getCompanyProfile } from "@/actions/settings";
import {
  DeleteItemButton,
  ItemFormDialog,
} from "@/components/items/item-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/invoice-utils";

export default async function ItemsPage() {
  const [items, profile] = await Promise.all([getItems(), getCompanyProfile()]);
  const currency = profile?.currency ?? "USD";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Items</h1>
          <p className="text-muted-foreground">
            Build a catalog of products and services for quick invoice creation.
          </p>
        </div>
        <ItemFormDialog
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalog ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No items yet. Add services or products to reuse on invoices.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description || "—"}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPrice, currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ItemFormDialog
                          item={item}
                          trigger={
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          }
                        />
                        <DeleteItemButton itemId={item.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
