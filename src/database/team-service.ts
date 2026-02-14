/**
 * Team management service
 * Handles team CRUD and team member management with permissions
 */

import { getDatabase } from "./connection.ts";
import { generateId } from "../utils/crypto.ts";

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TeamMember {
  userId: string;
  teamId: string;
  permission: "view" | "edit";
  addedAt: number;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
  memberCount: number;
}

export class TeamService {
  /**
   * Create a new team
   */
  static createTeam(
    name: string,
    description?: string
  ): Team {
    const id = generateId();
    const now = Date.now();
    const db = getDatabase();

    const stmt = db.prepare(
      "INSERT INTO teams (id, name, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)"
    );
    stmt.run(id, name, description || null, now, now);

    return {
      id,
      name,
      description: description || undefined,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get team by ID with members
   */
  static getTeam(teamId: string): TeamWithMembers | null {
    const db = getDatabase();

    const team = db.prepare(
      "SELECT id, name, description, createdAt, updatedAt FROM teams WHERE id = ?"
    ).get(teamId) as unknown as Team | null;

    if (!team) return null;

    const members = db.prepare(
      `SELECT userId, teamId, permission, addedAt FROM teamMembers 
       WHERE teamId = ? ORDER BY addedAt DESC`
    ).all(teamId) as unknown as TeamMember[];

    return {
      ...team,
      members,
      memberCount: members.length,
    };
  }

  /**
   * List all teams with member counts
   */
  static listTeams(): TeamWithMembers[] {
    const db = getDatabase();

    const teams = db.prepare(
      `SELECT id, name, description, createdAt, updatedAt FROM teams 
       ORDER BY updatedAt DESC`
    ).all() as unknown as Team[];

    return teams.map((team) => {
      const members = db.prepare(
        `SELECT userId, teamId, permission, addedAt FROM teamMembers 
         WHERE teamId = ? ORDER BY addedAt DESC`
      ).all(team.id) as unknown as TeamMember[];

      return {
        ...team,
        members,
        memberCount: members.length,
      };
    });
  }

  /**
   * Update team info
   */
  static updateTeam(teamId: string, name: string, description?: string): Team {
    const db = getDatabase();
    const now = Date.now();

    const stmt = db.prepare(
      "UPDATE teams SET name = ?, description = ?, updatedAt = ? WHERE id = ?"
    );
    stmt.run(name, description || null, now, teamId);

    const team = db.prepare(
      "SELECT id, name, description, createdAt, updatedAt FROM teams WHERE id = ?"
    ).get(teamId) as unknown as Team;

    return team;
  }

  /**
   * Delete team (and all team members)
   */
  static deleteTeam(teamId: string): boolean {
    const db = getDatabase();

    // Delete team members first
    db.prepare("DELETE FROM teamMembers WHERE teamId = ?").run(teamId);

    // Delete team
    const stmt = db.prepare("DELETE FROM teams WHERE id = ?");
    stmt.run(teamId);

    return true;
  }

  /**
   * Add member to team
   */
  static addTeamMember(
    teamId: string,
    userId: string,
    permission: "view" | "edit" = "view"
  ): TeamMember {
    const db = getDatabase();
    const now = Date.now();

    // Check if member already exists
    const exists = db.prepare(
      "SELECT userId FROM teamMembers WHERE teamId = ? AND userId = ?"
    ).get(teamId, userId);

    if (exists) {
      // Update permission instead
      const stmt = db.prepare(
        "UPDATE teamMembers SET permission = ? WHERE teamId = ? AND userId = ?"
      );
      stmt.run(permission, teamId, userId);
    } else {
      // Insert new member
      const stmt = db.prepare(
        "INSERT INTO teamMembers (teamId, userId, permission, addedAt) VALUES (?, ?, ?, ?)"
      );
      stmt.run(teamId, userId, permission, now);
    }

    return {
      userId,
      teamId,
      permission,
      addedAt: now,
    };
  }

  /**
   * Remove member from team
   */
  static removeTeamMember(teamId: string, userId: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare(
      "DELETE FROM teamMembers WHERE teamId = ? AND userId = ?"
    );
    stmt.run(teamId, userId);
    return true;
  }

  /**
   * Update member permission
   */
  static updateMemberPermission(
    teamId: string,
    userId: string,
    permission: "view" | "edit"
  ): TeamMember {
    const db = getDatabase();

    const stmt = db.prepare(
      "UPDATE teamMembers SET permission = ? WHERE teamId = ? AND userId = ?"
    );
    stmt.run(permission, teamId, userId);

    const member = db.prepare(
      "SELECT userId, teamId, permission, addedAt FROM teamMembers WHERE teamId = ? AND userId = ?"
    ).get(teamId, userId) as unknown as TeamMember;

    return member;
  }

  /**
   * Get user's teams
   */
  static getUserTeams(userId: string): TeamWithMembers[] {
    const db = getDatabase();

    const teams = db.prepare(
      `SELECT DISTINCT t.id, t.name, t.description, t.createdAt, t.updatedAt 
       FROM teams t
       INNER JOIN teamMembers tm ON t.id = tm.teamId
       WHERE tm.userId = ?
       ORDER BY t.updatedAt DESC`
    ).all(userId) as unknown as Team[];

    return teams.map((team) => {
      const members = db.prepare(
        `SELECT userId, teamId, permission, addedAt FROM teamMembers 
         WHERE teamId = ? ORDER BY addedAt DESC`
      ).all(team.id) as unknown as TeamMember[];

      return {
        ...team,
        members,
        memberCount: members.length,
      };
    });
  }

  /**
   * Check if user is team member
   */
  static isTeamMember(teamId: string, userId: string): boolean {
    const db = getDatabase();
    const result = db.prepare(
      "SELECT userId FROM teamMembers WHERE teamId = ? AND userId = ?"
    ).get(teamId, userId);
    return !!result;
  }

  /**
   * Get user's permission in team
   */
  static getUserPermission(teamId: string, userId: string): "view" | "edit" | null {
    const db = getDatabase();
    const result = db.prepare(
      "SELECT permission FROM teamMembers WHERE teamId = ? AND userId = ?"
    ).get(teamId, userId) as unknown as { permission: string } | null;

    return result ? (result.permission as "view" | "edit") : null;
  }
}
