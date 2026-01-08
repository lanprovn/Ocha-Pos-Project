import { Request, Response } from 'express';
import uploadService from '@services/upload.service';
import env from '@config/env';
import logger from '@utils/logger';
import { getErrorMessage, isErrorWithMessage } from '@utils/errorHandler';

export class UploadController {
  /**
   * Upload image
   */
  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Không có file được upload' });
        return;
      }

      const result = await uploadService.uploadImage(req.file);
      
      // If result.url is already a full URL (Cloudinary), use it directly
      // Otherwise, prefix with BACKEND_URL for local storage
      const fullUrl = result.url.startsWith('http')
        ? result.url
        : `${env.BACKEND_URL}${result.url}`;

      res.status(201).json({
        message: 'Upload thành công',
        filename: result.filename,
        url: result.url,
        fullUrl,
        size: result.size,
        mimetype: result.mimetype,
      });
    } catch (error: unknown) {
      logger.error('Upload error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        filename: req.file?.filename,
      });
      res.status(500).json({ error: getErrorMessage(error) || 'Lỗi khi upload file' });
    }
  }

  /**
   * Delete image
   */
  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;

      if (!filename) {
        res.status(400).json({ error: 'Tên file không được để trống' });
        return;
      }

      await uploadService.deleteImage(filename);

      res.json({ message: 'Xóa file thành công' });
    } catch (error: unknown) {
      logger.error('Delete error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        filename: req.params.filename,
      });
      const errorMessage = getErrorMessage(error);
      if (errorMessage === 'File không tồn tại' || errorMessage.includes('không tồn tại')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage || 'Lỗi khi xóa file' });
      }
    }
  }

  /**
   * List all uploaded images
   */
  async listImages(_req: Request, res: Response): Promise<void> {
    try {
      const files = uploadService.listFiles();
      const images = files.map((filename) => ({
        filename,
        url: uploadService.getFileUrl(filename),
        fullUrl: `${env.BACKEND_URL}${uploadService.getFileUrl(filename)}`,
      }));

      res.json({ 
        images, 
        count: images.length,
      });
    } catch (error: unknown) {
      logger.error('List images error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.status(500).json({ error: getErrorMessage(error) || 'Lỗi khi lấy danh sách hình ảnh' });
    }
  }
}

export default new UploadController();
