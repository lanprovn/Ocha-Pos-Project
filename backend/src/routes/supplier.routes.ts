import { Router } from 'express';
import supplierController from '../controllers/supplier.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Get all suppliers
 *     description: Get a list of all suppliers with optional filters
 *     tags: [Suppliers]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of suppliers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Supplier'
 *   post:
 *     summary: Create a new supplier
 *     description: Create a new supplier (requires ADMIN or STAFF role)
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSupplierRequest'
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/', supplierController.getAll.bind(supplierController));
router.post('/', authenticate, requireRole('ADMIN', 'STAFF'), supplierController.create.bind(supplierController));

/**
 * @swagger
 * /api/suppliers/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     description: Get a specific supplier by its UUID
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Supplier UUID
 *     responses:
 *       200:
 *         description: Supplier details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Supplier not found
 *   patch:
 *     summary: Update supplier
 *     description: Update a supplier (requires ADMIN or STAFF role)
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Supplier UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSupplierRequest'
 *     responses:
 *       200:
 *         description: Supplier updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Supplier not found
 *   delete:
 *     summary: Delete supplier
 *     description: Delete a supplier (soft delete, requires ADMIN or STAFF role)
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Supplier UUID
 *     responses:
 *       200:
 *         description: Supplier deleted successfully
 *       404:
 *         description: Supplier not found
 */
router.get('/:id', supplierController.getById.bind(supplierController));
router.patch('/:id', authenticate, requireRole('ADMIN', 'STAFF'), supplierController.update.bind(supplierController));
router.delete('/:id', authenticate, requireRole('ADMIN', 'STAFF'), supplierController.delete.bind(supplierController));

export default router;



