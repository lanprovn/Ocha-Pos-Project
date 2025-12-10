import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, '../../uploads/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình storage cho multer - dùng disk storage cho local
const storage = multer.diskStorage({
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
   * Upload image - local storage only
   */
  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
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
   * Delete image
   */
  async deleteImage(filename: string): Promise<void> {
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
