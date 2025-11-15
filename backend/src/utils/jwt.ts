import jwt from 'jsonwebtoken';
import env from '../config/env';
import { AppError } from './errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type?: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access token (short-lived)
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions
  );
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(payload: JWTPayload): string {
  const refreshSecret = env.JWT_REFRESH_SECRET || env.JWT_SECRET;
  return jwt.sign(
    { ...payload, type: 'refresh' },
    refreshSecret,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions
  );
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  return {
    accessToken: generateToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verify access token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    if (decoded.type && decoded.type !== 'access') {
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    }
    return decoded;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError(ERROR_MESSAGES.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED);
    }
    throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    const refreshSecret = env.JWT_REFRESH_SECRET || env.JWT_SECRET;
    const decoded = jwt.verify(token, refreshSecret) as JWTPayload;
    if (decoded.type && decoded.type !== 'refresh') {
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    }
    return decoded;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError(ERROR_MESSAGES.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED);
    }
    throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
  }
}

