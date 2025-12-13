import apiClient from './api.service';
import API_BASE_URL from '../config/api';

export interface UploadImageResponse {
  message: string;
  filename: string;
  url: string;
  fullUrl: string;
  size: number;
  mimetype: string;
}

export interface ListImagesResponse {
  images: Array<{
    filename: string;
    url: string;
    fullUrl: string;
  }>;
  count: number;
}

class UploadService {
  /**
   * Upload image file
   */
  async uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);

    // apiClient đã transform response.data, nên không cần .data
    return apiClient.post<UploadImageResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Delete image
   */
  async deleteImage(filename: string): Promise<void> {
    await apiClient.delete(`/upload/image/${filename}`);
  }

  /**
   * List all uploaded images
   */
  async listImages(): Promise<ListImagesResponse> {
    // apiClient đã transform response.data, nên không cần .data
    return apiClient.get<ListImagesResponse>('/upload/images');
  }

  /**
   * Get image URL
   */
  getImageUrl(filename: string): string {
    // Use the same API_BASE_URL logic from api.ts to ensure consistency
    const backendBase = API_BASE_URL.replace('/api', '');
    return `${backendBase}/uploads/images/${filename}`;
  }
}

export default new UploadService();

