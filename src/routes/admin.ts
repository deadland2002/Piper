import { Hono } from "hono";
import { authMiddleware, requireSuperAdmin } from "../middleware/auth.ts";
import { Context } from "hono";
import { UserService } from "../database/user-service.ts";
import { ApiResponse } from "../types/index.ts";

const adminRoutes = new Hono();

/**
 * Admin routes - Super-admin only user management
 * GET /admin/users - List all users
 * PUT /admin/users/:id/role - Update user role
 * DELETE /admin/users/:id - Delete user
 */

// Apply auth middleware to all routes
adminRoutes.use("*", authMiddleware());
adminRoutes.use("*", requireSuperAdmin());

/**
 * List all users
 * GET /admin/users
 */
adminRoutes.get("/users", (c: Context) => {
  try {
    const users = UserService.listAllUsers();
    return c.json(
      {
        success: true,
        data: users.map((u) => ({
          id: u.id,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
        })),
        message: "Users retrieved successfully",
      },
      200
    );
  } catch (error) {
    console.error("List users error:", error);
    return c.json(
      {
        success: false,
        error: "Failed to retrieve users",
      } as ApiResponse<null>,
      500
    );
  }
});

/**
 * Update user role
 * PUT /admin/users/:id/role
 * Body: { role: "admin" | "user" }
 */
adminRoutes.put("/users/:id/role", async (c: Context) => {
  try {
    const userId = c.req.param("id");
    const body = await c.req.json();
    const { role } = body;

    // Validate role
    if (!["admin", "user"].includes(role)) {
      return c.json(
        {
          success: false,
          error: "Invalid role. Must be 'admin' or 'user'",
        } as ApiResponse<null>,
        400
      );
    }

    // Check user exists
    const user = UserService.getUserById(userId);
    if (!user) {
      return c.json(
        {
          success: false,
          error: "User not found",
        } as ApiResponse<null>,
        404
      );
    }

    // Don't allow demoting last super-admin
    if (user.role === "super-admin" && role !== "super-admin") {
      const superAdminCount = UserService.countUsers("super-admin");
      if (superAdminCount <= 1) {
        return c.json(
          {
            success: false,
            error: "Cannot demote the last super-admin",
          } as ApiResponse<null>,
          400
        );
      }
    }

    UserService.updateRole(userId, role);

    return c.json(
      {
        success: true,
        message: `User role updated to ${role}`,
      },
      200
    );
  } catch (error) {
    console.error("Update role error:", error);
    return c.json(
      {
        success: false,
        error: "Failed to update user role",
      } as ApiResponse<null>,
      500
    );
  }
});

/**
 * Delete user
 * DELETE /admin/users/:id
 */
adminRoutes.delete("/users/:id", (c: Context) => {
  try {
    const userId = c.req.param("id");

    // Don't allow deleting yourself
    const auth = c.get("auth");
    if (auth.userId === userId) {
      return c.json(
        {
          success: false,
          error: "Cannot delete your own account",
        } as ApiResponse<null>,
        400
      );
    }

    // Check user exists
    const user = UserService.getUserById(userId);
    if (!user) {
      return c.json(
        {
          success: false,
          error: "User not found",
        } as ApiResponse<null>,
        404
      );
    }

    // Don't allow deleting last super-admin
    if (user.role === "super-admin") {
      const superAdminCount = UserService.countUsers("super-admin");
      if (superAdminCount <= 1) {
        return c.json(
          {
            success: false,
            error: "Cannot delete the last super-admin",
          } as ApiResponse<null>,
          400
        );
      }
    }

    UserService.deleteUser(userId);

    return c.json(
      {
        success: true,
        message: "User deleted successfully",
      },
      200
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete user",
      } as ApiResponse<null>,
      500
    );
  }
});

export default adminRoutes;
