import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import cloudinary from '@config/cloudinary';
import env from '@config/env';
import logger from '@utils/logger';

// Helper function to check Cloudinary configuration dynamically
const checkCloudinaryConfig = (): boolean => {
  try {
    return !!(
      env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
    );
  } catch {
    return false;
  }
};

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, '../../uploads/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình storage cho multer - dùng memory storage để hỗ trợ Cloudinary
// Nếu Cloudinary không được config, sẽ fallback về disk storage
// Sử dụng function để kiểm tra động mỗi khi cần
const getMulterStorage = () => {
  const isConfigured = checkCloudinaryConfig();
  if (isConfigured) {
    logger.info('📦 Multer: Using memory storage for Cloudinary support');
    return multer.memoryStorage();
  } else {
    logger.info('📦 Multer: Using disk storage (Cloudinary not configured)');
    return multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (_req, file, cb) => {
        const filename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, filename);
      },
    });
  }
};

// Initialize storage - check Cloudinary config at startup
const storage = getMulterStorage();
const initialCloudinaryStatus = checkCloudinaryConfig();
if (initialCloudinaryStatus) {
  logger.info('✅ Cloudinary is configured - uploads will go to Cloudinary');
} else {
  logger.warn('⚠️  Cloudinary not configured - uploads will use local storage');
}

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
  publicId?: string; // Cloudinary public_id
  storageType?: 'cloudinary' | 'local'; // Storage type indicator
}

export type CloudinaryFolder = 'products' | 'categories' | 'users' | 'general';

export interface CloudinaryStatus {
  configured: boolean;
  connected: boolean;
  cloudName?: string;
  plan?: string;
  message?: string;
}

export class UploadService {
  /**
   * Check if Cloudinary is configured
   */
  private isCloudinaryConfigured(): boolean {
    return checkCloudinaryConfig();
  }

