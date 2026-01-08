import prisma from '@config/database';
import { NotFoundError, ValidationError } from '@core/errors';
import logger from '@utils/logger';
import { Decimal } from '@prisma/client/runtime/library';
import { emitPromotionCreated, emitPromotionUpdated, emitPromotionDeleted } from '@core/socket/socket.io';
import orderService from './order.service';

export interface PromotionFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  type?: 'PRODUCT' | 'CATEGORY' | 'ORDER' | 'CUSTOMER' | 'TIME_BASED' | 'UNIVERSAL';
  search?: string;
}

export interface CreatePromotionInput {
  code: string;
  name: string;
  description?: string;
  type: 'PRODUCT' | 'CATEGORY' | 'ORDER' | 'CUSTOMER' | 'TIME_BASED' | 'UNIVERSAL';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  productIds?: string[];
  categoryIds?: string[];
  membershipLevels?: ('BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM')[];
  startDate: Date;
  endDate: Date;
  startTime?: string; // "14:00"
  endTime?: string; // "16:00"
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
}

export interface UpdatePromotionInput {
  code?: string;
  name?: string;
  description?: string;
  type?: 'PRODUCT' | 'CATEGORY' | 'ORDER' | 'CUSTOMER' | 'TIME_BASED' | 'UNIVERSAL';
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  productIds?: string[];
  categoryIds?: string[];
  membershipLevels?: ('BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM')[];
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
}

export interface ValidatePromotionInput {
  code: string;
  orderAmount?: number;
  productIds?: string[];
  categoryIds?: string[];
  customerMembershipLevel?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  customerId?: string;
}

export interface ApplyPromotionResult {
  isValid: boolean;
  discountAmount: number;
  finalAmount: number;
  promotion?: any;
  error?: string;
}

