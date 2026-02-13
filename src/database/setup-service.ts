/**
 * Setup service for initial instance configuration
 * Called once during first deployment
 */

import { getDatabase } from "./connection.ts";
import { generateId } from "../utils/crypto.ts";

export class SetupService {
  /**
   * Check if instance is already initialized
   */
  static isInitialized(): boolean {
    try {
      const db = getDatabase();
      const result = db.prepare(
        "SELECT id FROM organization LIMIT 1"
      ).get();
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * Get super admin count
   */
  static getSuperAdminCount(): number {
    const db = getDatabase();
    const result = db.prepare(
      "SELECT COUNT(*) as count FROM users WHERE role = 'super-admin'"
    ).get() as { count: number };
    return result.count;
  }

  /**
   * Initialize instance with organization and super admin
   */
  static initializeInstance(
    orgName: string,
    adminEmail: string,
    adminPasswordHash: string
  ): { userId: string; orgId: string } {
    const db = getDatabase();

    // Check if already initialized
    if (this.isInitialized()) {
      throw new Error("Instance already initialized");
    }

    const userId = generateId("usr");
    const orgId = generateId("org");
    const now = Date.now();

    try {
      // Create organization
      db.prepare(`
        INSERT INTO organization (id, name, description, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(orgId, orgName, null, now, now);

      // Create super admin user
      db.prepare(`
        INSERT INTO users (id, email, passwordHash, role, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, adminEmail, adminPasswordHash, "super-admin", now, now);

      return { userId, orgId };
    } catch (error) {
      throw new Error(`Failed to initialize instance: ${error}`);
    }
  }

  /**
   * Get setup status
   */
  static getSetupStatus(): {
    initialized: boolean;
    superAdminCount: number;
    orgName?: string;
  } {
    const initialized = this.isInitialized();
    const superAdminCount = this.getSuperAdminCount();

    let orgName: string | undefined;
    if (initialized) {
      const db = getDatabase();
      const org = db.prepare(
        "SELECT name FROM organization LIMIT 1"
      ).get() as { name: string } | undefined;
      orgName = org?.name;
    }

    return {
      initialized,
      superAdminCount,
      orgName,
    };
  }
}
