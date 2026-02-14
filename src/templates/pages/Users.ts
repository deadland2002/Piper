/**
 * Users page template
 */
import { renderFormGroup, renderHtmlShell } from "../components/Shared.ts";
import { renderNavbar } from "../components/Navbar.ts";

export function renderUsersPage(): string {
  const pageContent = `<div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h1>Users</h1>
      <button class="btn btn-success" onclick="handleCreateUserModal(event)">+ Create User</button>
    </div>

    <div id="users-table" class="card">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="users-tbody">
            <tr>
              <td colspan="4" style="text-align: center; color: var(--gray-400); padding: 2rem;">Loading users...</td>
            </tr>
          </tbody>
        </table>
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
            ${renderFormGroup("create-user-email", "Email", "email", "user@example.com", true)}
            ${renderFormGroup("create-user-password", "Password", "password", "Password", true)}
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
  </div>`;

  const content = `
    <div id="alert-container"></div>
    ${renderNavbar()}
    <div class="main-content">
      <div class="container">
        ${pageContent}
      </div>
    </div>
  `;
  
  return renderHtmlShell("Piper - Users", content, false);
}
