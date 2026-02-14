/**
 * Home page template
 */
import { renderNavbar } from "../components/Navbar.ts";
import { renderHtmlShell } from "../components/Shared.ts";

export function renderHomePage(): string {
  const pageContent = `<div class="hero-section">
    <h1>Welcome to Piper</h1>
    <p id="org-name"></p>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
    <div class="card">
      <h3>📊 Pipelines</h3>
      <p>Create and manage your CI/CD pipelines</p>
      <a href="/pipelines" class="btn btn-primary" style="display: inline-block; text-decoration: none;">View Pipelines</a>
    </div>

    <div class="card" id="card-teams">
      <h3>👥 Teams</h3>
      <p>Organize your pipelines into teams</p>
      <a href="/teams" class="btn btn-primary" style="display: inline-block; text-decoration: none;">View Teams</a>
    </div>

    <div class="card">
      <h3>🏃 Runners</h3>
      <p>Manage execution runners for your pipelines</p>
      <a href="/runners" class="btn btn-primary" style="display: inline-block; text-decoration: none;">View Runners</a>
    </div>

    <div class="card" id="card-users" style="display: none;">
      <h3>👤 Users</h3>
      <p>Manage system users and their roles</p>
      <a href="/users" class="btn btn-primary" style="display: inline-block; text-decoration: none;">View Users</a>
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

  const content = `
    <div id="alert-container"></div>
    ${renderNavbar()}
    <div class="main-content">
      <div class="container">
        ${pageContent}
      </div>
    </div>
    <!-- Create User Modal -->
    <div id="create-user-modal" class="modal hidden">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create User</h2>
          <button class="close-btn" onclick="closeUserModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="create-user-form" onsubmit="handleCreateUser(event)">
            <div class="form-group">
              <label for="create-user-email">Email</label>
              <input type="email" id="create-user-email" name="email" placeholder="user@example.com" required />
            </div>
            <div class="form-group">
              <label for="create-user-password">Password</label>
              <input type="password" id="create-user-password" name="password" placeholder="Password" required />
            </div>
            <div class="form-group">
              <label for="create-user-role">Role</label>
              <select id="create-user-role" name="role" required>
                <option value="">Select Role</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
              <button type="submit" class="btn btn-primary" id="create-user-submit-btn">Create User</button>
              <button type="button" class="btn btn-secondary" onclick="closeUserModal()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  
  return renderHtmlShell("Piper - Home", content, false);
}