export class PromotionService {
  /**
   * Get all promotions with pagination and filters
   */
  async getAll(filters: PromotionFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.promotion.count({ where }),
    ]);

    return {
      promotions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get promotion by ID
   */
  async getById(id: string) {
    const promotion = await prisma.promotion.findUnique({
      where: { id },
      include: {
        usages: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    return promotion;
  }

  /**
   * Get promotion by code
   */
  async getByCode(code: string) {
    const promotion = await prisma.promotion.findUnique({
      where: { code: code.toUpperCase() },
    });

    return promotion;
  }

  /**
   * Create new promotion
   */
  async create(data: CreatePromotionInput) {
    // Check if code already exists
    const existing = await prisma.promotion.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      throw new ValidationError('Promotion code already exists');
    }

    // Validate dates
    if (data.endDate < data.startDate) {
      throw new ValidationError('End date must be after start date');
    }

    // Validate time format if provided
    if (data.startTime || data.endTime) {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (data.startTime && !timeRegex.test(data.startTime)) {
        throw new ValidationError('Invalid startTime format. Use HH:mm format (e.g., 14:00)');
      }
      if (data.endTime && !timeRegex.test(data.endTime)) {
        throw new ValidationError('Invalid endTime format. Use HH:mm format (e.g., 16:00)');
      }
    }

    // Validate discount value
    if (data.discountType === 'PERCENTAGE' && (data.discountValue < 0 || data.discountValue > 100)) {
      throw new ValidationError('Percentage discount must be between 0 and 100');
    }

    if (data.discountType === 'FIXED_AMOUNT' && data.discountValue < 0) {
      throw new ValidationError('Fixed amount discount must be positive');
    }

    const promotion = await prisma.promotion.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        type: data.type,
        discountType: data.discountType,
        discountValue: new Decimal(data.discountValue),
        minOrderAmount: data.minOrderAmount ? new Decimal(data.minOrderAmount) : null,
        maxDiscountAmount: data.maxDiscountAmount ? new Decimal(data.maxDiscountAmount) : null,
        productIds: data.productIds || [],
        categoryIds: data.categoryIds || [],
        membershipLevels: data.membershipLevels || [],
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        usageLimit: data.usageLimit || null,
        perUserLimit: data.perUserLimit || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    emitPromotionCreated(promotion);
    logger.info('Promotion created', { promotionId: promotion.id, code: promotion.code });

    return promotion;
  }

  /**
   * Update promotion
   */
  async update(id: string, data: UpdatePromotionInput) {
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!existingPromotion) {
      throw new NotFoundError('Promotion not found');
    }

    // Check if code already exists (if changing code)
    if (data.code && data.code.toUpperCase() !== existingPromotion.code) {
      const existing = await prisma.promotion.findUnique({
        where: { code: data.code.toUpperCase() },
      });

      if (existing) {
        throw new ValidationError('Promotion code already exists');
      }
    }

    // Validate dates if provided
    const startDate = data.startDate || existingPromotion.startDate;
    const endDate = data.endDate || existingPromotion.endDate;

    if (endDate < startDate) {
      throw new ValidationError('End date must be after start date');
    }

    // Validate time format if provided
    if (data.startTime || data.endTime) {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (data.startTime && !timeRegex.test(data.startTime)) {
        throw new ValidationError('Invalid startTime format. Use HH:mm format (e.g., 14:00)');
      }
      if (data.endTime && !timeRegex.test(data.endTime)) {
        throw new ValidationError('Invalid endTime format. Use HH:mm format (e.g., 16:00)');
      }
    }

    // Validate discount value if provided
    if (data.discountValue !== undefined) {
      const discountType = data.discountType || existingPromotion.discountType;
      if (discountType === 'PERCENTAGE' && (data.discountValue < 0 || data.discountValue > 100)) {
        throw new ValidationError('Percentage discount must be between 0 and 100');
      }
      if (discountType === 'FIXED_AMOUNT' && data.discountValue < 0) {
        throw new ValidationError('Fixed amount discount must be positive');
      }
    }

    const updateData: any = {};

    if (data.code !== undefined) updateData.code = data.code.toUpperCase();
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = new Decimal(data.discountValue);
    if (data.minOrderAmount !== undefined) updateData.minOrderAmount = data.minOrderAmount ? new Decimal(data.minOrderAmount) : null;
    if (data.maxDiscountAmount !== undefined) updateData.maxDiscountAmount = data.maxDiscountAmount ? new Decimal(data.maxDiscountAmount) : null;
    if (data.productIds !== undefined) updateData.productIds = data.productIds;
    if (data.categoryIds !== undefined) updateData.categoryIds = data.categoryIds;
    if (data.membershipLevels !== undefined) updateData.membershipLevels = data.membershipLevels;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.startTime !== undefined) updateData.startTime = data.startTime || null;
    if (data.endTime !== undefined) updateData.endTime = data.endTime || null;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit || null;
    if (data.perUserLimit !== undefined) updateData.perUserLimit = data.perUserLimit || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const promotion = await prisma.promotion.update({
      where: { id },
      data: updateData,
    });

    emitPromotionUpdated(promotion);
    logger.info('Promotion updated', { promotionId: promotion.id, code: promotion.code });

    // Recalculate affected orders in background (don't wait for it)
    orderService.recalculateOrdersByPromotion(id).catch((error) => {
      logger.error('Error recalculating orders after promotion update', {
        promotionId: id,
        error: error instanceof Error ? error.message : String(error),
      });
    });

    return promotion;
  }

  /**
   * Delete promotion
   */
  async delete(id: string) {
    const promotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    await prisma.promotion.delete({
      where: { id },
    });

    emitPromotionDeleted(id);
    logger.info('Promotion deleted', { promotionId: id });

    // Recalculate affected orders in background (don't wait for it)
    orderService.recalculateOrdersByPromotion(id).catch((error) => {
      logger.error('Error recalculating orders after promotion delete', {
        promotionId: id,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }

  /**
   * Validate and apply promotion
   */
  async validateAndApply(input: ValidatePromotionInput, orderAmount: number): Promise<ApplyPromotionResult> {
    const promotion = await this.getByCode(input.code);

    if (!promotion) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: orderAmount,
        error: 'Promotion code not found',
      };
    }

    // Check if promotion is active
    if (!promotion.isActive) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: orderAmount,
        error: 'Promotion is not active',
      };
    }

    // Check date range
    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: orderAmount,
        error: 'Promotion is not valid for current date',
      };
    }

    // Check time range if applicable
    if (promotion.startTime && promotion.endTime) {
      const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"
      if (currentTime < promotion.startTime || currentTime > promotion.endTime) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: orderAmount,
          error: 'Promotion is not valid for current time',
        };
      }
    }

    // Check minimum order amount
    if (promotion.minOrderAmount && orderAmount < parseFloat(promotion.minOrderAmount.toString())) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: orderAmount,
        error: `Minimum order amount is ${promotion.minOrderAmount}`,
      };
    }

    // Check usage limit
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: orderAmount,
        error: 'Promotion usage limit reached',
      };
    }

    // Check per user limit
    if (input.customerId && promotion.perUserLimit) {
      const userUsageCount = await prisma.promotionUsage.count({
        where: {
          promotionId: promotion.id,
          customerId: input.customerId,
        },
      });

      if (userUsageCount >= promotion.perUserLimit) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: orderAmount,
          error: 'You have reached the usage limit for this promotion',
        };
      }
    }

    // Check type-specific validations
    if (promotion.type === 'PRODUCT' && input.productIds) {
      const hasMatchingProduct = input.productIds.some((productId) => promotion.productIds.includes(productId));
      if (!hasMatchingProduct) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: orderAmount,
          error: 'Promotion is not valid for selected products',
        };
      }
    }

    if (promotion.type === 'CATEGORY' && input.categoryIds) {
      const hasMatchingCategory = input.categoryIds.some((categoryId) => promotion.categoryIds.includes(categoryId));
      if (!hasMatchingCategory) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: orderAmount,
          error: 'Promotion is not valid for selected categories',
        };
      }
    }

    if (promotion.type === 'CUSTOMER' && input.customerMembershipLevel) {
      if (!promotion.membershipLevels.includes(input.customerMembershipLevel)) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: orderAmount,
          error: 'Promotion is not valid for your membership level',
        };
      }
    }

    // Calculate discount
    let discountAmount = 0;

    if (promotion.discountType === 'PERCENTAGE') {
      discountAmount = (orderAmount * parseFloat(promotion.discountValue.toString())) / 100;
    } else {
      discountAmount = parseFloat(promotion.discountValue.toString());
    }

    // Apply max discount limit
    if (promotion.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, parseFloat(promotion.maxDiscountAmount.toString()));
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmount);

    const finalAmount = orderAmount - discountAmount;

    return {
      isValid: true,
      discountAmount,
      finalAmount,
      promotion,
    };
  }

  /**
   * Record promotion usage
   */
  async recordUsage(promotionId: string, orderId: string, customerId: string | null, discountAmount: number) {
    // Update usage count
    await prisma.promotion.update({
      where: { id: promotionId },
      data: {
        usageCount: { increment: 1 },
      },
    });

    // Record usage
    const usage = await prisma.promotionUsage.create({
      data: {
        promotionId,
        orderId,
        customerId: customerId || null,
        discountAmount: new Decimal(discountAmount),
      },
    });

    return usage;
  }

  /**
   * Get promotion statistics
   */
  async getStatistics(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalPromotions, activePromotions, totalUsage, totalDiscount] = await Promise.all([
      prisma.promotion.count({ where }),
      prisma.promotion.count({
        where: {
          ...where,
          isActive: true,
        },
      }),
      prisma.promotionUsage.count({
        where: {
          createdAt: startDate || endDate
            ? {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              }
            : undefined,
        },
      }),
      prisma.promotionUsage.aggregate({
        where: {
          createdAt: startDate || endDate
            ? {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              }
            : undefined,
        },
        _sum: {
          discountAmount: true,
        },
      }),
    ]);

    return {
      totalPromotions,
      activePromotions,
      totalUsage,
      totalDiscount: totalDiscount._sum.discountAmount || 0,
    };
  }
}

export default new PromotionService();

