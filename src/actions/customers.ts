import { prisma } from './prisma';
import type { Customer } from '@prisma/client';

export async function listCustomers(): Promise<Customer[]> {
  return prisma.customer.findMany({ orderBy: { name: 'asc' } });
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({ where: { id } });
}

export async function createCustomer(data: Partial<Customer>) {
  return prisma.customer.create({ data: data as any });
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  return prisma.customer.update({ where: { id }, data: data as any });
}

export async function deleteCustomer(id: string) {
  return prisma.customer.delete({ where: { id } });
}
