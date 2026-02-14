/**
 * Team Members page template
 */
import { renderHtmlShell, escapeHtml } from "../components/Shared.ts";
import { renderNavbar } from "../components/Navbar.ts";

export interface TeamMember {
  userId: string;
  teamId: string;
  permission: "view" | "edit";
  addedAt: number;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  members: TeamMember[];
  memberCount: number;
}

export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: number;
  updatedAt: number;
}

export function renderTeamMembersPage(team: Team, users: User[] = []): string {
  const pageContent = `<div>
    <div style="display: flex; align-items: center; margin-bottom: 2rem; gap: 1rem;">
      <a href="/teams" style="color: var(--primary); text-decoration: none; font-size: 0.9rem;">← Teams</a>
      <div>
        <h1 style="margin-bottom: 0.25rem;">${escapeHtml(team.name)}</h1>
        ${team.description ? `<p style="color: var(--gray-600); margin: 0;">${escapeHtml(team.description)}</p>` : ''}
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h2>Team Members (${team.memberCount})</h2>
      <button class="btn btn-success" onclick="handleAddMemberModal(event)">+ Add Member</button>
    </div>

    <div id="members-list" class="card">
      ${team.memberCount === 0
        ? `<p class="text-center" style="color: var(--gray-400); padding: 2rem;">No members in this team yet. Add your first member!</p>`
        : `<div style="padding: 1rem;">${team.members.map(member => {
          const user = users.find(u => u.id === member.userId);
          return `
        <div class="member-item" style="padding: 1rem; border-bottom: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center;">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: var(--gray-900); margin-bottom: 0.25rem;">${escapeHtml(user?.email || 'Unknown User')}</div>
            <div style="color: var(--gray-500); font-size: 0.85rem;">
              Permission: <span style="color: var(--gray-700); font-weight: 500;">${escapeHtml(member.permission)}</span>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-primary" onclick="handleEditMember('${team.id}', '${member.userId}', '${member.permission}')">Edit</button>
            <button class="btn btn-danger" onclick="handleRemoveMember('${team.id}', '${member.userId}', '${escapeHtml(user?.email || 'user')}')">Remove</button>
          </div>
        </div>
      `;
        }).join('')}</div>`
      }
    </div>

    <!-- Add Member Modal -->
    <div id="add-member-modal" class="modal hidden">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add Team Member</h2>
          <button class="close-btn" onclick="closeAddMemberModal(event)">&times;</button>
        </div>
        <div class="modal-body">
          <form id="add-member-form" onsubmit="handleAddMember(event)">
            <input type="hidden" id="team-id" value="${team.id}">
            <div class="form-group">
              <label for="member-user-select">Select User</label>
              <select id="member-user-select" name="userId" required>
                <option value="">-- Select a user --</option>
                ${users.map(user => {
                  const isAlreadyMember = team.members.some(m => m.userId === user.id);
                  return isAlreadyMember ? '' : `<option value="${user.id}">${escapeHtml(user.email)}</option>`;
                }).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="member-permission">Permission</label>
              <select id="member-permission" name="permission" required>
                <option value="view">View Only</option>
                <option value="edit" selected>Edit</option>
              </select>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
              <button type="submit" class="btn btn-primary" id="member-save-btn">Add Member</button>
              <button type="button" class="btn btn-secondary" onclick="closeAddMemberModal(event)">Cancel</button>
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

  return renderHtmlShell("Piper - Team Members", content, false);
}
