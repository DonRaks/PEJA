import crypto from 'crypto';
import { cookies } from 'next/headers';
import { UserSession } from './types';
import { DEFAULT_TENANT_ID } from './constants';

const SESSION_COOKIE_NAME = 'peja_admin_session';
const SESSION_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Secure secret from environment or fallback consistent hash
const JWT_SECRET = process.env.SESSION_SECRET || 'peja-ventures-secure-cms-secret-key-2026-production';

/**
 * Hash password with PBKDF2 (Native Node.js crypto, zero native add-on vulnerabilities)
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verify password against salt and hash
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const checkHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(checkHash, 'utf-8'), Buffer.from(hash, 'utf-8'));
  } catch {
    return false;
  }
}

interface TokenPayload extends UserSession {
  exp: number;
  iat: number;
}

/**
 * Sign session token
 */
export function signSessionToken(user: UserSession): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    ...user,
    iat: now,
    exp: now + SESSION_EXPIRY_SECONDS,
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifySessionToken(token: string): UserSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature, 'utf-8'), Buffer.from(expectedSig, 'utf-8'))) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      organizationId: payload.organizationId || DEFAULT_TENANT_ID,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieve session from Next.js cookies
 */
export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Set session cookie in Next.js response headers
 */
export async function setSessionCookie(user: UserSession): Promise<string> {
  const token = signSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_EXPIRY_SECONDS,
  });
  return token;
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Default system administrator credentials
export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@pejaventures.ng';
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Peja2026!Studio';
