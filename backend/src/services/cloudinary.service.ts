import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import env from '../config/env';
import logger from '../utils/logger';

// Configure Cloudinary
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true, // Use HTTPS
  });
  logger.info('✅ Cloudinary configured successfully', {
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY.substring(0, 5) + '...', // Only log first 5 chars for security
  });
} else {
  logger.warn('⚠️ Cloudinary not configured - will use local storage', {
    has_cloud_name: !!env.CLOUDINARY_CLOUD_NAME,
    has_api_key: !!env.CLOUDINARY_API_KEY,
    has_api_secret: !!env.CLOUDINARY_API_SECRET,
  });
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class CloudinaryService {
  /**
   * Check if Cloudinary is configured
   */
  isConfigured(): boolean {
    return !!(
      env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
    );
  }

  /**
   * Upload image buffer to Cloudinary
   */
  async uploadImage(
    buffer: Buffer,
    folder: string = 'ocha-pos/products',
    options?: {
      public_id?: string;
      transformation?: any[];
    }
  ): Promise<CloudinaryUploadResult> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary is not configured');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          ...options,
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error', {
              error: error.message,
              stack: error.stack,
            });
            reject(error);
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url || result.url || '',
              url: result.url || '',
              width: result.width || 0,
              height: result.height || 0,
              format: result.format || '',
              bytes: result.bytes || 0,
            });
          } else {
            reject(new Error('Upload failed - no result returned'));
          }
        }
      );

      // Convert buffer to stream
      const readable = new Readable();
      readable._read = () => {}; // _read is required but can be a no-op
      readable.push(buffer);
      readable.push(null);

      readable.pipe(uploadStream);
    });
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary is not configured');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          logger.error('Cloudinary delete error', {
            error: error.message,
            stack: error.stack,
            publicId,
          });
          reject(error);
        } else if (result?.result === 'ok' || result?.result === 'not found') {
          // 'not found' is also OK - image might already be deleted
          resolve();
        } else {
          reject(new Error(`Delete failed: ${result?.result || 'unknown'}`));
        }
      });
    });
  }

  /**
   * Extract public_id from Cloudinary URL
   */
  extractPublicId(url: string): string | null {
    try {
      // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if URL is a Cloudinary URL
   */
  isCloudinaryUrl(url: string): boolean {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  }
}

export default new CloudinaryService();

