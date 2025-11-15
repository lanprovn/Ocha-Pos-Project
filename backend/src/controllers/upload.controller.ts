import { Request, Response } from 'express';
import uploadService from '../services/upload.service';
import env from '../config/env';
import { BaseController } from './base.controller';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import { z } from 'zod';
import { ValidationSchemas, validateOrThrow } from '../utils/validation';

const filenameParamSchema = z.object({
  filename: z.string().min(1, 'Tên file không được để trống'),
});

export class UploadController extends BaseController {
  /**
   * Upload image
   */
  uploadImage = this.asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('Không có file được upload.', HTTP_STATUS.BAD_REQUEST);
    }

    const filename = req.file.filename;
    const fileUrl = uploadService.getFileUrl(filename);
    const fullUrl = `${env.BACKEND_URL}${fileUrl}`;

    this.created(res, {
      filename,
      url: fileUrl,
      fullUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
    }, SUCCESS_MESSAGES.FILE_UPLOADED || 'Upload thành công.');
  });

  /**
   * Delete image
   */
  deleteImage = this.asyncHandler(async (req: Request, res: Response) => {
    const { filename } = validateOrThrow(filenameParamSchema, req.params);

    await uploadService.deleteFile(filename);

    this.success(res, null, SUCCESS_MESSAGES.DELETED);
  });

  /**
   * List all uploaded images
   */
  listImages = this.asyncHandler(async (_req: Request, res: Response) => {
    const files = uploadService.listFiles();
    const images = files.map((filename) => ({
      filename,
      url: uploadService.getFileUrl(filename),
      fullUrl: `${env.BACKEND_URL}${uploadService.getFileUrl(filename)}`,
    }));

    this.success(res, { images, count: images.length });
  });
}

export default new UploadController();

