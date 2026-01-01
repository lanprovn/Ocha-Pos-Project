import prisma from '../config/database';
import {
  CreatePromotionCodeInput,
  UpdatePromotionCodeInput,
  PromotionCodeFilters,
  ValidatePromotionCodeInput,
  PromotionCodeValidationResult,
  PromotionCode,
} from '../types/promotion.types';
import { Decimal } from '@prisma/client/runtime/library';
import { PromotionCodeNotFoundError, InvalidPromotionCodeError } from '../errors';
import logger from '../utils/logger';

export class PromotionService {
  /**
   * Transform promotion code to API format
   */
  private transformPromotionCode(promo: any): PromotionCode {
    return {
      id: promo.id,
      code: promo.code,
      name: promo.name,
      description: promo.description,
      type: promo.type,
      value: promo.value.toString(),
      minOrderAmount: promo.minOrderAmount ? promo.minOrderAmount.toString() : null,
      maxDiscountAmount: promo.maxDiscountAmount ? promo.maxDiscountAmount.toString() : null,
      startDate: promo.startDate.toISOString(),
      endDate: promo.endDate.toISOString(),
      maxUses: promo.maxUses,
      usedCount: promo.usedCount,
      maxUsesPerCustomer: promo.maxUsesPerCustomer,
      isActive: promo.isActive,
      createdAt: promo.createdAt.toISOString(),
      updatedAt: promo.updatedAt.toISOString(),
    };
  }

  /**
   * Get all promotion codes with filters and pagination
   */
  async getAll(filters: PromotionCodeFilters = {}) {
    const {
      isActive,
      startDate,
      endDate,
      code,
      page = 1,
      limit = 50,
    } = filters;

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (code) {
      where.code = { contains: code, mode: 'insensitive' };
    }

    if (startDate || endDate) {
      where.OR = [];
      if (startDate) {
        where.OR.push({
          startDate: { lte: new Date(startDate) },
          endDate: { gte: new Date(startDate) },
        });
      }
      if (endDate) {
        where.OR.push({
          startDate: { lte: new Date(endDate) },
          endDate: { gte: new Date(endDate) },
        });
      }
    }

    const skip = (page - 1) * limit;

    const [promotionCodes, total] = await Promise.all([
      prisma.promotionCode.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.promotionCode.count({ where }),
    ]);

    return {
      data: promotionCodes.map((promo) => this.transformPromotionCode(promo)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get promotion code by ID
   */
  async getById(id: string) {
    const promo = await prisma.promotionCode.findUnique({
      where: { id },
      include: {
        usages: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            orders: true,
            usages: true,
          },
        },
      },
    });

    if (!promo) {
      throw new PromotionCodeNotFoundError(id);
    }

    return this.transformPromotionCode(promo);
  }

  /**
   * Get promotion code by code string
   */
  async getByCode(code: string) {
    const promo = await prisma.promotionCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      throw new PromotionCodeNotFoundError(code);
    }

    return this.transformPromotionCode(promo);
  }

