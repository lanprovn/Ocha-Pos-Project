/**
 * User related types
 */

import { UUID, Timestamped, PaginationParams } from './common';
import { UserRole } from './enums';

// ===== User =====

export interface User extends Timestamped {
    id: UUID;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
}

// ===== User Input Types =====

export interface CreateUserInput {
    email: string;
    password: string;
    name: string;
    role: UserRole;
}

export interface UpdateUserInput {
    name?: string;
    email?: string;
    role?: UserRole;
    isActive?: boolean;
}

export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}

// ===== User Filters =====

export interface UserFilters extends PaginationParams {
    search?: string;
    role?: UserRole;
    isActive?: boolean;
}

// ===== Auth Types =====

export interface LoginInput {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: Omit<User, 'password'>;
    token: string;
    expiresIn: string;
}

export interface AuthUser extends Omit<User, 'createdAt' | 'updatedAt'> {
    iat?: number;
    exp?: number;
}
