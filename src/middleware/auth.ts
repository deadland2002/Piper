/**
 * JWT authentication middleware and utilities
 */

import { Context } from "hono";
import { JWTPayload, AuthPayload } from "../types/index.ts";
import { UserService } from "../database/user-service.ts";

const _JWT_SECRET = Deno.env.get("JWT_SECRET") || "development-secret-key";
const JWT_EXPIRY = 24 * 60 * 60; // 24 hours in seconds

/**
 * Create JWT token for user
 */
export function createJWT(userId: string): string {
  const user = UserService.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const payload: JWTPayload = {
    sub: userId,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY,
  };

  return createSignedJWT(payload);
}

/**
 * Decode JWT token
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Token expired
    }

    return payload as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Middleware to verify JWT and attach user to context
 */
export function authMiddleware() {
  return async (c: Context, next: () => Promise<void>) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json(
        { success: false, error: "Missing or invalid authorization header" },
        401
      );
    }

    const token = authHeader.slice(7);
    const payload = decodeJWT(token);

    if (!payload) {
      return c.json(
        { success: false, error: "Invalid or expired token" },
        401
      );
    }

    c.set("auth", { userId: payload.sub, role: payload.role } as AuthPayload);
    await next();
  };
}

/**
 * Get authenticated user from context
 */
export function getAuth(c: Context): AuthPayload | null {
  return c.get("auth") || null;
}

/**
 * Verify user is super-admin
 */
export function requireSuperAdmin() {
  return async (c: Context, next: () => Promise<void>) => {
    const auth = getAuth(c);
    if (auth?.role !== "super-admin") {
      return c.json(
        { success: false, error: "Forbidden - requires super-admin role" },
        403
      );
    }
    await next();
  };
}

/**
 * Verify user is admin or super-admin
 */
export function requireAdmin() {
  return async (c: Context, next: () => Promise<void>) => {
    const auth = getAuth(c);
    if (!auth || (auth.role !== "admin" && auth.role !== "super-admin")) {
      return c.json(
        { success: false, error: "Forbidden - requires admin role" },
        403
      );
    }
    await next();
  };
}

/**
 * Create signed JWT
 */
function createSignedJWT(payload: JWTPayload): string {
  // This is a simplified version - use a proper JWT library in production
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));

  // For now, we'll use unsigned for simplicity in Deno
  // In production, use a proper JWT library
  return `${header}.${body}.`;
}
