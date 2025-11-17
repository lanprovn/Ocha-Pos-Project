import { Request, Response } from 'express';
import orderService from '../services/order.service';
import { emitOrderCreated, emitOrderUpdated, emitOrderStatusChanged } from '../socket/socket.io';
import { z } from 'zod';

const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().optional().nullable(),
    customerPhone: z.string().optional().nullable(),
    customerTable: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    paymentMethod: z.enum(['CASH', 'CARD', 'QR']).optional(),
    paymentStatus: z.enum(['PENDING', 'SUCCESS', 'FAILED']).optional(),
    orderCreator: z.enum(['STAFF', 'CUSTOMER']).optional(),
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
    ).min(1),
  }),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export class OrderController {
  /**
   * Create or update draft order (cart đang tạo)
   */
  async createOrUpdateDraft(req: Request, res: Response) {
    try {
      const validated = createOrderSchema.parse({ body: req.body });
      const order = await orderService.createOrUpdateDraft(validated.body);
      
      // Emit Socket.io event for real-time updates
      emitOrderUpdated(order);
      
      res.status(200).json(order);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validated = createOrderSchema.parse({ body: req.body });
      const order = await orderService.create(validated.body);
      
      // Emit Socket.io event for real-time updates
      emitOrderCreated(order);
      
      res.status(201).json(order);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        paymentMethod: req.query.paymentMethod as string | undefined,
        paymentStatus: req.query.paymentStatus as string | undefined,
      };

      const orders = await orderService.findAll(filters);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getToday(_req: Request, res: Response) {
    try {
      const orders = await orderService.findToday();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getByDate(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.params;
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        return;
      }

      const orders = await orderService.findByDate(date);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await orderService.findById(id);
      res.json(order);
    } catch (error: any) {
      if (error.message === 'Order not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const validated = updateOrderStatusSchema.parse({
        body: req.body,
        params: req.params,
      });
      const order = await orderService.updateStatus(validated.params.id, validated.body);
      
      // Emit Socket.io events for real-time updates
      // Emit both order_updated (full order data) and order_status_changed (status only)
      emitOrderUpdated(order);
      emitOrderStatusChanged(order.id, order.status);
      
      res.json(order);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error.message === 'Order not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}

export default new OrderController();

