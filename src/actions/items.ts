import { prisma } from '../lib/prisma';
import type { Item } from '@prisma/client';

export async function listItems(): Promise<Item[]> {
  return prisma.item.findMany({ orderBy: { name: 'asc' } });
}

export async function getItem(id: string) {
  return prisma.item.findUnique({ where: { id } });
}

export async function createItem(data: Partial<Item>) {
  return prisma.item.create({ data: data as any });
}

export async function updateItem(id: string, data: Partial<Item>) {
  return prisma.item.update({ where: { id }, data: data as any });
}

export async function deleteItem(id: string) {
  return prisma.item.delete({ where: { id } });
}
