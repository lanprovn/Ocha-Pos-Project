import { comparePassword } from '../utils/bcrypt';
import { generateTokenPair, verifyRefreshToken, generateToken } from '../utils/jwt';
import logger from '../utils/logger';
import { userRepository } from '../repositories';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export class AuthService {
  constructor(private repository = userRepository) {}

  /**
   * Login user - returns access token and refresh token
   */
  async login(data: LoginInput): Promise<LoginResponse> {
    // Find user by email
    const user = await this.repository.findByEmail(data.email);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError('Tài khoản đã bị vô hiệu hóa.', HTTP_STATUS.FORBIDDEN);
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // Generate token pair (access + refresh)
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info('User logged in', { userId: user.id, email: user.email });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(data: RefreshTokenInput): Promise<RefreshTokenResponse> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(data.refreshToken);

      // Find user to ensure they still exist and are active
      const user = await this.repository.findById(payload.userId);
      
      if (!user) {
        throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      if (!user.isActive) {
        throw new AppError('Tài khoản đã bị vô hiệu hóa.', HTTP_STATUS.FORBIDDEN);
      }

      // Generate new access token
      const accessToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      logger.info('Token refreshed', { userId: user.id, email: user.email });

      return {
        accessToken,
        // Optionally return new refresh token (rotate refresh token)
        // refreshToken: generateRefreshToken({ userId: user.id, email: user.email, role: user.role })
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    }
  }

  /**
   * Get current authenticated user
   */
  async getMe(userId: string) {
    const user = await this.repository.findByIdSafe(userId);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return user;
  }
}

export default new AuthService();

