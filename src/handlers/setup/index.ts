/**
 * Setup handlers for initial instance configuration
 */

import { Context } from "hono";
import { SetupService } from "../../database/setup-service.ts";
import { UserService } from "../../database/user-service.ts";
import {
  hashPassword,
  isValidEmail,
  validatePasswordStrength,
} from "../../utils/crypto.ts";
import { createJWT } from "../../middleware/auth.ts";
import { ApiResponse } from "../../types/index.ts";

/**
 * Check setup status
 * GET /setup/status
 * Public endpoint - no auth required
 */
export function getSetupStatus(c: Context): Response {
  try {
    const status = SetupService.getSetupStatus();

    return c.json(
      {
        success: true,
        data: status,
      },
      200
    );
  } catch (error) {
    console.error("Get setup status error:", error);
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
 * Initialize instance (first-time setup)
 * POST /setup/init
 * Public endpoint - only works if not already initialized
 * Body: { orgName, email, password }
 */
export async function initializeInstance(c: Context): Promise<Response> {
  try {
    // Check if already initialized
    if (SetupService.isInitialized()) {
      return c.json(
        {
          success: false,
          error: "Instance is already initialized",
        } as ApiResponse<null>,
        409
      );
    }

    const body = await c.req.json();
    const { orgName, email, password } = body;

    // Validation
    if (!orgName || orgName.trim().length === 0) {
      return c.json(
        {
          success: false,
          error: "Organization name is required",
        } as ApiResponse<null>,
        400
      );
    }

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

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return c.json(
        {
          success: false,
          error: `Password validation failed: ${passwordValidation.errors.join(", ")}`,
        } as ApiResponse<null>,
        400
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Initialize instance
    const { userId, orgId } = SetupService.initializeInstance(
      orgName.trim(),
      email,
      passwordHash
    );

    // Generate JWT
    const token = createJWT(userId);

    return c.json(
      {
        success: true,
        data: {
          userId,
          orgId,
          email,
          role: "super-admin",
          token,
        },
        message: "Instance initialized successfully with super admin created",
      },
      201
    );
  } catch (error) {
    console.error("Initialize instance error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      } as ApiResponse<null>,
      500
    );
  }
}

/**
 * Create admin user (only super-admin can do this)
 * POST /setup/create-admin
 * Requires: Authentication as super-admin
 * Body: { email, password }
 */
export async function createAdminUser(c: Context): Promise<Response> {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json(
        {
          success: false,
          error: "Authorization required",
        } as ApiResponse<null>,
        401
      );
    }

    // In production, verify JWT token here
    // For now, we'll rely on the auth middleware

    const body = await c.req.json();
    const { email, password, role = "admin" } = body;

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

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return c.json(
        {
          success: false,
          error: `Password validation failed: ${passwordValidation.errors.join(", ")}`,
        } as ApiResponse<null>,
        400
      );
    }

    // Check role
    if (!["admin", "user"].includes(role)) {
      return c.json(
        {
          success: false,
          error: "Invalid role. Must be 'admin' or 'user'",
        } as ApiResponse<null>,
        400
      );
    }

    // Check if user already exists
    const existingUser = UserService.getUserByEmail(email);
    if (existingUser) {
      return c.json(
        {
          success: false,
          error: "User with this email already exists",
        } as ApiResponse<null>,
        409
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = UserService.createUser(email, passwordHash, role);

    return c.json(
      {
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        message: `${role === "admin" ? "Admin" : "User"} created successfully`,
      },
      201
    );
  } catch (error) {
    console.error("Create admin user error:", error);
    return c.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>,
      500
    );
  }
}
