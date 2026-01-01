import { Request, Response } from 'express';
import purchaseOrderService from '../services/purchase-order.service';
import { z } from 'zod';
import {
  PurchaseOrderNotFoundError,
  InvalidPurchaseOrderStatusError,
  SupplierNotFoundError,
} from '../errors/BusinessErrors';
import { PurchaseOrderStatus } from '../types/supplier.types';

const createPurchaseOrderSchema = z.object({
  body: z.object({
    supplierId: z.string().uuid(),
    items: z.array(
      z.object({
        productId: z.string().uuid().optional(),
        ingredientId: z.string().uuid().optional(),
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
        notes: z.string().optional(),
      })
    ).min(1),
    notes: z.string().optional(),
  }),
});

const updatePurchaseOrderSchema = z.object({
  body: z.object({
    supplierId: z.string().uuid().optional(),
    items: z.array(
      z.object({
        productId: z.string().uuid().optional(),
        ingredientId: z.string().uuid().optional(),
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
        notes: z.string().optional(),
      })
    ).optional(),
    notes: z.string().optional(),
    status: z.nativeEnum(PurchaseOrderStatus).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

const receivePurchaseOrderSchema = z.object({
  body: z.object({
    receivedAt: z.string().datetime().optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export class PurchaseOrderController {
  async getAll(req: Request, res: Response) {
    try {
      const filters: any = {};
      if (req.query.supplierId) {
        filters.supplierId = req.query.supplierId as string;
      }
      if (req.query.status) {
        filters.status = req.query.status as PurchaseOrderStatus;
      }
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const purchaseOrders = await purchaseOrderService.getAll(filters);
      res.json(purchaseOrders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const purchaseOrder = await purchaseOrderService.getById(id);
      res.json(purchaseOrder);
    } catch (error: any) {
      if (error instanceof PurchaseOrderNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validated = createPurchaseOrderSchema.parse({ body: req.body });
      const purchaseOrder = await purchaseOrderService.create(validated.body);
      res.status(201).json(purchaseOrder);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error instanceof SupplierNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const validated = updatePurchaseOrderSchema.parse({ body: req.body, params: req.params });
      const purchaseOrder = await purchaseOrderService.update(validated.params.id, validated.body);
      res.json(purchaseOrder);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error instanceof PurchaseOrderNotFoundError || error instanceof SupplierNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else if (error instanceof InvalidPurchaseOrderStatusError) {
        res.status(400).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async receive(req: Request, res: Response) {
    try {
      const validated = receivePurchaseOrderSchema.parse({ body: req.body, params: req.params });
      const purchaseOrder = await purchaseOrderService.receive(validated.params.id, {
        receivedAt: validated.body.receivedAt ? new Date(validated.body.receivedAt) : undefined,
        notes: validated.body.notes,
      });
      res.json(purchaseOrder);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error instanceof PurchaseOrderNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else if (error instanceof InvalidPurchaseOrderStatusError) {
        res.status(400).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async markAsPaid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const purchaseOrder = await purchaseOrderService.markAsPaid(id);
      res.json(purchaseOrder);
    } catch (error: any) {
      if (error instanceof PurchaseOrderNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else if (error instanceof InvalidPurchaseOrderStatusError) {
        res.status(400).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const purchaseOrder = await purchaseOrderService.cancel(id);
      res.json(purchaseOrder);
    } catch (error: any) {
      if (error instanceof PurchaseOrderNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else if (error instanceof InvalidPurchaseOrderStatusError) {
        res.status(400).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}

export default new PurchaseOrderController();



