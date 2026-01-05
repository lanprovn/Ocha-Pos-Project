import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import cloudinary from '@config/cloudinary';
import env from '@config/env';
import logger from '@utils/logger';

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, '../../uploads/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình storage cho multer - dùng memory storage để hỗ trợ Cloudinary
// Nếu Cloudinary không được config, sẽ fallback về disk storage
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const storage = isCloudinaryConfigured
  ? multer.memoryStorage() // Use memory storage for Cloudinary
  : multer.diskStorage({
      // Use disk storage for local fallback
      destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (_req, file, cb) => {
        const filename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, filename);
      },
    });

// Filter để chỉ cho phép upload hình ảnh
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file hình ảnh (JPEG, PNG, WebP, GIF)'));
  }
};

// Cấu hình multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

export interface UploadResult {
  filename: string;
  url: string;
  fullUrl: string;
  size: number;
  mimetype: string;
}

export class UploadService {
  /**
   * Check if Cloudinary is configured
   */
  private isCloudinaryConfigured(): boolean {
    return !!(
      env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
    );
  }

  /**
   * Upload image to Cloudinary or local storage (fallback)
   */
  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    // Try Cloudinary first if configured
    if (this.isCloudinaryConfigured()) {
      try {
        return await this.uploadToCloudinary(file);
      } catch (error) {
        logger.warn('Cloudinary upload failed, falling back to local storage', {
          error: error instanceof Error ? error.message : String(error),
        });
        // Fall through to local storage
      }
    }

    // Fallback to local storage
    return await this.uploadToLocal(file);
  }

  /**
   * Upload image to Cloudinary
   */
  private async uploadToCloudinary(file: Express.Multer.File): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ocha-pos/products',
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error('Cloudinary upload returned no result'));
            return;
          }

          logger.info('☁️ Image uploaded to Cloudinary', {
            publicId: result.public_id,
            url: result.secure_url,
            size: result.bytes,
          });

          resolve({
            filename: result.public_id,
            url: result.secure_url,
            fullUrl: result.secure_url,
            size: result.bytes,
            mimetype: result.format || file.mimetype,
          });
        }
      );

      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }

  /**
   * Upload image to local storage
   */
  private async uploadToLocal(file: Express.Multer.File): Promise<UploadResult> {
    // If using memory storage (Cloudinary fallback), save file to disk
    if (file.buffer && !file.path) {
      const filename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
      const filePath = path.join(uploadsDir, filename);
      
      return new Promise((resolve, reject) => {
        fs.writeFile(filePath, file.buffer, (error) => {
          if (error) {
            reject(error);
            return;
          }

          const fileUrl = this.getFileUrl(filename);
          logger.info('📁 Image uploaded to local storage', {
            filename,
            size: file.size,
            mimetype: file.mimetype,
          });

          resolve({
            filename,
            url: fileUrl,
            fullUrl: fileUrl, // Will be prefixed with BACKEND_URL in controller
            size: file.size,
            mimetype: file.mimetype,
          });
        });
      });
    }

    // If using disk storage (normal local storage)
    const filename = file.filename || `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    const fileUrl = this.getFileUrl(filename);
    
    logger.info('📁 Image uploaded to local storage', {
      filename,
      size: file.size,
      mimetype: file.mimetype,
    });

    return {
      filename,
      url: fileUrl,
      fullUrl: fileUrl, // Will be prefixed with BACKEND_URL in controller
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Delete image from Cloudinary or local storage
   */
  async deleteImage(filename: string): Promise<void> {
    // Check if it's a Cloudinary URL or public_id
    if (filename.includes('cloudinary.com') || filename.includes('/ocha-pos/')) {
      if (this.isCloudinaryConfigured()) {
        try {
          // Extract public_id from URL or use filename directly
          const publicId = filename.includes('cloudinary.com')
            ? filename.split('/ocha-pos/')[1]?.split('.')[0] || filename
            : filename.replace('ocha-pos/', '');
          
          await cloudinary.uploader.destroy(`ocha-pos/${publicId}`);
          logger.info('☁️ Image deleted from Cloudinary', { publicId });
          return;
        } catch (error) {
          logger.error('Failed to delete from Cloudinary', {
            error: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      }
    }

    // Fallback to local storage deletion
    const filePath = this.getFilePath(filename);
    if (!fs.existsSync(filePath)) {
      throw new Error('File không tồn tại');
    }

    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get URL của file đã upload
   */
  getFileUrl(filename: string): string {
    return `/uploads/images/${filename}`;
  }

  /**
   * Get full path của file
   */
  getFilePath(filename: string): string {
    return path.join(uploadsDir, filename);
  }

  /**
   * Kiểm tra file có tồn tại không
   */
  fileExists(filename: string): boolean {
    const filePath = this.getFilePath(filename);
    return fs.existsSync(filePath);
  }

  /**
   * Lấy danh sách tất cả files trong uploads directory
   */
  listFiles(): string[] {
    try {
      return fs.readdirSync(uploadsDir);
    } catch (error) {
      logger.error('Error listing files', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return [];
    }
  }
}

export default new UploadService();
