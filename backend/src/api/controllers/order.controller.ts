import { Request, Response, NextFunction } from 'express';
import orderService from '@services/order.service';
import userService from '@services/user.service';
import { z } from 'zod';
import { OrderStatus, PaymentMethod, PaymentStatus, OrderCreator } from '@core/types/common.types';
import { AuthRequest } from '@api/middlewares/auth.middleware';

// Schema for draft order - allows empty items array for real-time cart sync
const createDraftOrderSchema = z.object({
  body: z.object({
    customerName: z.string().optional().nullable(),
    customerPhone: z.string().optional().nullable(),
    customerTable: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    orderCreator: z.nativeEnum(OrderCreator).optional(),
    orderCreatorName: z.string().optional().nullable(),
    items: z.array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
        subtotal: z.number().positive(),
        selectedSize: z.string().optional().nullable(),
        selectedToppings: z.array(z.string()).optional(),
        note: z.string().optional().nullable(),
      })
    ).min(0), // Allow empty array for draft orders (cart can be empty)
  }),
});

// Schema for final order - requires at least 1 item
const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().optional().nullable(),
    customerPhone: z.string().optional().nullable(),
    customerTable: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    orderCreator: z.nativeEnum(OrderCreator).optional(),
    orderCreatorName: z.string().optional().nullable(),
    items: z.array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
        subtotal: z.number().positive(),
        selectedSize: z.string().optional().nullable(),
        selectedToppings: z.array(z.string()).optional(),
        note: z.string().optional().nullable(),
      })
    ).min(1), // Final order must have at least 1 item
  }),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(OrderStatus),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

const verifyOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const rejectOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    reason: z.string().optional(),
  }),
});

const holdOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    holdName: z.string().optional().nullable(),
  }),
});

const cancelOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    reason: z.string().min(1),
    reasonType: z.enum(['OUT_OF_STOCK', 'CUSTOMER_REQUEST', 'SYSTEM_ERROR', 'OTHER']),
    refundAmount: z.number().positive().optional().nullable(),
    refundMethod: z.enum(['CASH', 'CARD', 'QR']).optional().nullable(),
  }),
});

const returnOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    returnType: z.enum(['FULL', 'PARTIAL']),
    returnReason: z.enum(['DEFECTIVE', 'WRONG_ITEM', 'CUSTOMER_REQUEST', 'OTHER']),
    refundMethod: z.enum(['CASH', 'CARD', 'QR']),
    items: z.array(
      z.object({
        orderItemId: z.string().uuid(),
        quantity: z.number().int().positive(),
        refundAmount: z.number().positive(),
      })
    ).min(1),
    notes: z.string().optional().nullable(),
  }),
});

const splitOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    splits: z.array(
      z.object({
        name: z.string().optional().nullable(),
        itemIds: z.array(z.string().uuid()).min(1),
      })
    ).min(2), // Ít nhất 2 phần
  }),
});

const mergeOrdersSchema = z.object({
  body: z.object({
    orderIds: z.array(z.string().uuid()).min(2), // Ít nhất 2 đơn
    mergedOrderName: z.string().optional().nullable(),
  }),
});

export class OrderController {
  /**
   * Create or update draft order (cart đang tạo)
   * Allows empty items array for real-time cart sync when cart is cleared
   */
  async createOrUpdateDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createDraftOrderSchema.parse({ body: req.body });
      const order = await orderService.createOrUpdateDraft(validated.body);

      res.status(200).json(order);
    } catch (error) {
      // Pass error to error handler middleware
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createOrderSchema.parse({ body: req.body });
      const order = await orderService.create(validated.body);

      res.status(201).json(order);
    } catch (error) {
      // Pass error to error handler middleware
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract query params and delegate to service
      const result = await orderService.findAllWithPagination({
        status: req.query.status as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        paymentMethod: req.query.paymentMethod as string | undefined,
        paymentStatus: req.query.paymentStatus as string | undefined,
        page: req.query.page as string | number | undefined,
        limit: req.query.limit as string | number | undefined,
      });

      // Send response
      if (Array.isArray(result)) {
        // Simple array response (no pagination)
        res.json(result);
      } else {
        // Paginated response
        res.json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  async getToday(_req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.findToday();
      res.json(orders);
    } catch (error) {
      next(error);
    }
  }

  async getByDate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { date } = req.params;
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({
          error: 'Invalid date format. Use YYYY-MM-DD',
          errorCode: 'VALIDATION_ERROR',
        });
        return;
      }

      const orders = await orderService.findByDate(date);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await orderService.findById(id);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateOrderStatusSchema.parse({
        body: req.body,
        params: req.params,
      });
      const order = await orderService.updateStatus(validated.params.id, validated.body);

      res.json(order);
    } catch (error) {
      // Pass error to error handler middleware
      next(error);
    }
  }

  /**
   * Verify order (Staff confirms Customer order)
   * Changes status from PENDING to CONFIRMED
   */
  async verifyOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
        return;
      }

      const validated = verifyOrderSchema.parse({
        params: req.params,
      });

      // Get staff user info for confirmedBy field
      const staffUser = await userService.findById(req.user.userId);
      const staffName = staffUser?.name || req.user.email;

      const order = await orderService.verifyOrder(
        validated.params.id,
        req.user.userId,
        staffName
      );

      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject order (Staff rejects Customer order)
   * Changes status from PENDING to CANCELLED
   */
  async rejectOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
        return;
      }

      const validated = rejectOrderSchema.parse({
        params: req.params,
        body: req.body,
      });

      const order = await orderService.rejectOrder(
        validated.params.id,
        validated.body.reason
      );

      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Hold order (Lưu đơn hàng tạm)
   */
  async holdOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
        return;
      }

      const validated = holdOrderSchema.parse({
        params: req.params,
        body: req.body,
      });

      const order = await orderService.holdOrder(
        validated.params.id,
        validated.body,
        req.user.id
      );

      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resume hold order (Khôi phục đơn hàng đã lưu)
   */
  async resumeHoldOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
        return;
      }

      const validated = verifyOrderSchema.parse({
        params: req.params,
      });

      const order = await orderService.resumeHoldOrder(
        validated.params.id,
        req.user.id
      );

      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get hold orders
   */
  async getHoldOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
        return;
      }

      const orderCreator = req.query.orderCreator as 'STAFF' | 'CUSTOMER' | undefined;
      const orders = await orderService.getHoldOrders(orderCreator);

      res.json(orders);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel order with reason and refund
   */
  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
        return;
      }

      const validated = cancelOrderSchema.parse({
        params: req.params,
        body: req.body,
      });

      const order = await orderService.cancelOrder(
        validated.params.id,
        validated.body,
        req.user.id
      );

      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Return order items
   */
  async returnOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
        return;
      }

      const validated = returnOrderSchema.parse({
        params: req.params,
        body: req.body,
      });

      const result = await orderService.returnOrder(
        validated.params.id,
        validated.body,
        req.user.id
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Split order
   */
  async splitOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
        return;
      }

      const validated = splitOrderSchema.parse({
        params: req.params,
        body: req.body,
      });

      const result = await orderService.splitOrder(
        validated.params.id,
        validated.body,
        req.user.id
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Merge orders
   */
  async mergeOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
        return;
      }

      const validated = mergeOrdersSchema.parse({
        body: req.body,
      });

      const result = await orderService.mergeOrders(
        validated.body,
        req.user.id
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();

