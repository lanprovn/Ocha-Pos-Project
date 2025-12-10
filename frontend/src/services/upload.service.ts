import apiClient from './api.service';

export interface UploadImageResponse {
  message: string;
  filename: string;
  url: string;
  fullUrl: string;
  size: number;
  mimetype: string;
  storage?: 'cloudinary' | 'local';
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
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const backendBase = baseURL.replace('/api', '');
    return `${backendBase}/uploads/images/${filename}`;
  }
}

export default new UploadService();

