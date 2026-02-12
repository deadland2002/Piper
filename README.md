# Piper

Piper is a **Docker-powered**, **GUI-based pipeline orchestration tool** built with **React + Node.js**, designed to run reusable script-based workflows (Python, JS, Bash, etc.) in isolated containers.

Piper lets you build workflows visually using nodes like **Script**, **Boolean**, **Fork**, **Join**, and more — with **org-based RBAC**, execution history, logs, and artifacts.

---

## Features

### Visual Pipeline Builder
- Drag & drop nodes
- Connect outputs → inputs
- Node configuration panel
- Reusable node templates & groups

### Node Types
Core nodes supported (and planned):
- **Start** (entry point)
- **End** (pipeline completion)
- **Script Node** (any language, 1 input → 1 output)
- **Boolean Node** (1 input → true/false outputs)
- **Fork Node** (1 input → N outputs, parallel execution)
- **Join Node** (N inputs → 1 output, waits for all)
- **Switch Node** (multi-condition routing)
- **Transform/Mapper Node** (JSON mapping without scripting)
- **Retry Node** (retry policy wrapper)
- **Delay Node** (sleep/wait)
- **Error Handler Node** (catch failures & route)
- **HTTP Node** (API call without scripting)
- **Secrets Inject Node**
- **Approval Gate Node**
- **Notification Node**

---

## Architecture

Piper is built with 3 major layers:

### 1) Frontend (React)
Responsible for:
- Pipeline graph builder (canvas)
- Node palette & templates library
- Pipeline editor UI
- Runs dashboard & logs viewer
- Org/group/pipeline access UI (admin + manager)

### 2) Backend API (Node.js)
Responsible for:
- Authentication & RBAC
- Pipeline CRUD + versioning
- Run orchestration
- Secrets management
- Logs & artifacts metadata
- Real-time run events (SSE/WebSocket)

### 3) Execution Worker (Docker)
Responsible for:
- Running scripts inside isolated Docker containers
- Capturing stdout/stderr logs
- Producing JSON output payload
- Storing artifacts (files)

---

## Multi-Tenant RBAC (Org Based)

Piper supports organization-level access control.

### Roles

| Role | Permissions |
|------|------------|
| **Admin** | Full access to all groups + pipelines in org |
| **Manager** | Access to 1+ groups, manages pipelines + assignments |
| **Editor** | View/edit/run assigned pipelines |
| **Viewer** | View assigned pipelines + run history (optional run permission) |

---

## Execution Model

A pipeline is a graph. A pipeline execution creates a **Run**, which creates **Node Runs**.

Each node run has:
- input payload
- output payload
- logs (stdout/stderr)
- start/end time
- status (queued/running/success/fail/skipped)

### Standard Script Node Contract

Scripts receive input as JSON and must output JSON.

- Input: `/workspace/input.json`
- Output: `/workspace/output.json`
- Logs: stdout/stderr captured
- Exit code: `0 = success`, `non-zero = failure`

---

## Tech Stack

### Frontend
- React + TypeScript
- React Flow (graph editor)
- Tailwind CSS

### Backend
- Node.js + TypeScript
- PostgreSQL
- Redis (queue + locks)
- SSE / WebSocket (live updates)

### Execution
- Docker Engine
- Worker process (job consumer)

### Storage
- PostgreSQL (pipelines, RBAC, runs)
- Object storage (artifacts + full logs)

---

## 📦 Monorepo Structure (Suggested)

```txt
piper/
  apps/
    web/                # React frontend
    api/                # Node backend (REST + auth + RBAC)
    worker/             # Execution worker (Docker runner)
  packages/
    shared/             # shared types + validation
  docker/
    runner-images/      # base images / templates
  docs/
    architecture.md
    nodes.md
    rbac.md
  docker-compose.yml
  README.md
