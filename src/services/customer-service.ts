import { db } from "@/db";
import { recordAuditLog } from "@/lib/audit";
import { customerSchema, type CustomerInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

const MAX_PAGE_SIZE = 100;

export class CustomerService {
  static async list(organizationId: string, type?: "CUSTOMER" | "SUPPLIER" | "BOTH") {
    return db.customer.findMany({
      where: {
        organizationId,
        ...(type ? { partyType: { in: [type, "BOTH"] } } : {}),
      },
      orderBy: { name: "asc" },
    });
  }

  static async listPaginated(organizationId: string, options: { page?: number; limit?: number; search?: string; partyType?: string }) {
    const page = Number.isFinite(options.page) ? Math.max(1, Math.floor(options.page!)) : 1;
    const limit = Number.isFinite(options.limit) ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(options.limit!))) : 10;
    const skip = (page - 1) * limit;
    const search = options.search?.trim().slice(0, 100);

    const where = {
      organizationId,
      ...(options.partyType ? { partyType: options.partyType as any } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
              { gstin: { contains: search } },
            ],
          }
        : {}),
    };

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      db.customer.count({ where }),
    ]);

    return {
      customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async create(organizationId: string, data: CustomerInput) {
    const parsed = customerSchema.parse(data);
    const customer = await db.customer.create({
      data: {
        organizationId,
        ...parsed,
      },
    });

    await recordAuditLog({
      organizationId,
      action: "CREATE",
      entity: "Party",
      entityId: customer.id,
      changes: { name: customer.name, partyType: customer.partyType },
    });

    revalidatePath("/customers");
    return customer;
  }

  static async update(organizationId: string, id: string, data: CustomerInput) {
    const parsed = customerSchema.parse(data);
    const existing = await db.customer.findFirst({ where: { id, organizationId } });
    if (!existing) throw new Error("Party not found");

    const updated = await db.customer.update({
      where: { id },
      data: parsed,
    });

    await recordAuditLog({
      organizationId,
      action: "UPDATE",
      entity: "Party",
      entityId: id,
      changes: { name: updated.name },
    });

    revalidatePath("/customers");
    return updated;
  }

  static async delete(organizationId: string, id: string) {
    const existing = await db.customer.findFirst({ where: { id, organizationId } });
    if (!existing) throw new Error("Party not found");

    await db.customer.delete({ where: { id } });

    await recordAuditLog({
      organizationId,
      action: "DELETE",
      entity: "Party",
      entityId: id,
      changes: { name: existing.name },
    });

    revalidatePath("/customers");
  }
}
