import { Router } from 'express';
import uploadController from '../controllers/upload.controller';
import { upload } from '../services/upload.service';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/upload/images:
 *   get:
 *     summary: List uploaded images
 *     description: Get a list of all uploaded images
 *     tags: [Upload]
 *     responses:
 *       200:
 *         description: List of images
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   filename:
 *                     type: string
 *                   url:
 *                     type: string
 *                     format: uri
 *                   size:
 *                     type: number
 *                   uploadedAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/images', uploadController.listImages.bind(uploadController));

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload image
 *     description: Upload an image file (requires ADMIN or STAFF role)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filename:
 *                   type: string
 *                 url:
 *                   type: string
 *                   format: uri
 *       400:
 *         description: Validation error or invalid file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/image', authenticate, requireRole('ADMIN', 'STAFF'), upload.single('image'), uploadController.uploadImage.bind(uploadController));

/**
 * @swagger
 * /api/upload/image/{filename}:
 *   delete:
 *     summary: Delete image
 *     description: Delete an uploaded image (requires ADMIN or STAFF role)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Image filename
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Image deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Image not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/image/:filename', authenticate, requireRole('ADMIN', 'STAFF'), uploadController.deleteImage.bind(uploadController));

export default router;
