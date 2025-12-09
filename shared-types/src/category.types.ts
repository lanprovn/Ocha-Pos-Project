/**
 * Category related types
 */

import { Timestamped } from './common.types';

// ===== Category (Backend API Response) =====
export interface Category extends Timestamped {
  id: string; // UUID
  name: string;
  image?: string | null;
  description?: string | null;
  icon?: string | null;
  productCount?: number; // Computed field
}

// ===== Category Input Types =====
export interface CreateCategoryInput {
  name: string;
  image?: string;
  description?: string;
  icon?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  image?: string;
  description?: string;
  icon?: string;
}

