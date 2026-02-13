/**
 * Authentication handlers (login)
 * Registration is done during setup
 */

import { Context } from "hono";
import { UserService } from "../../database/user-service.ts";
import {
  verifyPassword,
  isValidEmail,
} from "../../utils/crypto.ts";
import { createJWT } from "../../middleware/auth.ts";
import { ApiResponse } from "../../types/index.ts";

/**
 * Login handler
 * POST /auth/login
 * Body: { email: string, password: string }
 */
export async function login(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return c.json(
        {
          success: false,
          error: "Email and password are required",
        } as ApiResponse<null>,
        400
      );
    }

    if (!isValidEmail(email)) {
      return c.json(
        {
          success: false,
          error: "Invalid email format",
        } as ApiResponse<null>,
        400
      );
    }

    // Find user
    const user = UserService.getUserByEmail(email);
    if (!user) {
      return c.json(
        {
          success: false,
          error: "Invalid email or password",
        } as ApiResponse<null>,
        401
      );
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return c.json(
        {
          success: false,
          error: "Invalid email or password",
        } as ApiResponse<null>,
        401
      );
    }

    // Generate JWT
    const token = createJWT(user.id);

    return c.json(
      {
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          role: user.role,
          token,
        },
        message: "Login successful",
      },
      200
    );
  } catch (error) {
    console.error("Login error:", error);
    return c.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>,
      500
    );
  }
}

/**
 * Logout handler
 * POST /auth/logout
 * Note: In a real app, you might want to blacklist tokens
 */
export function logout(c: Context): Response {
  return c.json(
    {
      success: true,
      message: "Logout successful",
    },
    200
  );
}
