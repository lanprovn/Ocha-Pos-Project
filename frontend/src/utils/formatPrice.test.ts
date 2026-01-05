import { describe, it, expect } from 'vitest';
import { formatPrice, calculateDiscountedPrice, formatRating } from './formatPrice';

describe('formatPrice', () => {
  it('should format price correctly in Vietnamese currency', () => {
    expect(formatPrice(100000)).toBe('100.000 ₫');
    expect(formatPrice(50000)).toBe('50.000 ₫');
    expect(formatPrice(1500000)).toBe('1.500.000 ₫');
  });

  it('should handle zero price', () => {
    expect(formatPrice(0)).toBe('0 ₫');
  });

  it('should handle large numbers', () => {
    expect(formatPrice(10000000)).toBe('10.000.000 ₫');
    expect(formatPrice(999999999)).toBe('999.999.999 ₫');
  });

  it('should handle decimal prices by rounding', () => {
    // VND doesn't have decimals, so it should round
    expect(formatPrice(100000.5)).toBe('100.001 ₫');
    expect(formatPrice(100000.4)).toBe('100.000 ₫');
  });
});

describe('calculateDiscountedPrice', () => {
  it('should calculate discounted price correctly', () => {
    expect(calculateDiscountedPrice(100000, 10)).toBe(90000);
    expect(calculateDiscountedPrice(100000, 20)).toBe(80000);
    expect(calculateDiscountedPrice(100000, 50)).toBe(50000);
  });

  it('should handle 0% discount', () => {
    expect(calculateDiscountedPrice(100000, 0)).toBe(100000);
  });

  it('should handle 100% discount', () => {
    expect(calculateDiscountedPrice(100000, 100)).toBe(0);
  });

  it('should handle negative discount (price increase)', () => {
    expect(calculateDiscountedPrice(100000, -10)).toBe(110000);
  });
});

describe('formatRating', () => {
  it('should format rating to one decimal place', () => {
    expect(formatRating(4.5)).toBe('4.5');
    expect(formatRating(4.75)).toBe('4.8');
    expect(formatRating(5.0)).toBe('5.0');
  });

  it('should handle integer ratings', () => {
    expect(formatRating(5)).toBe('5.0');
    expect(formatRating(4)).toBe('4.0');
  });

  it('should handle low ratings', () => {
    expect(formatRating(1.23)).toBe('1.2');
    expect(formatRating(2.67)).toBe('2.7');
  });
});

