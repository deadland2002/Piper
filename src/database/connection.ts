/**
 * Database initialization and connection management for SQLite3
 * Single-tenant Jenkins-like deployment model
 */

import { Database } from "sqlite";

let db: Database | null = null;

/**
 * Initialize SQLite3 database with schema
 */
export async function initializeDatabase(): Promise<Database> {
  const database = new Database("piper.db");
  
  // Create tables
  database.exec(`
    -- Users table (all users belong to same instance)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    -- Organization table (implicit single organization per deployment)
    CREATE TABLE IF NOT EXISTS organization (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    -- Teams table (for organizing pipelines)
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    -- Pipelines table
    CREATE TABLE IF NOT EXISTS pipelines (
      id TEXT PRIMARY KEY,
      teamId TEXT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      draftVersionId TEXT,
      publishedVersionId TEXT,
      createdBy TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (teamId) REFERENCES teams(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    );

    -- Pipeline versions table (JSONB graph)
    CREATE TABLE IF NOT EXISTS pipelineVersions (
      id TEXT PRIMARY KEY,
      pipelineId TEXT NOT NULL,
      version INTEGER NOT NULL,
      graph TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      UNIQUE(pipelineId, version),
      FOREIGN KEY (pipelineId) REFERENCES pipelines(id)
    );

    -- Runs table (pipeline execution history)
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      pipelineVersionId TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      triggeredBy TEXT NOT NULL,
      startedAt INTEGER,
      completedAt INTEGER,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (pipelineVersionId) REFERENCES pipelineVersions(id),
      FOREIGN KEY (triggeredBy) REFERENCES users(id)
    );

    -- Node runs table (individual node execution)
    CREATE TABLE IF NOT EXISTS nodeRuns (
      id TEXT PRIMARY KEY,
      runId TEXT NOT NULL,
      nodeId TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      inputPayload TEXT,
      outputPayload TEXT,
      stdout TEXT,
      stderr TEXT,
      startedAt INTEGER,
      completedAt INTEGER,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY (runId) REFERENCES runs(id)
    );

    -- Secrets table (platform secrets)
    CREATE TABLE IF NOT EXISTS secrets (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      encryptedValue TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    );

    -- Runners table (Docker execution runners)
    CREATE TABLE IF NOT EXISTS runners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      lastHeartbeat INTEGER,
      createdBy TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    );

    -- Runner tokens table
    CREATE TABLE IF NOT EXISTS runnerTokens (
      id TEXT PRIMARY KEY,
      runnerId TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      createdAt INTEGER NOT NULL,
      expiresAt INTEGER NOT NULL,
      FOREIGN KEY (runnerId) REFERENCES runners(id)
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_pipelines_teamId ON pipelines(teamId);
    CREATE INDEX IF NOT EXISTS idx_pipelines_createdBy ON pipelines(createdBy);
    CREATE INDEX IF NOT EXISTS idx_pipelineVersions_pipelineId ON pipelineVersions(pipelineId);
    CREATE INDEX IF NOT EXISTS idx_runs_pipelineVersionId ON runs(pipelineVersionId);
    CREATE INDEX IF NOT EXISTS idx_runs_triggeredBy ON runs(triggeredBy);
    CREATE INDEX IF NOT EXISTS idx_nodeRuns_runId ON nodeRuns(runId);
    CREATE INDEX IF NOT EXISTS idx_secrets_name ON secrets(name);
    CREATE INDEX IF NOT EXISTS idx_runners_name ON runners(name);
    CREATE INDEX IF NOT EXISTS idx_runnerTokens_token ON runnerTokens(token);
  `);

  db = database;
  return database;
}

/**
 * Get database connection (singleton)
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }
  return db;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