  /**
   * Create new promotion code
   */
  async create(data: CreatePromotionCodeInput) {
    // Check if code already exists
    const existing = await prisma.promotionCode.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      throw new InvalidPromotionCodeError(`Mã giảm giá "${data.code}" đã tồn tại`);
    }

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      throw new InvalidPromotionCodeError('Ngày kết thúc phải sau ngày bắt đầu');
    }

    // Validate value
    if (data.value <= 0) {
      throw new InvalidPromotionCodeError('Giá trị giảm giá phải lớn hơn 0');
    }

    if (data.type === 'PERCENTAGE' && data.value > 100) {
      throw new InvalidPromotionCodeError('Giảm giá theo phần trăm không được vượt quá 100%');
    }

    const promo = await prisma.promotionCode.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        type: data.type,
        value: new Decimal(data.value),
        minOrderAmount: data.minOrderAmount ? new Decimal(data.minOrderAmount) : null,
        maxDiscountAmount: data.maxDiscountAmount ? new Decimal(data.maxDiscountAmount) : null,
        startDate,
        endDate,
        maxUses: data.maxUses,
        maxUsesPerCustomer: data.maxUsesPerCustomer,
        isActive: data.isActive ?? true,
      },
    });

    logger.info('Promotion code created', { code: promo.code, id: promo.id });

    return this.transformPromotionCode(promo);
  }

  /**
   * Update promotion code
   */
  async update(id: string, data: UpdatePromotionCodeInput) {
    const promo = await prisma.promotionCode.findUnique({
      where: { id },
    });

    if (!promo) {
      throw new PromotionCodeNotFoundError(id);
    }

    // Validate dates if provided
    if (data.startDate || data.endDate) {
      const startDate = data.startDate ? new Date(data.startDate) : promo.startDate;
      const endDate = data.endDate ? new Date(data.endDate) : promo.endDate;

      if (endDate <= startDate) {
        throw new InvalidPromotionCodeError('Ngày kết thúc phải sau ngày bắt đầu');
      }
    }

    // Validate value if provided
    if (data.value !== undefined) {
      if (data.value <= 0) {
        throw new InvalidPromotionCodeError('Giá trị giảm giá phải lớn hơn 0');
      }

      const type = data.type || promo.type;
      if (type === 'PERCENTAGE' && data.value > 100) {
        throw new InvalidPromotionCodeError('Giảm giá theo phần trăm không được vượt quá 100%');
      }
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.value !== undefined) updateData.value = new Decimal(data.value);
    if (data.minOrderAmount !== undefined) {
      updateData.minOrderAmount = data.minOrderAmount ? new Decimal(data.minOrderAmount) : null;
    }
    if (data.maxDiscountAmount !== undefined) {
      updateData.maxDiscountAmount = data.maxDiscountAmount ? new Decimal(data.maxDiscountAmount) : null;
    }
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.maxUses !== undefined) updateData.maxUses = data.maxUses;
    if (data.maxUsesPerCustomer !== undefined) updateData.maxUsesPerCustomer = data.maxUsesPerCustomer;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await prisma.promotionCode.update({
      where: { id },
      data: updateData,
    });

    logger.info('Promotion code updated', { code: updated.code, id: updated.id });

    return this.transformPromotionCode(updated);
  }

  /**
   * Delete promotion code
   */
  async delete(id: string) {
    const promo = await prisma.promotionCode.findUnique({
      where: { id },
    });

    if (!promo) {
      throw new PromotionCodeNotFoundError(id);
    }

    await prisma.promotionCode.delete({
      where: { id },
    });

    logger.info('Promotion code deleted', { code: promo.code, id: promo.id });

    return { message: 'Promotion code deleted successfully' };
  }

  /**
   * Validate and calculate discount for promotion code
   */
  async validateCode(input: ValidatePromotionCodeInput): Promise<PromotionCodeValidationResult> {
    const { code, orderAmount, customerId, customerPhone } = input;

    try {
      const promo = await prisma.promotionCode.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!promo) {
        return {
          isValid: false,
          discountAmount: 0,
          error: 'Mã giảm giá không tồn tại',
        };
      }

      // Check if active
      if (!promo.isActive) {
        return {
          isValid: false,
          discountAmount: 0,
          promotionCode: this.transformPromotionCode(promo),
          error: 'Mã giảm giá đã bị vô hiệu hóa',
        };
      }

      // Check date range
      const now = new Date();
      if (now < promo.startDate) {
        return {
          isValid: false,
          discountAmount: 0,
          promotionCode: this.transformPromotionCode(promo),
          error: 'Mã giảm giá chưa có hiệu lực',
        };
      }

      if (now > promo.endDate) {
        return {
          isValid: false,
          discountAmount: 0,
          promotionCode: this.transformPromotionCode(promo),
          error: 'Mã giảm giá đã hết hạn',
        };
      }

      // Check minimum order amount
      if (promo.minOrderAmount && orderAmount < parseFloat(promo.minOrderAmount.toString())) {
        return {
          isValid: false,
          discountAmount: 0,
          promotionCode: this.transformPromotionCode(promo),
          error: `Đơn hàng tối thiểu ${parseFloat(promo.minOrderAmount.toString()).toLocaleString('vi-VN')} VND`,
        };
      }

      // Check max uses
      if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
        return {
          isValid: false,
          discountAmount: 0,
          promotionCode: this.transformPromotionCode(promo),
          error: 'Mã giảm giá đã hết lượt sử dụng',
        };
      }

      // Check max uses per customer
      if (promo.maxUsesPerCustomer !== null && (customerId || customerPhone)) {
        const usageCount = await prisma.promotionCodeUsage.count({
          where: {
            promotionCodeId: promo.id,
            OR: [
              customerId ? { customerId } : {},
              customerPhone ? { customerPhone } : {},
            ],
          },
        });

        if (usageCount >= promo.maxUsesPerCustomer) {
          return {
            isValid: false,
            discountAmount: 0,
            promotionCode: this.transformPromotionCode(promo),
            error: 'Bạn đã sử dụng hết lượt mã giảm giá này',
          };
        }
      }

      // Calculate discount
      let discountAmount = 0;

      if (promo.type === 'PERCENTAGE') {
        discountAmount = Math.floor(orderAmount * (parseFloat(promo.value.toString()) / 100));
      } else {
        discountAmount = parseFloat(promo.value.toString());
      }

      // Apply max discount limit
      if (promo.maxDiscountAmount) {
        const maxDiscount = parseFloat(promo.maxDiscountAmount.toString());
        discountAmount = Math.min(discountAmount, maxDiscount);
      }

      // Ensure discount doesn't exceed order amount
      discountAmount = Math.min(discountAmount, orderAmount);

      return {
        isValid: true,
        discountAmount,
        promotionCode: this.transformPromotionCode(promo),
      };
    } catch (error: any) {
      logger.error('Error validating promotion code', { error: error.message, code });
      return {
        isValid: false,
        discountAmount: 0,
        error: 'Lỗi khi kiểm tra mã giảm giá',
      };
    }
  }

  /**
   * Record promotion code usage
   */
  async recordUsage(
    promotionCodeId: string,
    discountAmount: number,
    orderId?: string,
    customerId?: string,
    customerPhone?: string
  ) {
    // Create usage record
    await prisma.promotionCodeUsage.create({
      data: {
        promotionCodeId,
        orderId: orderId || null,
        customerId: customerId || null,
        customerPhone: customerPhone || null,
        discountAmount: new Decimal(discountAmount),
      },
    });

    // Increment used count
    await prisma.promotionCode.update({
      where: { id: promotionCodeId },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });

    logger.info('Promotion code usage recorded', {
      promotionCodeId,
      orderId,
      discountAmount,
    });
  }
}

export default new PromotionService();

