"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/auth";
import type { UserRole } from "@/generated/prisma/client";

const createTeamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "STAFF"]),
});

export async function getTeamMembers() {
  const user = await requireUser();
  return db.user.findMany({
    where: { organizationId: user.organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createTeamMember(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = createTeamMemberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "A user with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role as UserRole,
      organizationId: admin.organizationId,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updateTeamMemberRole(userId: string, newRole: "ADMIN" | "STAFF") {
  const admin = await requireAdmin();

  if (userId === admin.id && newRole !== "ADMIN") {
    throw new Error("You cannot downgrade your own admin role");
  }

  const target = await db.user.findFirst({
    where: { id: userId, organizationId: admin.organizationId },
  });

  if (!target) {
    throw new Error("User not found in your organization");
  }

  await db.user.update({
    where: { id: userId },
    data: { role: newRole as UserRole },
  });

  revalidatePath("/settings");
}

export async function deleteTeamMember(userId: string) {
  const admin = await requireAdmin();

  if (userId === admin.id) {
    throw new Error("You cannot delete your own account");
  }

  const target = await db.user.findFirst({
    where: { id: userId, organizationId: admin.organizationId },
  });

  if (!target) {
    throw new Error("User not found in your organization");
  }

  await db.user.delete({
    where: { id: userId },
  });

  revalidatePath("/settings");
}
