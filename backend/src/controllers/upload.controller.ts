import { Request, Response } from 'express';
import uploadService from '../services/upload.service';
import env from '../config/env';
import logger from '../utils/logger';

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
      
      // Prefix with BACKEND_URL for full URL
      const fullUrl = `${env.BACKEND_URL}${result.url}`;

      res.status(201).json({
        message: 'Upload thành công',
        filename: result.filename,
        url: result.url,
        fullUrl,
        size: result.size,
        mimetype: result.mimetype,
      });
    } catch (error: any) {
      logger.error('Upload error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        filename: req.file?.filename,
      });
      res.status(500).json({ error: error.message || 'Lỗi khi upload file' });
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
    } catch (error: any) {
      logger.error('Delete error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        filename: req.params.filename,
      });
      if (error.message === 'File không tồn tại' || error.message.includes('không tồn tại')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message || 'Lỗi khi xóa file' });
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
    } catch (error: any) {
      logger.error('List images error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.status(500).json({ error: error.message || 'Lỗi khi lấy danh sách hình ảnh' });
    }
  }
}

export default new UploadController();
