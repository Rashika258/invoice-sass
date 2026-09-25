import { db } from "@/db";
import { recordAuditLog } from "@/lib/audit";
import { itemSchema, type ItemInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

const MAX_PAGE_SIZE = 100;

export class ItemService {
  static async list(organizationId: string) {
    return db.item.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    });
  }

  static async listPaginated(organizationId: string, options: { page?: number; limit?: number; search?: string }) {
    const page = Number.isFinite(options.page) ? Math.max(1, Math.floor(options.page!)) : 1;
    const limit = Number.isFinite(options.limit) ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(options.limit!))) : 10;
    const skip = (page - 1) * limit;
    const search = options.search?.trim().slice(0, 100);

    const where = {
      organizationId,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { hsn: { contains: search } },
              { barcode: { contains: search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      db.item.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      db.item.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async create(organizationId: string, data: ItemInput) {
    const parsed = itemSchema.parse(data);
    const item = await db.item.create({
      data: {
        organizationId,
        ...parsed,
      },
    });

    await recordAuditLog({
      organizationId,
      action: "CREATE",
      entity: "Item",
      entityId: item.id,
      changes: { name: item.name, unitPrice: item.unitPrice },
    });


    revalidatePath("/items");
    return item;
  }

  static async update(organizationId: string, id: string, data: ItemInput) {
    const parsed = itemSchema.parse(data);
    const existing = await db.item.findFirst({ where: { id, organizationId } });
    if (!existing) throw new Error("Item not found");

    const updated = await db.item.update({
      where: { id },
      data: parsed,
    });

    await recordAuditLog({
      organizationId,
      action: "UPDATE",
      entity: "Item",
      entityId: id,
      changes: { name: updated.name },
    });

    revalidatePath("/items");
    return updated;
  }

  static async delete(organizationId: string, id: string) {
    const existing = await db.item.findFirst({ where: { id, organizationId } });
    if (!existing) throw new Error("Item not found");

    await db.item.delete({ where: { id } });

    await recordAuditLog({
      organizationId,
      action: "DELETE",
      entity: "Item",
      entityId: id,
      changes: { name: existing.name },
    });

    revalidatePath("/items");
  }
}
