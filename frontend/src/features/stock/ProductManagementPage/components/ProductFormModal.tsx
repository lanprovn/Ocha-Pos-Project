import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useProducts } from '@features/products/hooks/useProducts';
import uploadService from '@features/stock/services/upload.service';
import toast from 'react-hot-toast';
import type { Product, Size, Topping } from '@/types/product';

interface ProductFormModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const productsHook = useProducts();
  const categories = (productsHook && Array.isArray(productsHook.categories)) ? productsHook.categories : [];
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
    discount: '',
    stock: '',
    isAvailable: true,
    isPopular: false,
    tags: [] as string[],
    sizes: [] as Size[],
    toppings: [] as Topping[],
  });

  const [tagInput, setTagInput] = useState('');
  const [sizeInput, setSizeInput] = useState({ name: '', extraPrice: '' });
  const [toppingInput, setToppingInput] = useState({ name: '', extraPrice: '' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product && Array.isArray(categories) && categories.length > 0) {
      // Find category ID from name
      const category = categories.find((c) => c.name === product.category);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: String(product.price || ''),
        categoryId: category?.id ? String(category.id) : '',
        image: product.image || '',
        discount: String(product.discount || ''),
        stock: String(product.stock || ''),
        isAvailable: product.isAvailable !== false,
        isPopular: product.isPopular || false,
        tags: Array.isArray(product.tags) ? product.tags : [],
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        toppings: Array.isArray(product.toppings) ? product.toppings : [],
      });
    } else if (!product) {
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        image: '',
        discount: '',
        stock: '',
        isAvailable: true,
        isPopular: false,
        tags: [],
        sizes: [],
        toppings: [],
      });
    }
  }, [product, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: any = {
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      // Chỉ gửi image nếu có giá trị và không phải empty string
      image: formData.image && formData.image.trim() ? formData.image.trim() : undefined,
      isAvailable: formData.isAvailable,
      isPopular: formData.isPopular,
      tags: formData.tags,
      sizes: formData.sizes,
      toppings: formData.toppings,
    };

    if (formData.categoryId) {
      submitData.categoryId = formData.categoryId;
    }

    if (formData.discount) {
      submitData.discount = parseFloat(formData.discount);
    }

    if (formData.stock) {
      submitData.stock = parseInt(formData.stock, 10);
    }

    onSubmit(submitData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const addSize = () => {
    if (sizeInput.name.trim() && sizeInput.extraPrice) {
      setFormData({
        ...formData,
        sizes: [
          ...formData.sizes,
          { name: sizeInput.name.trim(), extraPrice: parseFloat(sizeInput.extraPrice) },
        ],
      });
      setSizeInput({ name: '', extraPrice: '' });
    }
  };

  const removeSize = (index: number) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index),
    });
  };

  const addTopping = () => {
    if (toppingInput.name.trim() && toppingInput.extraPrice) {
      setFormData({
        ...formData,
        toppings: [
          ...formData.toppings,
          { name: toppingInput.name.trim(), extraPrice: parseFloat(toppingInput.extraPrice) },
        ],
      });
      setToppingInput({ name: '', extraPrice: '' });
    }
  };

  const removeTopping = (index: number) => {
    setFormData({
      ...formData,
      toppings: formData.toppings.filter((_, i) => i !== index),
    });
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ cho phép upload file hình ảnh (JPEG, PNG, WebP, GIF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setIsUploading(true);
      // Upload với folder 'products' để tổ chức tốt hơn trên Cloudinary
      const result = await uploadService.uploadImage(file, 'products');
      
      // Auto-fill image URL with the uploaded image URL
      // Đảm bảo sử dụng fullUrl (đã có http/https prefix)
      const imageUrl = result.fullUrl || result.url;
      if (imageUrl) {
        setFormData({ ...formData, image: imageUrl });
        toast.success('Upload hình ảnh thành công!');
      } else {
        throw new Error('Không nhận được URL hình ảnh từ server');
      }
    } catch (error: any) {
      // Better error handling
      let errorMessage = 'Lỗi khi upload hình ảnh';
      
      // Error message từ axios interceptor đã được transform
      if (error.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes('đăng nhập') || msg.includes('unauthorized') || msg.includes('401')) {
          errorMessage = 'Bạn cần đăng nhập để upload hình ảnh';
        } else if (msg.includes('quyền') || msg.includes('forbidden') || msg.includes('403')) {
          errorMessage = 'Bạn không có quyền upload hình ảnh';
        } else if (msg.includes('không thể kết nối') || msg.includes('network')) {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else if (msg.includes('quá lớn') || msg.includes('413')) {
          errorMessage = 'File quá lớn (tối đa 5MB)';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.error('Upload error:', error);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] my-auto transform transition-all flex flex-col overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[95vh]">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b flex-shrink-0">
              <h3 className="text-lg font-medium text-gray-900">
                {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="bg-white px-6 py-4 flex-1 overflow-y-auto min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="">Chọn danh mục</option>
                      {Array.isArray(categories) && categories.map((cat) => (
                        <option key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hình ảnh sản phẩm
                    </label>
                    <div className="flex flex-row gap-2 items-stretch w-full">
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://example.com/image.jpg hoặc upload từ máy tính"
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        className="hidden"
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        onClick={handleFileSelect}
                        disabled={isUploading}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shrink-0 min-w-[100px]"
                        aria-label="Upload hình ảnh"
                        style={{ display: 'flex' }}
                      >
                        <ArrowUpTrayIcon className="w-5 h-5 shrink-0" />
                        <span className="shrink-0">{isUploading ? 'Đang upload...' : 'Upload'}</span>
                      </button>
                    </div>
                    {formData.image && formData.image.trim() && (
                      <div className="mt-2">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded border border-gray-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            console.error('Failed to load image:', formData.image);
                          }}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {formData.image.includes('cloudinary.com') ? '☁️ Cloudinary' : '📁 Local Storage'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Đang bán</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isPopular}
                        onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Sản phẩm phổ biến</span>
                    </label>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="Nhập tag và nhấn Enter"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Thêm
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sizes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Kích thước</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={sizeInput.name}
                    onChange={(e) => setSizeInput({ ...sizeInput, name: e.target.value })}
                    placeholder="Tên kích thước"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <input
                    type="number"
                    min="0"
                    value={sizeInput.extraPrice}
                    onChange={(e) => setSizeInput({ ...sizeInput, extraPrice: e.target.value })}
                    placeholder="Giá thêm"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Thêm
                  </button>
                </div>
                <div className="space-y-1">
                  {formData.sizes.map((size, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm">
                        {size.name} (+{size.extraPrice.toLocaleString('vi-VN')}đ)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toppings */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Topping</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={toppingInput.name}
                    onChange={(e) => setToppingInput({ ...toppingInput, name: e.target.value })}
                    placeholder="Tên topping"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <input
                    type="number"
                    min="0"
                    value={toppingInput.extraPrice}
                    onChange={(e) => setToppingInput({ ...toppingInput, extraPrice: e.target.value })}
                    placeholder="Giá thêm"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={addTopping}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Thêm
                  </button>
                </div>
                <div className="space-y-1">
                  {formData.toppings.map((topping, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm">
                        {topping.name} (+{topping.extraPrice.toLocaleString('vi-VN')}đ)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTopping(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                {isLoading ? 'Đang lưu...' : product ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProductFormModal;

