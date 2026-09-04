"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Item } from "@/generated/prisma/client";
import { createItem, deleteItem, updateItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ItemFormDialogProps = {
  item?: Item;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
};

export function ItemFormDialog({ item, trigger, onSuccess }: ItemFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      hsn: String(formData.get("hsn") ?? ""),
      unitPrice: Number(formData.get("unitPrice") ?? 0),
      unit: String(formData.get("unit") ?? "unit"),
      isPublic: formData.get("isPublic") === "on",
    };

    try {
      if (item) {
        await updateItem(item.id, data);
        toast.success("Item updated");
      } else {
        await createItem(data);
        toast.success("Item created");
      }

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (trigger ?? <Button>{item ? "Edit Item" : "Add Item"}</Button>) as React.ReactElement
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Add Item"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" defaultValue={item?.name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={item?.description ?? ""}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hsn">HSN / SAC code</Label>
            <Input id="hsn" name="hsn" defaultValue={item?.hsn ?? ""} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price *</Label>
              <Input
                id="unitPrice"
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={item?.unitPrice ?? 0}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                name="unit"
                defaultValue={item?.unit ?? "unit"}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isPublic"
              name="isPublic"
              type="checkbox"
              defaultChecked={item?.isPublic ?? false}
              className="size-4 rounded border-input"
            />
            <Label htmlFor="isPublic">Show in public product catalog</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteItemButton({
  itemId,
  onSuccess,
}: {
  itemId: string;
  onSuccess?: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this item?")) return;

    setIsDeleting(true);
    try {
      await deleteItem(itemId);
      toast.success("Item deleted");
      onSuccess?.();
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      Delete
    </Button>
  );
}
