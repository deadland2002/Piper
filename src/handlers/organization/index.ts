/**
 * Organization handlers
 */

import { Context } from "hono";
import { OrganizationService } from "../../database/organization-service.ts";
import { generateId } from "../../utils/crypto.ts";
import { getAuth } from "../../middleware/auth.ts";
import { ApiResponse } from "../../types/index.ts";

/**
 * Create organization
 * POST /org
 * Body: { name: string, description?: string }
 * Requires: Authentication
 */
export async function createOrganization(c: Context): Promise<Response> {
  try {
    const auth = getAuth(c);
    if (!auth) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
        } as ApiResponse<null>,
        401
      );
    }

    const body = await c.req.json();
    const { name, description } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return c.json(
        {
          success: false,
          error: "Organization name is required",
        } as ApiResponse<null>,
        400
      );
    }

    if (name.length > 100) {
      return c.json(
        {
          success: false,
          error: "Organization name must be less than 100 characters",
        } as ApiResponse<null>,
        400
      );
    }

    // Create organization
    const orgId = generateId("org");
    const org = OrganizationService.createOrganization(
      orgId,
      name.trim(),
      description || null,
      auth.userId
    );

    return c.json(
      {
        success: true,
        data: org,
        message: "Organization created successfully",
      },
      201
    );
  } catch (error) {
    console.error("Create organization error:", error);
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
 * Get organization
 * GET /org/:id
 * Requires: Authentication, Membership
 */
export function getOrganization(c: Context): Response {
  try {
    const auth = getAuth(c);
    if (!auth) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
        } as ApiResponse<null>,
        401
      );
    }

    const orgId = c.req.param("id");

    // Check membership
    const isMember = OrganizationService.isMember(orgId, auth.userId);
    if (!isMember) {
      return c.json(
        {
          success: false,
          error: "Access denied",
        } as ApiResponse<null>,
        403
      );
    }

    const org = OrganizationService.getOrganizationById(orgId);
    if (!org) {
      return c.json(
        {
          success: false,
          error: "Organization not found",
        } as ApiResponse<null>,
        404
      );
    }

    return c.json(
      {
        success: true,
        data: org,
      },
      200
    );
  } catch (error) {
    console.error("Get organization error:", error);
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
 * List user's organizations
 * GET /org
 * Requires: Authentication
 */
export function listOrganizations(c: Context): Response {
  try {
    const auth = getAuth(c);
    if (!auth) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
        } as ApiResponse<null>,
        401
      );
    }

    const orgs = OrganizationService.getUserOrganizations(auth.userId);

    return c.json(
      {
        success: true,
        data: orgs,
      },
      200
    );
  } catch (error) {
    console.error("List organizations error:", error);
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
 * Update organization
 * PUT /org/:id
 * Body: { name?: string, description?: string }
 * Requires: Authentication, Admin role
 */
export async function updateOrganization(c: Context): Promise<Response> {
  try {
    const auth = getAuth(c);
    if (!auth) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
        } as ApiResponse<null>,
        401
      );
    }

    const orgId = c.req.param("id");

    // Check if admin
    const role = OrganizationService.getMemberRole(orgId, auth.userId);
    if (role !== "admin") {
      return c.json(
        {
          success: false,
          error: "You must be an admin to update this organization",
        } as ApiResponse<null>,
        403
      );
    }

    const body = await c.req.json();
    const { name, description } = body;

    // Validate
    if (name && name.length > 100) {
      return c.json(
        {
          success: false,
          error: "Organization name must be less than 100 characters",
        } as ApiResponse<null>,
        400
      );
    }

    const org = OrganizationService.updateOrganization(
      orgId,
      name || undefined,
      description ?? undefined
    );

    if (!org) {
      return c.json(
        {
          success: false,
          error: "Organization not found",
        } as ApiResponse<null>,
        404
      );
    }

    return c.json(
      {
        success: true,
        data: org,
        message: "Organization updated successfully",
      },
      200
    );
  } catch (error) {
    console.error("Update organization error:", error);
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
 * Delete organization
 * DELETE /org/:id
 * Requires: Authentication, Owner
 */
export function deleteOrganization(c: Context): Response {
  try {
    const auth = getAuth(c);
    if (!auth) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
        } as ApiResponse<null>,
        401
      );
    }

    const orgId = c.req.param("id");
    const org = OrganizationService.getOrganizationById(orgId);

    if (!org) {
      return c.json(
        {
          success: false,
          error: "Organization not found",
        } as ApiResponse<null>,
        404
      );
    }

    // Only owner can delete
    if (org.ownerId !== auth.userId) {
      return c.json(
        {
          success: false,
          error: "Only owner can delete organization",
        } as ApiResponse<null>,
        403
      );
    }

    OrganizationService.deleteOrganization(orgId);

    return c.json(
      {
        success: true,
        message: "Organization deleted successfully",
      },
      200
    );
  } catch (error) {
    console.error("Delete organization error:", error);
    return c.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>,
      500
    );
  }
}
