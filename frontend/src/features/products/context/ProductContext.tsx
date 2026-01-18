import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ProductContextType, Product, Restaurant, Category, DiscountItem } from '@/types/product';
import productsData from '@/assets/products.json';
import { productService, categoryService } from '../services/product.service';
import API_BASE_URL from '@/config/api';

// Toggle này để chuyển đổi giữa mock data và API
// Mặc định dùng API nếu VITE_USE_API không được set hoặc = 'true'
const USE_API = import.meta.env.VITE_USE_API !== 'false';

// Context definition
export const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discountItems, setDiscountItems] = useState<DiscountItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating' | 'popular'>('popular');
  const [isLoading, setIsLoading] = useState(false);

  // Memoize filtered products để tránh re-compute không cần thiết
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(queryLower) ||
        product.restaurant.toLowerCase().includes(queryLower) ||
        product.category.toLowerCase().includes(queryLower) ||
        (product.description || '').toLowerCase().includes(queryLower)
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(product =>
        product.tags && product.tags.some(tag =>
          selectedTags.some(selectedTag =>
            tag.toLowerCase().includes(selectedTag.toLowerCase())
          )
        )
      );
    }

    // Sort products - use toSorted() for immutability
    return filtered.toSorted((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
        default:
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return b.rating - a.rating;
      }
    });
  }, [products, searchQuery, selectedCategory, selectedTags, sortBy]);

  const loadProducts = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (USE_API) {
        // Load from API
        if (import.meta.env.DEV) {
          console.log('Loading products from API...');
        }
        let apiProducts, apiCategories;
        
        try {
          [apiProducts, apiCategories] = await Promise.all([
            productService.getAll(),
            categoryService.getAll(),
          ]);
        } catch (apiError) {
          console.error('API Error:', apiError);
          console.warn('Falling back to mock data due to API error');
          throw apiError; // Re-throw để vào catch block bên dưới
        }

        // Transform API products to match frontend format
        const backendBaseUrl = API_BASE_URL.replace('/api', '');
        const transformedProducts: Product[] = apiProducts.map((p: any) => {
          // Handle image URL: if it's a full URL (external), use it directly
          // If it's a relative path (local storage), prefix with backend URL
          // If it's localhost URL, replace with current backend URL
          // If it's /src/assets path (from seed data), use as is (frontend will handle it)
          let imageUrl = p.image || `${backendBaseUrl}/uploads/images/gallery/default-food.png`;
          
          if (p.image) {
            // Cloudinary URL - use as is (already full URL)
            if (p.image.includes('cloudinary.com') || p.image.startsWith('https://res.cloudinary.com')) {
              imageUrl = p.image;
            }
            // Localhost URL - replace with current backend URL
            else if (p.image.startsWith('http://localhost:') || p.image.startsWith('https://localhost:')) {
              const urlPath = p.image.replace(/^https?:\/\/localhost:\d+/, '');
              imageUrl = `${backendBaseUrl}${urlPath}`;
            }
            // Full URL (external) - use as is
            else if (p.image.startsWith('http://') || p.image.startsWith('https://') || p.image.startsWith('//')) {
              imageUrl = p.image;
            }
            // Frontend asset path (from seed data) - use as is, frontend will resolve it
            else if (p.image.startsWith('/src/assets/') || p.image.startsWith('/img/')) {
              imageUrl = p.image;
            }
            // Relative path (backend uploads) - prefix with backend URL
            else {
              imageUrl = `${backendBaseUrl}${p.image.startsWith('/') ? '' : '/'}${p.image}`;
            }
          }
          
          return {
            id: p.id,
            name: p.name,
            price: p.price,
            image: imageUrl,
            category: typeof p.category === 'string' ? p.category : p.category?.name || 'Unknown',
            restaurant: p.restaurant || 'Ocha Viet',
            rating: p.rating || 0,
            description: p.description || '',
            discount: p.discount || 0,
            isAvailable: p.isAvailable !== false,
            stock: p.stock || 0,
            isPopular: p.isPopular || false,
            tags: p.tags || [],
            sizes: p.sizes || [],
            toppings: p.toppings || [],
          };
        });

        // Transform API categories
        const transformedCategories: Category[] = apiCategories.map((c: any) => ({
          id: c.id,
          name: c.name,
          image: c.image || null,
          description: c.description || '',
          productCount: c.productCount || 0,
          icon: c.icon || 'fas fa-th-large',
        }));

        setProducts(transformedProducts);
        setCategories(transformedCategories);

        // Keep restaurants and discounts from mock data for now
        // (Backend chưa có APIs cho restaurants và discounts)
        const mockRestaurants: Restaurant[] = productsData.restaurants.map((r: any) => ({
          id: r.id,
          name: r.name,
          image: r.image,
          rating: r.rating || 0,
          deliveryTime: r.deliveryTime || '',
          deliveryFee: r.deliveryFee || 0,
          categories: r.categories || [],
        }));

        const mockDiscounts: DiscountItem[] = productsData.discountItems.map((d: any) => ({
          id: d.id,
          name: d.name,
          image: d.image,
          discount: d.discount || 0,
          daysRemaining: d.daysRemaining || 0,
        }));

        setRestaurants(mockRestaurants);
        setDiscountItems(mockDiscounts);
      } else {
        // Load from mock data (fallback)
        const mockProducts: Product[] = productsData.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          category: p.category,
          restaurant: p.restaurant,
          rating: p.rating || 0,
          description: p.description || '',
          discount: p.discount || 0,
          isAvailable: p.stock > 0,
          stock: p.stock || 0,
          isPopular: p.isPopular || false,
          tags: p.tags || [],
          sizes: p.sizes || [],
          toppings: p.toppings || [],
        }));

        const mockCategories: Category[] = productsData.categories.map((c: any) => ({
          id: c.id,
          name: c.name,
          image: c.image,
          description: c.description || '',
          productCount: c.productCount || 0,
          icon: 'fas fa-th-large',
        }));

        const mockRestaurants: Restaurant[] = productsData.restaurants.map((r: any) => ({
          id: r.id,
          name: r.name,
          image: r.image,
          rating: r.rating || 0,
          deliveryTime: r.deliveryTime || '',
          deliveryFee: r.deliveryFee || 0,
          categories: r.categories || [],
        }));

        const mockDiscounts: DiscountItem[] = productsData.discountItems.map((d: any) => ({
          id: d.id,
          name: d.name,
          image: d.image,
          discount: d.discount || 0,
          daysRemaining: d.daysRemaining || 0,
        }));

        setProducts(mockProducts);
        setRestaurants(mockRestaurants);
        setCategories(mockCategories);
        setDiscountItems(mockDiscounts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // ⚠️ FALLBACK TẠM THỜI TẮT ĐỂ TEST
      // Nếu backend tắt, frontend sẽ hiển thị lỗi thay vì dùng mock data
      console.error('❌ Backend không kết nối được! Vui lòng kiểm tra backend.');
      
      // Không load mock data - để test xem frontend có hoạt động đúng không
      setProducts([]);
      setCategories([]);
      setRestaurants([]);
      setDiscountItems([]);
      
      // Có thể hiển thị thông báo lỗi cho user ở đây nếu cần
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load products on mount only if not already loaded
  useEffect(() => {
    // Only load if products and categories are empty (initial load)
    if (products.length === 0 && categories.length === 0) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Memoize context value để tránh re-render không cần thiết
  const value: ProductContextType = useMemo(() => ({
    products,
    restaurants,
    categories,
    discountItems,
    filteredProducts,
    searchQuery,
    selectedCategory,
    selectedTags,
    sortBy,
    isLoading,
    setSearchQuery,
    setSelectedCategory,
    setSelectedTags,
    setSortBy,
    filterProducts: () => {}, // Deprecated, giữ lại để backward compatibility
    loadProducts,
  }), [products, restaurants, categories, discountItems, filteredProducts, searchQuery, selectedCategory, selectedTags, sortBy, isLoading, loadProducts]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

