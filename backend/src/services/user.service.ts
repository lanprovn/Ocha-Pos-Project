import prisma from '../config/database';
import { comparePassword, hashPassword } from '../utils/bcrypt';
import logger from '../utils/logger';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'STAFF';
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: 'ADMIN' | 'STAFF';
  isActive?: boolean;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordInput {
  email: string;
  newPassword: string;
}

export class UserService {
  /**
   * Get user by ID
   */
  async findById(id: string) {
    const user = await prisma.user.findUnique({
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

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Get all users
   */
  async getAll() {
    const users = await prisma.user.findMany({
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

    return users;
  }

  /**
   * Create new user
   */
  async create(data: CreateUserInput) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
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

    logger.info('User created', { userId: user.id, email: user.email, role: user.role });
    return user;
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserInput) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Check if email already exists (if updating email)
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    // Update user
    const user = await prisma.user.update({
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

    logger.info('User updated', { userId: user.id, email: user.email });
    return user;
  }

  /**
   * Delete user
   */
  async delete(id: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Prevent deleting yourself
    // This check will be done in controller using req.user

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    logger.info('User deleted', { userId: id, email: existingUser.email });
    return { message: 'User deleted successfully' };
  }

  /**
   * Change password
   */
  async changePassword(id: string, data: ChangePasswordInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(data.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword);

    // Update password
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    logger.info('Password changed', { userId: id, email: user.email });
    return { message: 'Password changed successfully' };
  }

  /**
   * Reset password (Admin only)
   */
  async resetPassword(data: ResetPasswordInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    logger.info('Password reset', { userId: user.id, email: user.email });
    return { message: 'Password reset successfully' };
  }
}

export default new UserService();

