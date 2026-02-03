"use client";
"use client";
import { useState, useEffect, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'customer_favorites';

/**
 * Hook để quản lý favorites (món yêu thích) của customer
 * Lưu vào localStorage
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  const addFavorite = useCallback((productId: number) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        return prev; // Already favorite
      }
      return [...prev, productId];
    });
  }, []);

  const removeFavorite = useCallback((productId: number) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
  }, []);

  const toggleFavorite = useCallback((productId: number) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  const isFavorite = useCallback((productId: number) => {
    return favorites.includes(productId);
  }, [favorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
};

