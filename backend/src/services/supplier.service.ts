import prisma from '../config/database';
import { CreateSupplierInput, UpdateSupplierInput } from '../types/supplier.types';
import { SupplierNotFoundError } from '../errors/BusinessErrors';

export class SupplierService {
  /**
   * Get all suppliers with optional filters
   */
  async getAll(isActive?: boolean) {
    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return suppliers;
  }

  /**
   * Get supplier by ID
   */
  async getById(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!supplier) {
      throw new SupplierNotFoundError(id);
    }

    return supplier;
  }

  /**
   * Create a new supplier
   */
  async create(data: CreateSupplierInput) {
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        contactName: data.contactName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        taxCode: data.taxCode,
        notes: data.notes,
        isActive: data.isActive ?? true,
      },
    });

    return supplier;
  }

  /**
   * Update supplier
   */
  async update(id: string, data: UpdateSupplierInput) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new SupplierNotFoundError(id);
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        contactName: data.contactName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        taxCode: data.taxCode,
        notes: data.notes,
        isActive: data.isActive,
      },
    });

    return updated;
  }

  /**
   * Delete supplier (soft delete by setting isActive to false)
   */
  async delete(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new SupplierNotFoundError(id);
    }

    // Soft delete by setting isActive to false
    await prisma.supplier.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return { message: 'Supplier deleted successfully' };
  }
}

export default new SupplierService();



