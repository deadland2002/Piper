# Piper - Single-Tenant Architecture (Refactored)

## Overview

Piper is now architected as a **single-tenant, self-hosted pipeline orchestration system** similar to Jenkins. Each organization deploys their own instance, eliminating the need for multi-tenant routing and organization management endpoints.

## Deployment Model

### Single-Tenant Architecture
- **One instance per organization** - Each organization/team runs their own Piper deployment
- **No multi-org routing** - All users in a deployment belong to the implicit single organization
- **Self-contained database** - Each instance has its own SQLite3 database

### Initial Setup Flow
```
1. Deploy Piper instance
2. Call /setup/init (public) - Creates implicit organization + super-admin
3. Super-admin logs in to dashboard
4. Super-admin creates additional admin and user accounts
```

## Role Hierarchy

### Three-Tier Role System
```
super-admin
    ↓
admin (instance-level admin)
    ↓
user (basic user)
```

### Permissions

| Action | Super-Admin | Admin | User |
|--------|-------------|-------|------|
| Create/Delete Users | ✅ | ❌ | ❌ |
| Change User Roles | ✅ | ❌ | ❌ |
| Create Pipelines | ✅ | ✅ | ✅ |
| Create Teams | ✅ | ✅ | ✅ |
| Manage Secrets | ✅ | ✅ | ✅ |
| Trigger Runs | ✅ | ✅ | ✅ |
| Manage Runners | ✅ | ✅ | ❌ |
| View System Logs | ✅ | ✅ | ❌ |

## Database Schema

### Tables

#### 1. **users**
```sql
- id: TEXT PRIMARY KEY (usr_*)
- email: TEXT UNIQUE NOT NULL
- passwordHash: TEXT NOT NULL
- role: "super-admin" | "admin" | "user"
- createdAt: DATETIME
- updatedAt: DATETIME
```

#### 2. **organization** (Implicit, Single)
```sql
- id: TEXT PRIMARY KEY (org_*)
- name: TEXT NOT NULL
- description: TEXT
- createdAt: DATETIME
- updatedAt: DATETIME
```

#### 3. **teams** (Optional Pipeline Organization)
```sql
- id: TEXT PRIMARY KEY (team_*)
- name: TEXT NOT NULL
- description: TEXT
- createdAt: DATETIME
- updatedAt: DATETIME
```

#### 4. **pipelines**
```sql
- id: TEXT PRIMARY KEY (pip_*)
- teamId: TEXT (OPTIONAL - nullable for ungrouped pipelines)
- name: TEXT NOT NULL
- description: TEXT
- status: "draft" | "published" | "archived"
- createdBy: TEXT (user id)
- createdAt: DATETIME
- updatedAt: DATETIME
- FOREIGN KEY: teamId → teams.id
- FOREIGN KEY: createdBy → users.id
```

#### 5. **pipelineVersions**
```sql
- id: TEXT PRIMARY KEY (ver_*)
- pipelineId: TEXT NOT NULL
- versionNumber: INT
- nodes: JSON (pipeline nodes)
- published: BOOLEAN
- createdBy: TEXT
- createdAt: DATETIME
- FOREIGN KEY: pipelineId → pipelines.id
- FOREIGN KEY: createdBy → users.id
```

#### 6. **runs**
```sql
- id: TEXT PRIMARY KEY (run_*)
- pipelineVersionId: TEXT NOT NULL
- status: "pending" | "running" | "success" | "failed" | "cancelled"
- triggeredBy: TEXT (user id)
- startedAt: DATETIME
- completedAt: DATETIME
- createdAt: DATETIME
- FOREIGN KEY: pipelineVersionId → pipelineVersions.id
- FOREIGN KEY: triggeredBy → users.id
```

#### 7. **nodeRuns**
```sql
- id: TEXT PRIMARY KEY (nrun_*)
- runId: TEXT NOT NULL
- nodeId: TEXT
- status: "pending" | "running" | "success" | "failed"
- startedAt: DATETIME
- completedAt: DATETIME
- logs: TEXT
- payloads: JSON
- FOREIGN KEY: runId → runs.id
```

#### 8. **secrets**
```sql
- id: TEXT PRIMARY KEY (sec_*)
- name: TEXT NOT NULL UNIQUE
- encryptedValue: TEXT NOT NULL
- createdBy: TEXT
- createdAt: DATETIME
- FOREIGN KEY: createdBy → users.id
```

