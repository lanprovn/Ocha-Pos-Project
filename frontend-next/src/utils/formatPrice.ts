/**
 * Format price to Vietnamese currency string
 * @param price - The price number to format
 * @returns Formatted price string in Vietnamese format
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price); // Price is already in VND
};

/**
 * Calculate discounted price
 * @param originalPrice - Original price
 * @param discountPercent - Discount percentage
 * @returns Discounted price
 */
export const calculateDiscountedPrice = (originalPrice: number, discountPercent: number): number => {
  return originalPrice * (1 - discountPercent / 100);
};

/**
 * Format rating to display string
 * @param rating - Rating number
 * @returns Formatted rating string
 */
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};
