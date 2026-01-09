import { Router } from 'express';
import uploadController from '@api/controllers/upload.controller';
import { upload } from '@services/upload.service';
import { authenticate, requireRole } from '@api/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/upload/cloudinary/status:
 *   get:
 *     summary: Check Cloudinary status
 *     description: Check if Cloudinary is configured and connected
 *     tags: [Upload]
 *     responses:
 *       200:
 *         description: Cloudinary status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 configured:
 *                   type: boolean
 *                   description: Whether Cloudinary credentials are configured
 *                 connected:
 *                   type: boolean
 *                   description: Whether Cloudinary connection is successful
 *                 cloudName:
 *                   type: string
 *                   description: Cloudinary cloud name
 *                 plan:
 *                   type: string
 *                   description: Cloudinary plan (Free, Paid, etc.)
 *                 message:
 *                   type: string
 *                   description: Status message
 */
router.get('/cloudinary/status', uploadController.checkCloudinaryStatus.bind(uploadController));

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
 *     description: Upload an image file to Cloudinary or local storage (requires ADMIN or STAFF role)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *           enum: [products, categories, users, general]
 *           default: products
 *         description: Cloudinary folder to organize images
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
 *                 description: Image file to upload (JPEG, PNG, WebP, GIF - max 5MB)
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Upload thành công
 *                 filename:
 *                   type: string
 *                   description: File identifier (public_id for Cloudinary, filename for local)
 *                 url:
 *                   type: string
 *                   format: uri
 *                   description: Image URL
 *                 fullUrl:
 *                   type: string
 *                   format: uri
 *                   description: Full image URL
 *                 size:
 *                   type: number
 *                   description: File size in bytes
 *                 mimetype:
 *                   type: string
 *                   example: image/jpeg
 *                 publicId:
 *                   type: string
 *                   description: Cloudinary public_id (only for Cloudinary uploads)
 *                 storageType:
 *                   type: string
 *                   enum: [cloudinary, local]
 *                   description: Storage type used
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