#### 9. **runners**
```sql
- id: TEXT PRIMARY KEY (run_*)
- name: TEXT NOT NULL UNIQUE
- description: TEXT
- status: "active" | "inactive" | "error"
- createdBy: TEXT
- createdAt: DATETIME
- updatedAt: DATETIME
- FOREIGN KEY: createdBy → users.id
```

#### 10. **runnerTokens**
```sql
- id: TEXT PRIMARY KEY (tok_*)
- runnerId: TEXT NOT NULL
- token: TEXT NOT NULL UNIQUE
- lastUsed: DATETIME
- createdAt: DATETIME
- FOREIGN KEY: runnerId → runners.id
```

### Indexes (Performance Optimization)
```sql
- users(email)
- pipelines(teamId)
- pipelines(createdBy)
- pipelineVersions(pipelineId)
- pipelineVersions(createdBy)
- runs(pipelineVersionId)
- runs(triggeredBy)
- nodeRuns(runId)
- secrets(name)
- secrets(createdBy)
- runners(createdBy)
- runnerTokens(runnerId)
```

## API Endpoints

### Setup (Public)
```
GET    /setup/status         - Check if instance is initialized
POST   /setup/init           - Initialize instance (create org + super-admin)
POST   /setup/create-admin   - Create admin/user accounts (protected)
```

### Authentication
```
POST   /auth/login           - Login user (returns JWT)
POST   /auth/logout          - Logout user
```

### Admin (Super-Admin Only)
```
GET    /admin/users          - List all users
PUT    /admin/users/:id/role - Update user role
DELETE /admin/users/:id      - Delete user
```

### Teams (Admin+)
```
POST   /teams                - Create team
GET    /teams                - List teams
GET    /teams/:id            - Get team details
PUT    /teams/:id            - Update team
DELETE /teams/:id            - Delete team
```

### Pipelines (Admin+)
```
POST   /pipelines            - Create pipeline (draft)
GET    /pipelines            - List pipelines
GET    /pipelines/:id        - Get pipeline details
PUT    /pipelines/:id        - Update draft pipeline
DELETE /pipelines/:id        - Delete pipeline
POST   /pipelines/:id/publish - Publish pipeline version
GET    /pipelines/:id/versions - List pipeline versions
```

### Runs (All Users)
```
POST   /runs                 - Trigger pipeline run
GET    /runs                 - List runs
GET    /runs/:id             - Get run details/logs
POST   /runs/:id/cancel      - Cancel running execution
GET    /runs/:id/nodes       - Get node execution details
```

### Secrets (Admin+)
```
POST   /secrets              - Create secret
GET    /secrets              - List secrets (names only, no values)
DELETE /secrets/:id          - Delete secret
PUT    /secrets/:id          - Update secret value
```

### Runners (Admin+)
```
POST   /runners              - Register new runner
GET    /runners              - List runners
GET    /runners/:id          - Get runner details
POST   /runners/:id/token    - Generate auth token for runner
DELETE /runners/:id          - Deregister runner
PUT    /runners/:id/status   - Update runner status
```

## Security Features

### Authentication
- **JWT Tokens** - 24-hour expiration, includes role information
- **Password Hashing** - SHA-256 (upgradeable to bcrypt)
- **Email Validation** - RFC 5322 regex validation
- **Password Strength** - Minimum 8 chars, uppercase, lowercase, number, special char

### Authorization
- **Role-Based Access Control** - Super-admin, admin, user roles
- **Middleware-Based Protection** - All protected endpoints require valid JWT
- **Super-Admin Safeguards** - Cannot demote last super-admin, cannot delete yourself

### Data Protection
- **Encrypted Secrets** - Platform secrets stored encrypted
- **No Password Leakage** - Password hashes never returned in API responses
- **Token-Based Runner Auth** - Runners authenticate with tokens, not passwords

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Deno | 1.40+ |
| Framework | Hono | 4.11.9 |
| Database | SQLite3 | Latest |
| Language | TypeScript | 5.0+ |
| Authentication | JWT | HS256 |

## Project Structure

