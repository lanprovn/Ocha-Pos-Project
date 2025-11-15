/**
 * Base Repository Class
 * Provides common database operations
 */
import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export abstract class BaseRepository<T> {
  protected abstract model: any;

  /**
   * Find unique record by ID
   */
  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  /**
   * Find many records with optional filters
   */
  async findMany(args?: Prisma.Args<T, 'findMany'>): Promise<T[]> {
    return this.model.findMany(args);
  }

  /**
   * Count records
   */
  async count(args?: Prisma.Args<T, 'count'>): Promise<number> {
    return this.model.count(args);
  }

  /**
   * Create new record
   */
  async create(data: any): Promise<T> {
    return this.model.create({ data });
  }

  /**
   * Update record by ID
   */
  async update(id: string, data: any): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  /**
   * Delete record by ID
   */
  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }

  /**
   * Get Prisma client for complex queries
   */
  protected get prisma() {
    return prisma;
  }
}

