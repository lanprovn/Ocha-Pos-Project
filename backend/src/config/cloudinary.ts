import { v2 as cloudinary } from 'cloudinary';
import env from './env';
import logger from '@utils/logger';

// Configure Cloudinary if credentials are provided
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true, // Use HTTPS
  });
  logger.info('Cloudinary configured successfully');
} else {
  logger.warn('Cloudinary credentials not provided, will use local storage for uploads');
}

export default cloudinary;

