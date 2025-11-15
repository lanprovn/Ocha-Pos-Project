export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'STAFF';
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: 'ADMIN' | 'STAFF';
  isActive?: boolean;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordInput {
  email: string;
  newPassword: string;
}

