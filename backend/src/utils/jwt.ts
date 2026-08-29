import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface UserTokenPayload {
  userId: number;
  email: string;
  role: string;
  planTier: string;
}

export interface RefreshTokenPayload {
  userId: number;
  email: string;
  tokenId: number;
}

// 1 Hour Access Token
export function generateAccessToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '1h',
  });
}

// 30 Days Refresh Token
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
}

export function verifyAccessToken(token: string): UserTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as UserTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
