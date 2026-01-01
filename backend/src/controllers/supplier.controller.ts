import { Request, Response } from 'express';
import supplierService from '../services/supplier.service';
import { z } from 'zod';
import { SupplierNotFoundError } from '../errors/BusinessErrors';

const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    contactName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    taxCode: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    contactName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    taxCode: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export class SupplierController {
  async getAll(req: Request, res: Response) {
    try {
      const isActive = req.query.isActive === undefined ? undefined : req.query.isActive === 'true';
      const suppliers = await supplierService.getAll(isActive);
      res.json(suppliers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplier = await supplierService.getById(id);
      res.json(supplier);
    } catch (error: any) {
      if (error instanceof SupplierNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validated = createSupplierSchema.parse({ body: req.body });
      const supplier = await supplierService.create(validated.body);
      res.status(201).json(supplier);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const validated = updateSupplierSchema.parse({ body: req.body, params: req.params });
      const supplier = await supplierService.update(validated.params.id, validated.body);
      res.json(supplier);
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

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await supplierService.delete(id);
      res.json({ message: 'Supplier deleted successfully' });
    } catch (error: any) {
      if (error instanceof SupplierNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}

export default new SupplierController();