```
src/
├── database/
│   ├── connection.ts         # SQLite3 setup & schema
│   ├── user-service.ts       # User CRUD operations
│   ├── setup-service.ts      # Instance initialization
│   └── [future-services]     # Pipelines, runs, secrets, etc.
├── handlers/
│   ├── auth/
│   │   └── index.ts          # Login/logout handlers
│   ├── setup/
│   │   └── index.ts          # Setup handlers
│   └── [future-handlers]     # Business logic for other features
├── middleware/
│   └── auth.ts               # JWT & RBAC middleware
├── routes/
│   ├── index.ts              # Main router
│   ├── auth.ts               # Auth endpoints
│   ├── setup.ts              # Setup endpoints
│   ├── admin.ts              # Admin endpoints
│   └── [future-routes]       # Team, pipeline, run, secret, runner routes
├── types/
│   └── index.ts              # TypeScript interfaces
├── utils/
│   └── crypto.ts             # Password hashing, JWT, ID generation
└── main.ts                   # Application entry point
```

## Development Workflow

### Setup Development Environment
```bash
# Clone repository
git clone <repo-url>
cd Piper

# Install dependencies (Deno)
deno cache deno.json

# Configure environment
echo "JWT_SECRET=your-dev-secret" > .env
echo "PORT=3000" >> .env

# Start development server
deno task dev
```

### Testing Setup Flow
```bash
# 1. Check initialization status
curl http://localhost:3000/api/setup/status

# 2. Initialize instance
curl -X POST http://localhost:3000/api/setup/init \
  -H "Content-Type: application/json" \
  -d '{
    "orgName": "My Organization",
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }'

# 3. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }'

# 4. Use token for protected requests
TOKEN="<from-login-response>"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/users
```

## Next Steps

1. **Implement Pipeline Management** (7 endpoints)
   - Create/Read/Update/Delete pipelines
   - Manage pipeline versions
   - Publish pipelines

2. **Implement Run Management** (5 endpoints)
   - Trigger pipeline executions
   - Monitor run status
   - Stream execution logs

3. **Implement Team Management** (5 endpoints)
   - Create teams for organizing pipelines
   - Manage team memberships
   - Set team-level permissions

4. **Implement Secret Management** (4 endpoints)
   - Create platform secrets
   - Manage secret lifecycle
   - Inject secrets into pipeline context

5. **Implement Runner Management** (4 endpoints)
   - Register execution runners
   - Generate runner tokens
   - Monitor runner health

6. **Build Frontend UI**
   - Dashboard
   - Pipeline editor
   - Run monitoring
   - User management

7. **Worker System**
   - Runner execution engine
   - Log aggregation
   - Result handling

## Migration from Multi-Tenant

### What Changed
- ❌ **Removed**: Multi-tenant organization routing, membership management, org-level permissions
- ✅ **Added**: Setup endpoint for one-time initialization, implicit organization per deployment
- ✅ **Simplified**: User management, secret storage, role hierarchy

### Breaking Changes
- API responses no longer include `orgId` or `orgName` fields
- Registration endpoint removed (use `/setup/create-admin` instead)
- Organization management endpoints removed

### Data Migration
- If migrating existing data, the `orgId` field can be ignored
- All users belong to the implicit organization created during `/setup/init`

## Monitoring & Logging

### Database Performance
- SQLite3 with 12 optimized indexes
- Connection pooling via singleton pattern
- Query logging available in development mode

### Security Auditing
- All user modifications logged (create, delete, role change)
- Failed login attempts tracked
- Runner token generation audited

## Production Deployment

### Configuration
```env
JWT_SECRET=<32-char-random-string>
PORT=3000
ENVIRONMENT=production
DATABASE_PATH=/data/piper.db
LOG_LEVEL=info
```

### Docker Deployment
```dockerfile
FROM denoland/deno:latest
WORKDIR /app
COPY . .
RUN deno cache main.ts
EXPOSE 3000
CMD ["deno", "run", "--allow-all", "main.ts"]
```

### Health Checks
```bash
# Check instance status
GET /setup/status

# Response when initialized:
{
  "initialized": true,
  "superAdminCount": 1,
  "orgName": "My Organization"
}
```

## Troubleshooting

### Instance Won't Initialize
- Check `${pwd}/piper.db` exists and is writable
- Verify JWT_SECRET environment variable is set
- Check database connection logs

### JWT Token Invalid
- Verify token not expired (24-hour window)
- Check Authorization header format: `Bearer <token>`
- Ensure JWT_SECRET matches between encode/decode

### Role Permission Denied
- Verify user role with `/admin/users` endpoint
- Check middleware is applied in correct order
- Ensure JWT payload includes role field