  /**
   * Check Cloudinary connection status
   */
  async checkCloudinaryStatus(): Promise<CloudinaryStatus> {
    if (!this.isCloudinaryConfigured()) {
      return {
        configured: false,
        connected: false,
        message: 'Cloudinary chưa được cấu hình. Vui lòng thêm thông tin vào file .env',
      };
    }

    try {
      // Test connection
      const pingResult = await cloudinary.api.ping();
      
      if (pingResult.status === 'ok') {
        try {
          const accountInfo = await cloudinary.api.account();
          return {
            configured: true,
            connected: true,
            cloudName: accountInfo.cloud_name,
            plan: accountInfo.plan || 'Free',
            message: 'Cloudinary đã được cấu hình và kết nối thành công',
          };
        } catch {
          return {
            configured: true,
            connected: true,
            cloudName: env.CLOUDINARY_CLOUD_NAME,
            message: 'Cloudinary đã được cấu hình và kết nối thành công',
          };
        }
      }

      return {
        configured: true,
        connected: false,
        message: 'Không thể kết nối với Cloudinary',
      };
    } catch (error) {
      logger.error('Cloudinary status check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        configured: true,
        connected: false,
        message: `Lỗi kết nối Cloudinary: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Upload image to Cloudinary or local storage (fallback)
   * @param file - File to upload
   * @param folder - Cloudinary folder (default: 'products')
   */
  async uploadImage(file: Express.Multer.File, folder: CloudinaryFolder = 'products'): Promise<UploadResult> {
    // Validate file buffer exists (required for Cloudinary)
    if (!file.buffer && !file.path) {
      throw new Error('File buffer or path is required for upload');
    }

    // Try Cloudinary first if configured
    if (this.isCloudinaryConfigured()) {
      try {
        // Ensure file has buffer for Cloudinary upload
        if (!file.buffer && file.path) {
          // Read file from disk if only path is available (shouldn't happen with memory storage)
          logger.warn('Reading file from disk for Cloudinary upload (unexpected)', {
            path: file.path,
            originalname: file.originalname,
          });
          const fileBuffer = fs.readFileSync(file.path);
          file.buffer = fileBuffer;
        }

        if (!file.buffer) {
          throw new Error('File buffer is required for Cloudinary upload');
        }

        logger.info('🚀 Attempting Cloudinary upload', {
          folder,
          size: file.buffer.length,
          mimetype: file.mimetype,
          hasBuffer: !!file.buffer,
          hasPath: !!file.path,
        });

        const result = await this.uploadToCloudinary(file, folder);
        logger.info('✅ Cloudinary upload successful', {
          url: result.url,
          storageType: result.storageType,
        });
        return result;
      } catch (error) {
        logger.error('Cloudinary upload failed, falling back to local storage', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          hasBuffer: !!file.buffer,
          hasPath: !!file.path,
          bufferSize: file.buffer?.length || 0,
          folder,
        });
        // Fall through to local storage
      }
    } else {
      logger.debug('Cloudinary not configured, using local storage', {
        hasBuffer: !!file.buffer,
        hasPath: !!file.path,
      });
    }

    // Fallback to local storage
    return await this.uploadToLocal(file);
  }

  /**
   * Upload image to Cloudinary
   * @param file - File to upload
   * @param folder - Cloudinary folder
   */
  private async uploadToCloudinary(file: Express.Multer.File, folder: CloudinaryFolder = 'products'): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      // Ensure we have buffer for Cloudinary upload
      let fileBuffer: Buffer;
      if (file.buffer) {
        fileBuffer = file.buffer;
      } else if (file.path) {
        // Read from disk if buffer not available (shouldn't happen with memory storage)
        logger.warn('Reading file from disk for Cloudinary upload', {
          path: file.path,
          originalname: file.originalname,
        });
        fileBuffer = fs.readFileSync(file.path);
      } else {
        reject(new Error('File buffer or path is required for Cloudinary upload'));
        return;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `ocha-pos/${folder}`,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto' },
          ],
          // Generate unique filename
          public_id: `${folder}-${Date.now()}-${uuidv4()}`,
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload stream error', {
              error: error.message,
              http_code: (error as any).http_code,
            });
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error('Cloudinary upload returned no result'));
            return;
          }

          logger.info('☁️ Image uploaded to Cloudinary successfully', {
            publicId: result.public_id,
            url: result.secure_url,
            size: result.bytes,
            folder,
          });

          resolve({
            filename: result.public_id,
            url: result.secure_url,
            fullUrl: result.secure_url,
            size: result.bytes,
            mimetype: result.format || file.mimetype,
            publicId: result.public_id,
            storageType: 'cloudinary',
          });
        }
      );

      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(fileBuffer);
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
            storageType: 'local',
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
      storageType: 'local',
    };
  }

  /**
   * Delete image from Cloudinary or local storage
   * @param filename - Can be Cloudinary URL, public_id, or local filename
   */
  async deleteImage(filename: string): Promise<void> {
    // Check if it's a Cloudinary URL or public_id
    if (filename.includes('cloudinary.com') || filename.includes('/ocha-pos/')) {
      if (this.isCloudinaryConfigured()) {
        try {
          let publicId: string;
          
          // Extract public_id from Cloudinary URL
          if (filename.includes('cloudinary.com')) {
            // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{ext}
            const urlParts = filename.split('/upload/');
            if (urlParts.length > 1) {
              // Remove version prefix if exists (v1234567890/)
              const pathAfterUpload = urlParts[1].replace(/^v\d+\//, '');
              // Remove file extension
              publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
            } else {
              throw new Error('Invalid Cloudinary URL format');
            }
          } else {
            // Assume it's already a public_id
            publicId = filename.startsWith('ocha-pos/') ? filename : `ocha-pos/${filename}`;
          }
          
          const result = await cloudinary.uploader.destroy(publicId);
          
          if (result.result === 'ok' || result.result === 'not found') {
            logger.info('☁️ Image deleted from Cloudinary', { publicId, result: result.result });
            return;
          } else {
            throw new Error(`Cloudinary delete failed: ${result.result}`);
          }
        } catch (error) {
          logger.error('Failed to delete from Cloudinary', {
            error: error instanceof Error ? error.message : String(error),
            filename,
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
          logger.info('📁 Image deleted from local storage', { filename });
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
