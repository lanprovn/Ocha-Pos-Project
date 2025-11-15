import prisma from '../config/database';
import { BaseRepository } from './base.repository';
import { CreateUserInput, UpdateUserInput } from '../services/user.service';

export class UserRepository extends BaseRepository<any> {
  protected model = prisma.user;

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID with selected fields (exclude password)
   */
  async findByIdSafe(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get all users (exclude password)
   */
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Create user
   */
  async create(data: CreateUserInput & { password: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role || 'STAFF',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.name && { name: data.name }),
        ...(data.role && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update password
   */
  async updatePassword(id: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}

export default new UserRepository();

