import prisma from '../config/database';
import {
  CreateShiftInput,
  CloseShiftInput,
  UpdateShiftInput,
  ShiftFilters,
  Shift,
  ShiftSummary,
} from '../types/shift.types';
import { Decimal } from '@prisma/client/runtime/library';
import { ShiftNotFoundError, ShiftAlreadyClosedError, ShiftAlreadyOpenError } from '../errors';
import logger from '../utils/logger';

export class ShiftService {
  /**
   * Generate unique shift number
   */
  private generateShiftNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    return `SHIFT-${dateStr}-${timestamp}`;
  }

  /**
   * Transform shift to API format
   */
  private transformShift(shift: any): Shift {
    return {
      id: shift.id,
      shiftNumber: shift.shiftNumber,
      userId: shift.userId,
      userName: shift.userName,
      startTime: shift.startTime.toISOString(),
      endTime: shift.endTime ? shift.endTime.toISOString() : null,
      openingCash: shift.openingCash.toString(),
      closingCash: shift.closingCash ? shift.closingCash.toString() : null,
      expectedCash: shift.expectedCash ? shift.expectedCash.toString() : null,
      variance: shift.variance ? shift.variance.toString() : null,
      status: shift.status,
      notes: shift.notes,
      createdAt: shift.createdAt.toISOString(),
      updatedAt: shift.updatedAt.toISOString(),
    };
  }

  /**
   * Get all shifts with filters and pagination
   */
  async getAll(filters: ShiftFilters = {}) {
    const {
      userId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filters;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.startTime.lte = end;
      }
    }

    const skip = (page - 1) * limit;

    const [shifts, total] = await Promise.all([
      prisma.shift.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          startTime: 'desc',
        },
      }),
      prisma.shift.count({ where }),
    ]);

    return {
      data: shifts.map((shift) => this.transformShift(shift)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get shift by ID
   */
  async getById(id: string) {
    const shift = await prisma.shift.findUnique({
      where: { id },
    });

    if (!shift) {
      throw new ShiftNotFoundError(id);
    }

    return this.transformShift(shift);
  }

  /**
   * Get current open shift
   */
  async getCurrentOpenShift() {
    const shift = await prisma.shift.findFirst({
      where: {
        status: 'OPEN',
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return shift ? this.transformShift(shift) : null;
  }

  /**
   * Get shift summary with statistics
   */
  async getShiftSummary(id: string): Promise<ShiftSummary> {
    const shift = await prisma.shift.findUnique({
      where: { id },
    });

    if (!shift) {
      throw new ShiftNotFoundError(id);
    }

    // Get orders for this shift
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: shift.startTime,
          lte: shift.endTime || new Date(),
        },
        status: {
          not: 'CANCELLED',
        },
        paymentStatus: 'SUCCESS',
      },
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount.toString());
    }, 0);

    const cashRevenue = orders
      .filter((order) => order.paymentMethod === 'CASH')
      .reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);

    const cardRevenue = orders
      .filter((order) => order.paymentMethod === 'CARD')
      .reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);

    const qrRevenue = orders
      .filter((order) => order.paymentMethod === 'QR')
      .reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);

    const totalTransactions = orders.length;

    return {
      shift: this.transformShift(shift),
      totalOrders,
      totalRevenue,
      cashRevenue,
      cardRevenue,
      qrRevenue,
      totalTransactions,
    };
  }

  /**
   * Create new shift (open shift)
   */
  async create(data: CreateShiftInput) {
    // Check if there's already an open shift
    const openShift = await prisma.shift.findFirst({
      where: {
        status: 'OPEN',
      },
    });

    if (openShift) {
      throw new ShiftAlreadyOpenError();
    }

    const shiftNumber = this.generateShiftNumber();

    const shift = await prisma.shift.create({
      data: {
        shiftNumber,
        userId: data.userId,
        userName: data.userName,
        startTime: new Date(),
        openingCash: new Decimal(data.openingCash),
        notes: data.notes,
        status: 'OPEN',
      },
    });

    logger.info('Shift opened', { shiftNumber: shift.shiftNumber, userId: shift.userId });

    return this.transformShift(shift);
  }

  /**
   * Auto-open shift for staff (check-in)
   * Automatically opens shift with opening cash when staff logs in
   */
  async autoOpenForStaff(data: { userId: string; userName: string; openingCash?: number; notes?: string | null }) {
    // Check if there's already an open shift
    const openShift = await prisma.shift.findFirst({
      where: {
        status: 'OPEN',
      },
    });

    if (openShift) {
      // If shift already open, return existing shift
      return this.transformShift(openShift);
    }

    // Get user name from database if available
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { name: true },
    });

    const shiftNumber = this.generateShiftNumber();

    const shift = await prisma.shift.create({
      data: {
        shiftNumber,
        userId: data.userId,
        userName: user?.name || data.userName,
        startTime: new Date(),
        openingCash: new Decimal(data.openingCash ?? 0),
        notes: data.notes || 'Ca tự động mở khi nhân viên đăng nhập',
        status: 'OPEN',
      },
    });

    logger.info('Shift auto-opened for staff', { shiftNumber: shift.shiftNumber, userId: shift.userId });

    return this.transformShift(shift);
  }

  /**
   * Close shift
   */
  async close(id: string, data: CloseShiftInput) {
    const shift = await prisma.shift.findUnique({
      where: { id },
    });

    if (!shift) {
      throw new ShiftNotFoundError(id);
    }

    if (shift.status === 'CLOSED') {
      throw new ShiftAlreadyClosedError(shift.shiftNumber);
    }

    // Calculate expected cash
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: shift.startTime,
        },
        paymentMethod: 'CASH',
        paymentStatus: 'SUCCESS',
        status: {
          not: 'CANCELLED',
        },
      },
    });

    const cashRevenue = orders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount.toString());
    }, 0);

    const expectedCash = parseFloat(shift.openingCash.toString()) + cashRevenue;
    const variance = parseFloat(data.closingCash.toString()) - expectedCash;

    const updated = await prisma.shift.update({
      where: { id },
      data: {
        endTime: new Date(),
        closingCash: new Decimal(data.closingCash),
        expectedCash: new Decimal(expectedCash),
        variance: new Decimal(variance),
        status: 'CLOSED',
        notes: data.notes,
      },
    });

    logger.info('Shift closed', {
      shiftNumber: updated.shiftNumber,
      userId: updated.userId,
      variance: variance.toString(),
    });

    return this.transformShift(updated);
  }

  /**
   * Update shift
   */
  async update(id: string, data: UpdateShiftInput) {
    const shift = await prisma.shift.findUnique({
      where: { id },
    });

    if (!shift) {
      throw new ShiftNotFoundError(id);
    }

    const updateData: any = {};
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await prisma.shift.update({
      where: { id },
      data: updateData,
    });

    return this.transformShift(updated);
  }

  /**
   * Delete shift (only if closed)
   */
  async delete(id: string) {
    const shift = await prisma.shift.findUnique({
      where: { id },
    });

    if (!shift) {
      throw new ShiftNotFoundError(id);
    }

    if (shift.status === 'OPEN') {
      throw new ShiftAlreadyOpenError('Không thể xóa ca đang mở. Vui lòng đóng ca trước.');
    }

    await prisma.shift.delete({
      where: { id },
    });

    logger.info('Shift deleted', { shiftNumber: shift.shiftNumber });

    return { message: 'Shift deleted successfully' };
  }
}

export default new ShiftService();

