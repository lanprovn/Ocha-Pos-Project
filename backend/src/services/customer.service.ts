import prisma from '../config/database';
import { MembershipLevel, LoyaltyTransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { MEMBERSHIP_THRESHOLDS } from '../constants/membership.constants';

export interface CreateCustomerInput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: string;
  avatar?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: string;
  avatar?: string;
  notes?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface CustomerFilters {
  search?: string;
  membershipLevel?: MembershipLevel;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UpdateLoyaltyPointsInput {
  points: number;
  type: LoyaltyTransactionType;
  reason?: string;
  orderId?: string;
}

export class CustomerService {
  /**
   * Calculate membership level based on total spent
   */
  private calculateMembershipLevel(totalSpent: number): MembershipLevel {
    if (totalSpent >= MEMBERSHIP_THRESHOLDS.PLATINUM) return 'PLATINUM';
    if (totalSpent >= MEMBERSHIP_THRESHOLDS.GOLD) return 'GOLD';
    if (totalSpent >= MEMBERSHIP_THRESHOLDS.SILVER) return 'SILVER';
    return 'BRONZE';
  }

  /**
   * Get all customers with filters and pagination
   */
  async getAll(filters: CustomerFilters = {}) {
    const {
      search,
      membershipLevel,
      isActive,
      page = 1,
      limit = 50,
    } = filters;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Membership level filter
    if (membershipLevel) {
      where.membershipLevel = membershipLevel;
    }

    // Active status filter
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prisma.customers.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              orders: true,
              loyalty_transactions: true,
            },
          },
        },
      }),
      prisma.customers.count({ where }),
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get customer by ID
   */
  async getById(id: string) {
    const customer = await prisma.customers.findUnique({
      where: { id },
      include: {
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            paymentStatus: true,
          },
        },
        loyalty_transactions: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            orders: true,
            loyalty_transactions: true,
          },
        },
      },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  /**
   * Normalize phone number (remove spaces, dashes, etc.)
   */
  private normalizePhone(phone: string | null): string | null {
    if (!phone) return null;
    // Remove all non-digit characters
    const normalized = phone.replace(/\D/g, '');
    return normalized.length >= 10 ? normalized : null;
  }

  /**
   * Get customer by phone (normalized)
   */
  async getByPhone(phone: string) {
    const normalizedPhone = this.normalizePhone(phone);
    if (!normalizedPhone) return null;

    const customer = await prisma.customers.findFirst({
      where: { 
        phone: normalizedPhone,
        isActive: true 
      },
    });

    return customer;
  }

  /**
   * Create new customer
   */
  async create(data: CreateCustomerInput) {
    // Check if phone already exists
    const existingCustomer = await this.getByPhone(data.phone);
    if (existingCustomer) {
      throw new Error('Phone number already exists');
    }

    // Check if email already exists (if provided)
    if (data.email) {
      const existingEmail = await prisma.customers.findUnique({
        where: { email: data.email },
      });
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }

    // Generate unique ID (using phone as base)
    const id = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const customer = await prisma.customers.create({
      data: {
        id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        avatar: data.avatar,
        notes: data.notes,
        tags: data.tags || [],
        loyaltyPoints: 0,
        membershipLevel: 'BRONZE',
        totalSpent: 0,
        isActive: true,
        updatedAt: new Date(),
      },
    });

    return customer;
  }

  /**
   * Update customer
   */
  async update(id: string, data: UpdateCustomerInput) {
    // Check if customer exists
    const existingCustomer = await this.getById(id);

    // Check if phone is being changed and already exists
    if (data.phone && data.phone !== existingCustomer.phone) {
      const phoneExists = await this.getByPhone(data.phone);
      if (phoneExists) {
        throw new Error('Phone number already exists');
      }
    }

    // Check if email is being changed and already exists
    if (data.email && data.email !== existingCustomer.email) {
      const emailExists = await prisma.customers.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    const customer = await prisma.customers.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return customer;
  }

  /**
   * Delete customer (soft delete by setting isActive to false)
   */
  async delete(id: string) {
    await this.getById(id); // Check if customer exists

    await prisma.customers.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return { message: 'Customer deactivated successfully' };
  }

  /**
   * Update customer loyalty points
   */
  async updateLoyaltyPoints(
    customerId: string,
    data: UpdateLoyaltyPointsInput
  ) {
    const customer = await this.getById(customerId);

    const newPoints =
      data.type === 'EARN' || data.type === 'ADJUSTMENT'
        ? customer.loyaltyPoints + data.points
        : customer.loyaltyPoints - data.points;

    if (newPoints < 0) {
      throw new Error('Insufficient loyalty points');
    }

    // Create loyalty transaction
    const transactionId = `LT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await prisma.loyalty_transactions.create({
      data: {
        id: transactionId,
        customerId,
        orderId: data.orderId,
        type: data.type,
        points: data.points,
        reason: data.reason,
      },
    });

    // Update customer points
    const updatedCustomer = await prisma.customers.update({
      where: { id: customerId },
      data: {
        loyaltyPoints: newPoints,
        updatedAt: new Date(),
      },
    });

    return updatedCustomer;
  }

  /**
   * Update customer total spent and membership level
   */
  async updateTotalSpent(customerId: string, amount: number) {
    const customer = await this.getById(customerId);

    const newTotalSpent = Number(customer.totalSpent) + amount;
    const newMembershipLevel = this.calculateMembershipLevel(newTotalSpent);

    const updatedCustomer = await prisma.customers.update({
      where: { id: customerId },
      data: {
        totalSpent: new Decimal(newTotalSpent),
        membershipLevel: newMembershipLevel,
        lastVisitAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return updatedCustomer;
  }

  /**
   * Get customer statistics
   */
  async getStatistics() {
    const [
      total,
      bronze,
      silver,
      gold,
      platinum,
      active,
      inactive,
      totalPoints,
    ] = await Promise.all([
      prisma.customers.count(),
      prisma.customers.count({ where: { membershipLevel: 'BRONZE' } }),
      prisma.customers.count({ where: { membershipLevel: 'SILVER' } }),
      prisma.customers.count({ where: { membershipLevel: 'GOLD' } }),
      prisma.customers.count({ where: { membershipLevel: 'PLATINUM' } }),
      prisma.customers.count({ where: { isActive: true } }),
      prisma.customers.count({ where: { isActive: false } }),
      prisma.customers.aggregate({
        _sum: {
          loyaltyPoints: true,
        },
      }),
    ]);

    return {
      total,
      byMembership: {
        bronze,
        silver,
        gold,
        platinum,
      },
      byStatus: {
        active,
        inactive,
      },
      totalPoints: totalPoints._sum.loyaltyPoints || 0,
    };
  }
}

export default new CustomerService();

