/**
 * Simple Template Engine for Piper Frontend
 * Generates HTML from template definitions
 */

type PageConfig = {
  title?: string;
  currentPage?: string;
  userRole?: string;
  userName?: string;
};

/**
 * Generate the complete HTML page
 */
// deno-lint-ignore no-explicit-any
export function renderPage(config: Partial<PageConfig> = {}): string {
  const defaults: PageConfig = {
    title: "Piper - Pipeline Orchestration",
    currentPage: "home",
    userRole: "",
    userName: "",
  };
  
  const finalConfig: PageConfig = { ...defaults, ...config };
  const { title, currentPage, userRole, userName } = finalConfig;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div id="app">
    <!-- Alert Container -->
    <div id="alert-container"></div>

    <!-- Setup View -->
    <div id="setup-view" class="hidden">
      ${renderSetupView()}
    </div>

    <!-- Login View -->
    <div id="login-view" class="hidden">
      ${renderLoginView()}
    </div>

    <!-- Home View -->
    <div id="home-view" class="hidden">
      ${renderNavbar()}
      ${renderMainContent()}
    </div>
  </div>

  <!-- Create User Modal -->
  ${renderCreateUserModal()}

  <!-- Scripts -->
  <script src="/js/utils.js"><\/script>
  <script src="/js/app.js"><\/script>
</body>
</html>`;
}

/**
 * Render setup view
 */
function renderSetupView(): string {
  return `<div class="page-layout">
    <div class="main-content">
      <div class="container">
        <div class="hero-section">
          <h1>Welcome to Piper</h1>
          <p>Initialize your pipeline orchestration platform</p>
        </div>

        <div style="max-width: 500px; margin: 0 auto;">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">Initial Setup</h2>
            </div>
            <div class="card-body">
              <p>Create your organization and super-admin account to get started.</p>
              <form id="setup-form" onsubmit="handleSetup(event)">
                ${renderFormGroup("setup-org-name", "Organization Name", "text", "e.g., My Company", true)}
                ${renderFormGroup("setup-email", "Super-Admin Email", "email", "admin@example.com", true)}
                ${renderFormGroup("setup-password", "Password", "password", "Min 8 chars, uppercase, lowercase, number, special char", true)}
                ${renderFormGroup("setup-password-confirm", "Confirm Password", "password", "Confirm password", true)}
                <button type="submit" class="btn btn-primary btn-block" id="setup-submit-btn">
                  Initialize System
                </button>
              </form>
              <p class="text-center mt-3" style="font-size: 0.875rem; color: var(--gray-500);">
                Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * Render login view
 */
function renderLoginView(): string {
  return `<div class="page-layout">
    <div class="main-content">
      <div class="container">
        <div class="hero-section">
          <h1>Piper</h1>
          <p>Pipeline Orchestration Platform</p>
        </div>

        <div style="max-width: 400px; margin: 0 auto;">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">Sign In</h2>
            </div>
            <div class="card-body">
              <form id="login-form" onsubmit="handleLogin(event)">
                ${renderFormGroup("login-email", "Email", "email", "user@example.com", true, "email")}
                ${renderFormGroup("login-password", "Password", "password", "Your password", true, "current-password")}
                <button type="submit" class="btn btn-primary btn-block" id="login-submit-btn">
                  Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * Render navbar
 */
function renderNavbar(): string {
  return `<nav class="navbar">
    <div class="navbar-content">
      <div class="navbar-brand">Piper</div>
      <div class="navbar-nav">
        <a href="#" onclick="goToHome(event)">Home</a>
        <a href="#" onclick="goToPipelines(event)">Pipelines</a>
        <a href="#" onclick="goToTeams(event)">Teams</a>
        <a href="#" onclick="goToRunners(event)">Runners</a>
        <a href="#" onclick="goToUsers(event)" id="nav-users" class="hidden">Users</a>
      </div>
      <div class="navbar-user">
        <span id="user-email"></span>
        <div class="user-avatar" id="user-avatar"></div>
        <button class="logout-btn" onclick="handleLogout(event)">Logout</button>
      </div>
    </div>
  </nav>`;
}

/**
 * Render main content area
 */
function renderMainContent(): string {
  return `<div class="main-content">
    <div class="container">
      <!-- Dashboard Page -->
      <div id="page-home">
        ${renderHomePage()}
      </div>

      <!-- Pipelines Page -->
      <div id="page-pipelines" class="hidden">
        ${renderPipelinesPage()}
      </div>

      <!-- Teams Page -->
      <div id="page-teams" class="hidden">
        ${renderTeamsPage()}
      </div>

      <!-- Runners Page -->
      <div id="page-runners" class="hidden">
        ${renderRunnersPage()}
      </div>

      <!-- Users Page -->
      <div id="page-users" class="hidden">
        ${renderUsersPage()}
      </div>
    </div>
  </div>`;
}

/**
 * Render home/dashboard page
 */
function renderHomePage(): string {
  return `<div class="hero-section">
    <h1>Welcome to Piper</h1>
    <p id="org-name"></p>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
    <div class="card">
      <h3>📊 Pipelines</h3>
      <p>Create and manage your CI/CD pipelines</p>
      <button class="btn btn-primary" onclick="goToPipelines(event)">View Pipelines</button>
    </div>

    <div class="card">
      <h3>👥 Teams</h3>
      <p>Organize your pipelines into teams</p>
      <button class="btn btn-primary" onclick="goToTeams(event)">View Teams</button>
    </div>

    <div class="card">
      <h3>🏃 Runners</h3>
      <p>Manage execution runners for your pipelines</p>
      <button class="btn btn-primary" onclick="goToRunners(event)">View Runners</button>
    </div>

    <div class="card" id="card-users" style="display: none;">
      <h3>👤 Users</h3>
      <p>Manage system users and their roles</p>
      <button class="btn btn-primary" onclick="goToUsers(event)">View Users</button>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Quick Start</h2>
    </div>
    <div class="card-body">
      <ol style="margin-left: 1.5rem;">
        <li style="margin-bottom: 1rem;">Create your first pipeline</li>
        <li style="margin-bottom: 1rem;">Add pipeline nodes and configure them</li>
        <li style="margin-bottom: 1rem;">Register a runner to execute your pipelines</li>
        <li style="margin-bottom: 1rem;">Trigger a pipeline run and monitor execution</li>
      </ol>
    </div>
  </div>`;
}

/**
 * Render pipelines page
 */
function renderPipelinesPage(): string {
  return `<h1>Pipelines</h1>
  <div class="mb-3">
    <button class="btn btn-success" onclick="handleCreatePipeline(event)">+ Create Pipeline</button>
  </div>
  <div class="card">
    <p class="text-center" style="color: var(--gray-400); padding: 2rem;">
      Coming soon - Pipeline management
    </p>
  </div>`;
}

/**
 * Render teams page
 */
function renderTeamsPage(): string {
  return `<h1>Teams</h1>
  <div class="mb-3">
    <button class="btn btn-success" onclick="handleCreateTeam(event)">+ Create Team</button>
  </div>
  <div class="card">
    <p class="text-center" style="color: var(--gray-400); padding: 2rem;">
      Coming soon - Team management
    </p>
  </div>`;
}

/**
 * Render runners page
 */
function renderRunnersPage(): string {
  return `<h1>Runners</h1>
  <div class="mb-3">
    <button class="btn btn-success" onclick="handleRegisterRunner(event)">+ Register Runner</button>
  </div>
  <div class="card">
    <p class="text-center" style="color: var(--gray-400); padding: 2rem;">
      Coming soon - Runner management
    </p>
  </div>`;
}

/**
 * Render users page
 */
function renderUsersPage(): string {
  return `<h1>Users</h1>
  <div class="mb-3">
    <button class="btn btn-success" onclick="handleCreateUserModal(event)">+ Create User</button>
  </div>

  <div class="card">
    <div class="table-container">
      <table id="users-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="users-tbody">
        </tbody>
      </table>
    </div>
  </div>`;
}

/**
 * Render create user modal
 */
function renderCreateUserModal(): string {
  return `<div id="create-user-modal" class="hidden" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
  <div class="card" style="max-width: 500px; width: 90%;">
    <div class="card-header">
      <h2 class="card-title">Create User</h2>
    </div>
    <div class="card-body">
      <form id="create-user-form" onsubmit="handleCreateUser(event)">
        ${renderFormGroup("create-user-email", "Email", "email", "user@example.com", true)}
        ${renderFormGroup("create-user-password", "Password", "password", "Password", true)}
        <div class="form-group">
          <label for="create-user-role">Role</label>
          <select id="create-user-role" name="role" required>
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div class="btn-group">
          <button type="submit" class="btn btn-primary" id="create-user-submit-btn">Create User</button>
          <button type="button" class="btn btn-secondary" onclick="closeUserModal()">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</div>`;
}

/**
 * Render form group (label + input)
 */
function renderFormGroup(
  id: string,
  label: string,
  type: string,
  placeholder: string,
  required: boolean,
  autocomplete: string = ""
): string {
  const autocompleteAttr = autocomplete ? ` autocomplete="${autocomplete}"` : "";
  const requiredAttr = required ? " required" : "";

  return `<div class="form-group">
    <label for="${id}">${escapeHtml(label)}</label>
    <input 
      type="${type}" 
      id="${id}" 
      name="${id.replace(/^[^-]+-/, "")}" 
      placeholder="${escapeHtml(placeholder)}"${requiredAttr}${autocompleteAttr}
    >
  </div>`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
