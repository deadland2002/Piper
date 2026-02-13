/**
 * Database query layer for Users
 */

import { getDatabase } from "./connection.ts";
import { generateId } from "../utils/crypto.ts";
import { User } from "../types/index.ts";

export class UserService {
  /**
   * Create a new user
   */
  static createUser(email: string, passwordHash: string, role: "super-admin" | "admin" | "user" = "user"): User {
    const db = getDatabase();
    const id = generateId("usr");
    const now = Date.now();

    db.prepare(`
      INSERT INTO users (id, email, passwordHash, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, email, passwordHash, role, now, now);

    return {
      id,
      email,
      passwordHash,
      role,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get user by email
   */
  static getUserByEmail(email: string): User | null {
    const db = getDatabase();
    const user = db.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).get(email) as User | undefined;

    return user || null;
  }

  /**
   * Get user by ID
   */
  static getUserById(id: string): User | null {
    const db = getDatabase();
    const user = db.prepare(
      "SELECT * FROM users WHERE id = ?"
    ).get(id) as User | undefined;

    return user || null;
  }

  /**
   * Update user role
   */
  static updateRole(userId: string, role: "super-admin" | "admin" | "user"): User | null {
    const db = getDatabase();
    db.prepare(`
      UPDATE users SET role = ?, updatedAt = ? WHERE id = ?
    `).run(role, Date.now(), userId);

    return this.getUserById(userId);
  }

  /**
   * Update user password
   */
  static updatePassword(userId: string, newPasswordHash: string): void {
    const db = getDatabase();
    db.prepare(`
      UPDATE users SET passwordHash = ?, updatedAt = ? WHERE id = ?
    `).run(newPasswordHash, Date.now(), userId);
  }

  /**
   * Delete user
   */
  static deleteUser(userId: string): void {
    const db = getDatabase();
    db.prepare("DELETE FROM users WHERE id = ?").run(userId);
  }

  /**
   * List all users
   */
  static listAllUsers(): User[] {
    const db = getDatabase();
    const users = db.prepare(
      "SELECT id, email, role, createdAt, updatedAt FROM users ORDER BY createdAt DESC"
    ).all() as User[];

    return users;
  }

  /**
   * List users by role
   */
  static listUsersByRole(role: "super-admin" | "admin" | "user"): User[] {
    const db = getDatabase();
    const users = db.prepare(
      "SELECT id, email, role, createdAt, updatedAt FROM users WHERE role = ? ORDER BY createdAt DESC"
    ).all(role) as User[];

    return users;
  }

  /**
   * Count users
   */
  static countUsers(): number {
    const db = getDatabase();
    const result = db.prepare(
      "SELECT COUNT(*) as count FROM users"
    ).get() as { count: number };

    return result.count;
  }
}
