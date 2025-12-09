/**
 * Category related types
 */
import { Timestamped } from './common.types';
export interface Category extends Timestamped {
    id: string;
    name: string;
    image?: string | null;
    description?: string | null;
    icon?: string | null;
    productCount?: number;
}
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
//# sourceMappingURL=category.types.d.ts.map