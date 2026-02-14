/**
 * Team handlers
 * Endpoints for team management (create, read, update, delete, members)
 */

import { Context } from "hono";
import { TeamService, TeamWithMembers } from "../../database/team-service.ts";
import { UserService } from "../../database/user-service.ts";
import { getAuth } from "../../middleware/auth.ts";
import { ApiResponse } from "../../types/index.ts";

/**
 * List all teams
 * GET /team
 * Accessible to: super-admin, manager
 */
export function listTeams(c: Context): Response {
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

    // Only super-admin and manager can see teams
    if (auth.role !== "super-admin" && auth.role !== "manager") {
      return c.json(
        {
          success: false,
          error: "Only super-admin and manager can access teams",
        } as ApiResponse<null>,
        403
      );
    }

    const teams = TeamService.listTeams();

    return c.json(
      {
        success: true,
        data: teams,
      },
      200
    );
  } catch (error) {
    console.error("List teams error:", error);
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
 * Get team by ID
 * GET /team/:id
 * Accessible to: super-admin, manager
 */
export function getTeam(c: Context): Response {
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

    const teamId = c.req.param("id");

    // Only super-admin and manager can view teams
    if (auth.role !== "super-admin" && auth.role !== "manager") {
      return c.json(
        {
          success: false,
          error: "Only super-admin and manager can access teams",
        } as ApiResponse<null>,
        403
      );
    }

    const team = TeamService.getTeam(teamId);

    if (!team) {
      return c.json(
        {
          success: false,
          error: "Team not found",
        } as ApiResponse<null>,
        404
      );
    }

    return c.json(
      {
        success: true,
        data: team,
      },
      200
    );
  } catch (error) {
    console.error("Get team error:", error);
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
 * Create team
 * POST /team
 * Body: { name, description }
 * Accessible to: super-admin, manager
 */
export async function createTeam(c: Context): Promise<Response> {
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

    // Only super-admin and manager can create teams
    if (auth.role !== "super-admin" && auth.role !== "manager") {
      return c.json(
        {
          success: false,
          error: "Only super-admin and manager can create teams",
        } as ApiResponse<null>,
        403
      );
    }

    const body = await c.req.json();
    const { name, description } = body;

    // Validate input
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return c.json(
        {
          success: false,
          error: "Team name is required and must be a non-empty string",
        } as ApiResponse<null>,
        400
      );
    }

    if (description && typeof description !== "string") {
      return c.json(
        {
          success: false,
          error: "Description must be a string",
        } as ApiResponse<null>,
        400
      );
    }

    const team = TeamService.createTeam(name.trim(), description?.trim());

    return c.json(
      {
        success: true,
        data: team,
      },
      201
    );
  } catch (error) {
    console.error("Create team error:", error);
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
 * Update team
 * PUT /team/:id
 * Body: { name, description }
 * Accessible to: super-admin, manager
 */
export async function updateTeam(c: Context): Promise<Response> {
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

    const teamId = c.req.param("id");

    // Only super-admin and manager can update teams
    if (auth.role !== "super-admin" && auth.role !== "manager") {
      return c.json(
        {
          success: false,
          error: "Only super-admin and manager can update teams",
        } as ApiResponse<null>,
        403
      );
    }

    // Check if team exists
    const existingTeam = TeamService.getTeam(teamId);
    if (!existingTeam) {
      return c.json(
        {
          success: false,
          error: "Team not found",
        } as ApiResponse<null>,
        404
      );
    }

    const body = await c.req.json();
    const { name, description } = body;

    // Validate input
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return c.json(
          {
            success: false,
            error: "Team name must be a non-empty string",
          } as ApiResponse<null>,
          400
        );
      }
    }

    if (description !== undefined && typeof description !== "string") {
      return c.json(
        {
          success: false,
          error: "Description must be a string",
        } as ApiResponse<null>,
        400
      );
    }

    const updatedTeam = TeamService.updateTeam(
      teamId,
      name || existingTeam.name,
      description !== undefined ? description : existingTeam.description
    );

    return c.json(
      {
        success: true,
        data: updatedTeam,
      },
      200
    );
  } catch (error) {
    console.error("Update team error:", error);
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
 * Delete team
 * DELETE /team/:id
 * Accessible to: super-admin, manager
 */
export function deleteTeam(c: Context): Response {
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

    const teamId = c.req.param("id");

    // Only super-admin and manager can delete teams
    if (auth.role !== "super-admin" && auth.role !== "manager") {
      return c.json(
        {
          success: false,
          error: "Only super-admin and manager can delete teams",
        } as ApiResponse<null>,
        403
      );
    }

    // Check if team exists
    const team = TeamService.getTeam(teamId);
    if (!team) {
      return c.json(
        {
          success: false,
          error: "Team not found",
        } as ApiResponse<null>,
        404
      );
    }

    TeamService.deleteTeam(teamId);

    return c.json(
      {
        success: true,
        message: "Team deleted successfully",
      },
      200
    );
  } catch (error) {
    console.error("Delete team error:", error);
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
 * Add member to team
 * POST /team/:id/members
 * Body: { userId, permission }
 * permission: "view" or "edit" (default: "view")
 * Accessible to: super-admin, manager
 */
export async function addTeamMember(c: Context): Promise<Response> {
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

    const teamId = c.req.param("id");

    // Only super-admin and manager can add members
    if (auth.role !== "super-admin" && auth.role !== "manager") {
      return c.json(
        {
          success: false,
          error: "Only super-admin and manager can add team members",
        } as ApiResponse<null>,
        403
      );
    }

    // Check if team exists
    const team = TeamService.getTeam(teamId);
    if (!team) {
      return c.json(
        {
          success: false,
          error: "Team not found",
        } as ApiResponse<null>,
        404
      );
    }

    const body = await c.req.json();
    const { userId, permission } = body;

    // Validate input
    if (!userId || typeof userId !== "string") {
      return c.json(
        {
          success: false,
          error: "User ID is required",
        } as ApiResponse<null>,
        400
      );
    }

    // Check if user exists
    const targetUser = UserService.getUserById(userId);
    if (!targetUser) {
      return c.json(
        {
          success: false,
          error: "User not found",
        } as ApiResponse<null>,
        404
      );
    }

    // Validate permission
    const validPermission = permission === "edit" ? "edit" : "view";

    const member = TeamService.addTeamMember(teamId, userId, validPermission);

    return c.json(
      {
        success: true,
        data: member,
      },
      201
    );
  } catch (error) {
    console.error("Add team member error:", error);
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
 * Remove member from team
 * DELETE /team/:id/members/:userId
 * Accessible to: super-admin, manager
 */
export function removeTeamMember(c: Context): Response {
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

    const teamId = c.req.param("id");
    const userId = c.req.param("userId");

    // Only super-admin and manager can remove members
    if (auth.role !== "super-admin" && auth.role !== "manager") {
      return c.json(
        {
          success: false,
          error: "Only super-admin and manager can remove team members",
        } as ApiResponse<null>,
        403
      );
    }

    // Check if team exists
    const team = TeamService.getTeam(teamId);
    if (!team) {
      return c.json(
        {
          success: false,
          error: "Team not found",
        } as ApiResponse<null>,
        404
      );
    }

    // Check if member exists
    if (!TeamService.isTeamMember(teamId, userId)) {
      return c.json(
        {
          success: false,
          error: "User is not a member of this team",
        } as ApiResponse<null>,
        404
      );
    }

    TeamService.removeTeamMember(teamId, userId);

    return c.json(
      {
        success: true,
        message: "Member removed successfully",
      },
      200
    );
  } catch (error) {
    console.error("Remove team member error:", error);
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
 * Update member permission
 * PUT /team/:id/members/:userId
 * Body: { permission }
 * permission: "view" or "edit"
 * Accessible to: super-admin, manager
 */
export async function updateMemberPermission(c: Context): Promise<Response> {
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

    const teamId = c.req.param("id");
    const userId = c.req.param("userId");

    // Only super-admin and manager can update permissions
    if (auth.role !== "super-admin" && auth.role !== "manager") {
      return c.json(
        {
          success: false,
          error: "Only super-admin and manager can update member permissions",
        } as ApiResponse<null>,
        403
      );
    }

    // Check if team exists
    const team = TeamService.getTeam(teamId);
    if (!team) {
      return c.json(
        {
          success: false,
          error: "Team not found",
        } as ApiResponse<null>,
        404
      );
    }

    // Check if member exists
    if (!TeamService.isTeamMember(teamId, userId)) {
      return c.json(
        {
          success: false,
          error: "User is not a member of this team",
        } as ApiResponse<null>,
        404
      );
    }

    const body = await c.req.json();
    const { permission } = body;

    // Validate permission
    if (!permission || (permission !== "view" && permission !== "edit")) {
      return c.json(
        {
          success: false,
          error: "Permission must be 'view' or 'edit'",
        } as ApiResponse<null>,
        400
      );
    }

    const updatedMember = TeamService.updateMemberPermission(
      teamId,
      userId,
      permission
    );

    return c.json(
      {
        success: true,
        data: updatedMember,
      },
      200
    );
  } catch (error) {
    console.error("Update member permission error:", error);
    return c.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>,
      500
    );
  }
}
