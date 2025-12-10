import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import cloudinaryService from './cloudinary.service';

// Đảm bảo thư mục uploads tồn tại (fallback cho local storage)
const uploadsDir = path.join(__dirname, '../../uploads/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình storage cho multer
// Use memory storage to get buffer for Cloudinary, fallback to disk for local storage
const storage = multer.memoryStorage();

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
  storage: 'cloudinary' | 'local';
}

export class UploadService {
  /**
   * Upload image - uses Cloudinary if configured, otherwise falls back to local storage
   */
  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    // Try Cloudinary first if configured
    if (cloudinaryService.isConfigured()) {
      try {
        const result = await cloudinaryService.uploadImage(
          file.buffer,
          'ocha-pos/products',
          {
            public_id: `product-${Date.now()}-${uuidv4()}`,
          }
        );

        return {
          filename: result.public_id,
          url: result.secure_url,
          fullUrl: result.secure_url,
          size: result.bytes,
          mimetype: file.mimetype,
          storage: 'cloudinary',
        };
      } catch (error) {
        logger.warn('Cloudinary upload failed, falling back to local storage', {
          error: error instanceof Error ? error.message : String(error),
        });
        // Fall through to local storage
      }
    }

    // Fallback to local storage
    const filename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadsDir, filename);

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, file.buffer, (error) => {
        if (error) {
          reject(error);
        } else {
          const fileUrl = this.getFileUrl(filename);
          resolve({
            filename,
            url: fileUrl,
            fullUrl: fileUrl, // Will be prefixed with BACKEND_URL in controller
            size: file.size,
            mimetype: file.mimetype,
            storage: 'local',
          });
        }
      });
    });
  }

  /**
   * Delete image - handles both Cloudinary and local storage
   */
  async deleteImage(urlOrFilename: string): Promise<void> {
    // Check if it's a Cloudinary URL
    if (cloudinaryService.isCloudinaryUrl(urlOrFilename)) {
      if (cloudinaryService.isConfigured()) {
        const publicId = cloudinaryService.extractPublicId(urlOrFilename);
        if (publicId) {
          try {
            await cloudinaryService.deleteImage(publicId);
            return;
          } catch (error) {
            logger.error('Failed to delete from Cloudinary', {
              error: error instanceof Error ? error.message : String(error),
              publicId,
            });
            throw error;
          }
        }
      }
      throw new Error('Cloudinary không được cấu hình hoặc URL không hợp lệ');
    }

    // Local storage deletion
    const filePath = this.getFilePath(urlOrFilename);
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
   * Get URL của file đã upload (local storage)
   */
  getFileUrl(filename: string): string {
    return `/uploads/images/${filename}`;
  }

  /**
   * Get full path của file (local storage)
   */
  getFilePath(filename: string): string {
    return path.join(uploadsDir, filename);
  }

  /**
   * Kiểm tra file có tồn tại không (local storage)
   */
  fileExists(filename: string): boolean {
    const filePath = this.getFilePath(filename);
    return fs.existsSync(filePath);
  }

  /**
   * Lấy danh sách tất cả files trong uploads directory (local storage only)
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

