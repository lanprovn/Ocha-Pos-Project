import prisma from '@config/database';
import { ValidationError } from '@core/errors';
import { Decimal } from '@prisma/client/runtime/library';
import { calculateMembershipLevel, type MembershipLevel } from '@config/membership.config';

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  membershipLevel?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  tags?: string[];
  isActive?: boolean;
}

export interface CustomerListItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  loyaltyPoints: number;
  membershipLevel: string;
  totalSpent: number;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastVisitAt: Date | null;
}

export interface CustomerDetail extends CustomerListItem {
  dateOfBirth: Date | null;
  gender: string | null;
  avatar: string | null;
  notes: string | null;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: Date;
  }>;
  loyaltyTransactions: Array<{
    id: string;
    type: string;
    points: number;
    reason: string | null;
    createdAt: Date;
    orderId: string | null;
  }>;
}

export class CustomerService {
  /**
   * Get all customers with pagination and filters
   */
  async getAll(filters: CustomerFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search filter
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Membership level filter
    if (filters.membershipLevel) {
      where.membershipLevel = filters.membershipLevel;
    }

    // Tags filter - customer must have at least one of the specified tags
    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    // Active status filter
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [customersRaw, total] = await Promise.all([
      prisma.customers.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
          loyaltyPoints: true,
          membershipLevel: true,
          totalSpent: true,
          tags: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastVisitAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.customers.count({ where }),
    ]);

    // Convert Decimal to number
    const customers = customersRaw.map((customer) => ({
      ...customer,
      totalSpent: parseFloat(customer.totalSpent.toString()),
    }));

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
   * Get customer by ID with full details including orders and loyalty transactions
   */
  async getById(id: string): Promise<CustomerDetail> {
    const customer = await prisma.customers.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 50, // Limit to last 50 orders
        },
        loyalty_transactions: {
          select: {
            id: true,
            type: true,
            points: true,
            reason: true,
            createdAt: true,
            orderId: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 100, // Limit to last 100 transactions
        },
      },
    });

    if (!customer) {
      throw new ValidationError('Khách hàng không tồn tại', { id });
    }

    // Convert Decimal to number and map snake_case to camelCase
    const customerDetail: CustomerDetail = {
      ...customer,
      totalSpent: parseFloat(customer.totalSpent.toString()),
      orders: customer.orders.map((order) => ({
        ...order,
        totalAmount: parseFloat(order.totalAmount.toString()),
      })),
      loyaltyTransactions: customer.loyalty_transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        points: transaction.points,
        reason: transaction.reason,
        createdAt: transaction.createdAt,
        orderId: transaction.orderId,
      })),
    };

    // Remove the snake_case property
    delete (customerDetail as any).loyalty_transactions;

    return customerDetail;
  }

  /**
   * Get available tags from all customers
   */
  async getAvailableTags(): Promise<string[]> {
    const customers = await prisma.customers.findMany({
      select: {
        tags: true,
      },
    });

    // Extract all unique tags
    const allTags = new Set<string>();
    customers.forEach((customer) => {
      customer.tags.forEach((tag) => allTags.add(tag));
    });

    return Array.from(allTags).sort();
  }

  /**
   * Update customer information
   */
  async update(id: string, data: {
    name?: string;
    phone?: string;
    email?: string | null;
    address?: string | null;
    dateOfBirth?: Date | null;
    gender?: string | null;
    notes?: string | null;
    tags?: string[];
    membershipLevel?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    isActive?: boolean;
  }): Promise<CustomerDetail> {
    // Check if customer exists
    const existingCustomer = await prisma.customers.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new ValidationError('Khách hàng không tồn tại', { id });
    }

    // Check if phone is being changed and if it's already taken
    if (data.phone && data.phone !== existingCustomer.phone) {
      const phoneExists = await prisma.customers.findUnique({
        where: { phone: data.phone },
      });
      if (phoneExists) {
        throw new ValidationError('Số điện thoại đã được sử dụng', { phone: data.phone });
      }
    }

    // Check if email is being changed and if it's already taken
    if (data.email !== undefined && data.email !== existingCustomer.email) {
      if (data.email) {
        const emailExists = await prisma.customers.findUnique({
          where: { email: data.email },
        });
        if (emailExists) {
          throw new ValidationError('Email đã được sử dụng', { email: data.email });
        }
      }
    }

    // Update customer
    const updatedCustomer = await prisma.customers.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 50,
        },
        loyalty_transactions: {
          select: {
            id: true,
            type: true,
            points: true,
            reason: true,
            createdAt: true,
            orderId: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 100,
        },
      },
    });

    // Convert Decimal to number and map snake_case to camelCase
    const customerDetail: CustomerDetail = {
      ...updatedCustomer,
      totalSpent: parseFloat(updatedCustomer.totalSpent.toString()),
      orders: updatedCustomer.orders.map((order) => ({
        ...order,
        totalAmount: parseFloat(order.totalAmount.toString()),
      })),
      loyaltyTransactions: updatedCustomer.loyalty_transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        points: transaction.points,
        reason: transaction.reason,
        createdAt: transaction.createdAt,
        orderId: transaction.orderId,
      })),
    };

    // Remove the snake_case property
    delete (customerDetail as any).loyalty_transactions;

    return customerDetail;
  }

  /**
   * Adjust loyalty points manually (add or subtract)
   */
  async adjustLoyaltyPoints(
    id: string,
    points: number,
    reason: string,
    userId?: string
  ): Promise<CustomerDetail> {
    // Check if customer exists
    const customer = await prisma.customers.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new ValidationError('Khách hàng không tồn tại', { id });
    }

    // Validate points
    if (points === 0) {
      throw new ValidationError('Số điểm phải khác 0', { points });
    }

    // Calculate new loyalty points
    const newLoyaltyPoints = customer.loyaltyPoints + points;

    // Ensure points don't go negative
    if (newLoyaltyPoints < 0) {
      throw new ValidationError('Số điểm không thể âm', { 
        currentPoints: customer.loyaltyPoints,
        adjustment: points,
      });
    }

    // Calculate new membership level based on points
    const newMembershipLevel = calculateMembershipLevel(newLoyaltyPoints);

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update customer loyalty points and membership level
      const updatedCustomer = await tx.customers.update({
        where: { id },
        data: {
          loyaltyPoints: newLoyaltyPoints,
          membershipLevel: newMembershipLevel,
          updatedAt: new Date(),
        },
      });

      // Create loyalty transaction record
      await tx.loyalty_transactions.create({
        data: {
          id: `lt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customerId: id,
          type: 'ADJUSTMENT',
          points: points,
          reason: reason || `Điều chỉnh thủ công: ${points > 0 ? '+' : ''}${points} điểm`,
        },
      });

      // Fetch updated customer with relations
      return await tx.customers.findUnique({
        where: { id },
        include: {
          orders: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 50,
          },
          loyalty_transactions: {
            select: {
              id: true,
              type: true,
              points: true,
              reason: true,
              createdAt: true,
              orderId: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 100,
          },
        },
      });
    });

    if (!result) {
      throw new ValidationError('Không thể cập nhật điểm tích lũy', { id });
    }

    // Convert Decimal to number and map snake_case to camelCase
    const customerDetail: CustomerDetail = {
      ...result,
      totalSpent: parseFloat(result.totalSpent.toString()),
      orders: result.orders.map((order) => ({
        ...order,
        totalAmount: parseFloat(order.totalAmount.toString()),
      })),
      loyaltyTransactions: result.loyalty_transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        points: transaction.points,
        reason: transaction.reason,
        createdAt: transaction.createdAt,
        orderId: transaction.orderId,
      })),
    };

    // Remove the snake_case property
    delete (customerDetail as any).loyalty_transactions;

    return customerDetail;
  }

  /**
   * Find customer by phone number or create new one
   * Used when creating orders to automatically link customer
   * @param phone - Phone number
   * @param name - Customer name (optional)
   * @param tx - Optional transaction client (if called within a transaction)
   */
  async findOrCreateByPhone(
    phone: string,
    name?: string,
    tx?: any
  ): Promise<string | null> {
    if (!phone || phone.trim() === '') {
      return null;
    }

    // Use transaction client if provided, otherwise use prisma
    // In transaction context, we MUST use tx to maintain transaction isolation
    let db: any;
    
    if (tx) {
      // If tx is provided, use it (should be Prisma transaction client)
      db = tx;
    } else {
      // Fallback to prisma if tx is not provided
      db = prisma;
    }
    
    // Safety check: ensure db exists
    if (!db) {
      throw new Error('Database client is not available. Both tx and prisma are undefined.');
    }
    
    // Safety check: ensure db has customers property
    // This should always be true for valid Prisma clients, but we check to provide better error messages
    if (!db.customers) {
      throw new Error(`Database client does not have 'customers' property. This may indicate a Prisma client initialization issue.`);
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.trim().replace(/[\s\-\(\)]/g, '');

    // Try to find existing customer
    let customer = await db.customers.findUnique({
      where: { phone: normalizedPhone },
    });

    if (customer) {
      // Update last visit time
      await db.customers.update({
        where: { id: customer.id },
        data: {
          lastVisitAt: new Date(),
          updatedAt: new Date(),
          // Update name if provided and different
          ...(name && name.trim() !== '' && name !== customer.name ? { name: name.trim() } : {}),
        },
      });
      return customer.id;
    }

    // Create new customer if not found
    if (name && name.trim() !== '') {
      const now = new Date();
      const newCustomer = await db.customers.create({
        data: {
          id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: name.trim(),
          phone: normalizedPhone,
          membershipLevel: 'BRONZE',
          loyaltyPoints: 0,
          totalSpent: new Decimal(0),
          isActive: true,
          createdAt: now,
          updatedAt: now,
          lastVisitAt: now,
        },
      });
      return newCustomer.id;
    }

    // If no name provided, don't create customer
    return null;
  }

  /**
   * Get customer by phone number
   */
  async findByPhone(phone: string) {
    if (!phone || phone.trim() === '') {
      return null;
    }

    // Safety check: ensure prisma is available
    if (!prisma || !prisma.customers) {
      throw new Error('Prisma client is not available or does not have customers property.');
    }

    const normalizedPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
    const customer = await prisma.customers.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!customer) {
      return null;
    }

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      membershipLevel: customer.membershipLevel,
      loyaltyPoints: customer.loyaltyPoints,
      totalSpent: parseFloat(customer.totalSpent.toString()),
    };
  }

  /**
   * Get customer statistics (VIP customers, frequent customers, membership distribution)
   */
  async getStatistics() {
    // Get all customers with their order counts
    const customers = await prisma.customers.findMany({
      where: {
        isActive: true,
      },
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalCustomers = customers.length;
    
    // Membership level distribution
    const membershipDistribution = {
      BRONZE: 0,
      SILVER: 0,
      GOLD: 0,
      PLATINUM: 0,
    };

    // VIP customers (GOLD and PLATINUM)
    const vipCustomers = customers
      .filter((c) => c.membershipLevel === 'GOLD' || c.membershipLevel === 'PLATINUM')
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        membershipLevel: c.membershipLevel,
        loyaltyPoints: c.loyaltyPoints,
        totalSpent: parseFloat(c.totalSpent.toString()),
        orderCount: c.orders.length,
        lastVisitAt: c.lastVisitAt,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    // Frequent customers (customers with 3+ orders or visited in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const frequentCustomers = customers
      .filter((c) => {
        const hasManyOrders = c.orders.length >= 3;
        const recentVisit = c.lastVisitAt && new Date(c.lastVisitAt) >= thirtyDaysAgo;
        return hasManyOrders || recentVisit;
      })
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        membershipLevel: c.membershipLevel,
        loyaltyPoints: c.loyaltyPoints,
        totalSpent: parseFloat(c.totalSpent.toString()),
        orderCount: c.orders.length,
        lastVisitAt: c.lastVisitAt,
      }))
      .sort((a, b) => b.orderCount - a.orderCount);

    // Top customers by spending
    const topCustomersBySpending = customers
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        membershipLevel: c.membershipLevel,
        loyaltyPoints: c.loyaltyPoints,
        totalSpent: parseFloat(c.totalSpent.toString()),
        orderCount: c.orders.length,
        lastVisitAt: c.lastVisitAt,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Count membership levels
    customers.forEach((c) => {
      membershipDistribution[c.membershipLevel as keyof typeof membershipDistribution]++;
    });

    // Calculate average values
    const totalSpent = customers.reduce((sum, c) => sum + parseFloat(c.totalSpent.toString()), 0);
    const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
    const totalOrders = customers.reduce((sum, c) => sum + c.orders.length, 0);
    const averageSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;
    const averageLoyaltyPoints = totalCustomers > 0 ? totalLoyaltyPoints / totalCustomers : 0;
    const averageOrders = totalCustomers > 0 ? totalOrders / totalCustomers : 0;

    return {
      overview: {
        totalCustomers,
        vipCustomersCount: vipCustomers.length,
        frequentCustomersCount: frequentCustomers.length,
        totalSpent,
        totalLoyaltyPoints,
        averageSpent,
        averageLoyaltyPoints,
        averageOrders,
      },
      membershipDistribution,
      vipCustomers: vipCustomers.slice(0, 20), // Top 20 VIP customers
      frequentCustomers: frequentCustomers.slice(0, 20), // Top 20 frequent customers
      topCustomersBySpending,
    };
  }

  /**
   * Recalculate and update membership level for all customers based on their current loyalty points
   * This is useful for fixing existing data after implementing the membership system
   */
  async recalculateAllMembershipLevels(): Promise<{ updated: number; errors: number }> {
    let updated = 0;
    let errors = 0;

    try {
      // Get all customers
      const customers = await prisma.customers.findMany({
        select: {
          id: true,
          loyaltyPoints: true,
          membershipLevel: true,
        },
      });

      // Update each customer's membership level
      for (const customer of customers) {
        try {
          const correctLevel = calculateMembershipLevel(customer.loyaltyPoints);
          
          // Only update if level has changed
          if (customer.membershipLevel !== correctLevel) {
            await prisma.customers.update({
              where: { id: customer.id },
              data: {
                membershipLevel: correctLevel,
                updatedAt: new Date(),
              },
            });
            updated++;
          }
        } catch (error) {
          console.error(`Error updating customer ${customer.id}:`, error);
          errors++;
        }
      }

      return { updated, errors };
    } catch (error) {
      console.error('Error recalculating membership levels:', error);
      throw error;
    }
  }
}

export default new CustomerService();

