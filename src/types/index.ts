/**
 * Type definitions for Piper application
 * Single-tenant Jenkins-like pipeline orchestration platform
 */

// User types
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: "super-admin" | "admin" | "user";
  createdAt: number;
  updatedAt: number;
}

// Implicit Organization (single-tenant)
export interface Organization {
  id: string;
  name: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
}

// Team/Group types (for organizing pipelines)
export interface Team {
  id: string;
  name: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
}

// Pipeline types
export interface Pipeline {
  id: string;
  teamId: string | null;
  name: string;
  description: string | null;
  status: "draft" | "published";
  draftVersionId: string | null;
  publishedVersionId: string | null;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface PipelineVersion {
  id: string;
  pipelineId: string;
  version: number;
  graph: Record<string, unknown>; // JSONB of node graph
  createdAt: number;
}

// Run types
export interface Run {
  id: string;
  pipelineVersionId: string;
  status: "queued" | "running" | "success" | "failed" | "skipped";
  triggeredBy: string; // userId
  startedAt: number | null;
  completedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface NodeRun {
  id: string;
  runId: string;
  nodeId: string;
  status: "queued" | "running" | "success" | "failed" | "skipped";
  inputPayload: Record<string, unknown> | null;
  outputPayload: Record<string, unknown> | null;
  stdout: string | null;
  stderr: string | null;
  startedAt: number | null;
  completedAt: number | null;
  createdAt: number;
}

// Secret types (platform-level secrets)
export interface Secret {
  id: string;
  name: string;
  encryptedValue: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

// Runner types (Docker/execution runners)
export interface Runner {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "inactive";
  lastHeartbeat: number | null;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface RunnerToken {
  id: string;
  runnerId: string;
  token: string;
  createdAt: number;
  expiresAt: number;
}

// Request/Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthPayload {
  userId: string;
  role: "super-admin" | "admin" | "user";
}

export interface JWTPayload {
  sub: string; // user id
  role: "super-admin" | "admin" | "user";
  iat: number;
  exp: number;
}
