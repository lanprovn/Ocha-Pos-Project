import { comparePassword, hashPassword } from '../utils/bcrypt';
import logger from '../utils/logger';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { userRepository } from '../repositories';

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

export class UserService {
  constructor(private repository = userRepository) {}

  /**
   * Get user by ID
   */
  async findById(id: string) {
    const user = await this.repository.findByIdSafe(id);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return user;
  }

  /**
   * Get all users
   */
  async getAll() {
    return this.repository.findAll();
  }

  /**
   * Create new user
   */
  async create(data: CreateUserInput) {
    // Check if email already exists
    const existingUser = await this.repository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await this.repository.create({
      ...data,
      password: hashedPassword,
    });

    logger.info('User created', { userId: user.id, email: user.email, role: user.role });
    return user;
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserInput) {
    // Check if user exists
    const existingUser = await this.repository.findById(id);

    if (!existingUser) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if email already exists (if updating email)
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.repository.findByEmail(data.email);

      if (emailExists) {
        throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
      }
    }

    // Update user
    const user = await this.repository.update(id, data);

    logger.info('User updated', { userId: user.id, email: user.email });
    return user;
  }

  /**
   * Delete user
   */
  async delete(id: string) {
    // Check if user exists
    const existingUser = await this.repository.findById(id);

    if (!existingUser) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Prevent deleting yourself
    // This check will be done in controller using req.user

    // Delete user
    await this.repository.delete(id);

    logger.info('User deleted', { userId: id, email: existingUser.email });
    return { message: 'User deleted successfully' };
  }

  /**
   * Change password
   */
  async changePassword(id: string, data: ChangePasswordInput) {
    // Find user
    const user = await this.repository.findById(id);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Verify current password
    const isPasswordValid = await comparePassword(data.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT, HTTP_STATUS.BAD_REQUEST);
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword);

    // Update password
    await this.repository.updatePassword(id, hashedPassword);

    logger.info('Password changed', { userId: id, email: user.email });
    return { message: 'Password changed successfully' };
  }

  /**
   * Reset password (Admin only)
   */
  async resetPassword(data: ResetPasswordInput) {
    // Find user by email
    const user = await this.repository.findByEmail(data.email);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword);

    // Update password
    await this.repository.updatePassword(user.id, hashedPassword);

    logger.info('Password reset', { userId: user.id, email: user.email });
    return { message: 'Password reset successfully' };
  }
}

export default new UserService();

