import prisma from '../config/database';
import { comparePassword, hashPassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';
import { UnauthorizedError } from '../errors';
import { UserRole } from '@prisma/client';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export class UserService {
  /**
   * Login user
   */
  async login(data: LoginInput): Promise<LoginResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

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
   * Get all users (staff) with filters and pagination
   */
  async getAll(filters: UserFilters = {}) {
    const {
      search,
      role,
      isActive,
      page = 1,
      limit = 50,
    } = filters;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (role) {
      where.role = role;
    }

    // Active status filter
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
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
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create new user (staff/admin)
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

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        isActive: true,
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

    return user;
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserInput) {
    // Check if user exists
    const existingUser = await this.findById(id);

    // Check if email is being changed and already exists
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    // Hash password if being updated
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return user;
  }

  /**
   * Delete user (soft delete by setting isActive to false)
   */
  async delete(id: string) {
    await this.findById(id); // Check if user exists

    // Prevent deleting yourself
    // Note: This check should be done in controller with req.user

    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return { message: 'User deactivated successfully' };
  }

  /**
   * Get user statistics
   */
  async getStatistics() {
    const [
      total,
      admin,
      staff,
      active,
      inactive,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'STAFF' } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
    ]);

    return {
      total,
      byRole: {
        admin,
        staff,
      },
      byStatus: {
        active,
        inactive,
      },
    };
  }
}

export default new UserService();

