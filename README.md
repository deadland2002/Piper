# Piper — Complete Project Document (Roles, Access, and Execution Flow)

Piper is a **Docker-powered**, **GUI-based pipeline orchestration tool** built with **React + Node.js**, where pipelines are built visually as node graphs and executed securely inside Docker containers.

This document defines:
- Roles and access control (RBAC)
- Runner (service account) design
- Pipeline lifecycle (draft → publish → run)
- Execution flow and system architecture
- Trigger methods (UI + external API)

---

## 1) Core Concepts

### 1.1 Organization (Org)
Piper is multi-tenant. Every resource belongs to an Organization:
- Users
- Groups
- Pipelines
- Templates
- Runs
- Secrets
- Runners

### 1.2 Group
A group is a logical container inside an org.
- Pipelines belong to a group
- Managers manage groups
- Admin has access to all groups

### 1.3 Pipeline
A pipeline is a node graph representing a workflow.
- Pipelines are versioned
- Draft can be edited
- Published versions are executed

### 1.4 Pipeline Version
A snapshot of the pipeline graph.
- Stored in PostgreSQL as JSONB
- Used as the source of truth for executions
- Runs always reference a pipeline version

### 1.5 Run
A run is a single execution of a pipeline version.
- Contains status + timestamps
- Contains per-node execution records
- Stores logs and artifacts metadata

### 1.6 Node Run
Represents the execution of one node during a run.
- Status: queued/running/success/failed/skipped
- Input payload + output payload
- stdout/stderr logs
- artifacts metadata

---

## 2) System Architecture

Piper consists of 3 major components:

### 2.1 Frontend (React)
Responsibilities:
- Pipeline builder UI (`@xyflow/react`)
- Node configuration UI
- Pipeline version management UI
- Run history UI
- Run detail view (graph + node statuses)
- Logs viewer
- RBAC + org/group/pipeline management UI
- Runner management UI

### 2.2 Backend API (Node.js)
Responsibilities:
- Authentication (JWT)
- Authorization (RBAC + ACL enforcement)
- Pipeline CRUD + versioning
- Runner token authentication
- Run creation + orchestration metadata
- Secrets management
- Run event streaming (SSE)
- Audit logging

### 2.3 Worker (Node.js + Docker)
Responsibilities:
- Consume run jobs from queue (BullMQ)
- Execute pipeline graph nodes
- Execute Script nodes in Docker
- Capture logs
- Persist node run results in PostgreSQL
- Update pipeline run status

---

## 3) Storage (PostgreSQL)

PostgreSQL is the single source of truth.

Stored in Postgres:
- Org + users + memberships
- Groups + memberships
- Pipelines + versions
- Pipeline graph JSONB
- ACL permissions
- Runs + node runs
- Secrets (encrypted)
- Runners + runner tokens
- Audit logs

### Pipeline Graph Storage Format (JSONB)

Compatible with `@xyflow/react`:

```ts
type StoredGraph = {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, any>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
};
