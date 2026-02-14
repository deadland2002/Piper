/**
 * Teams page template
 */
import { renderFormGroup, renderHtmlShell } from "../components/Shared.ts";
import { renderNavbar } from "../components/Navbar.ts";

export function renderTeamsPage(): string {
  const pageContent = `<div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h1>Teams</h1>
      <button class="btn btn-success" onclick="handleCreateTeam(event)">+ Create Team</button>
    </div>

    <div id="teams-list" class="card">
      <p class="text-center" style="color: var(--gray-400); padding: 2rem;">
        Loading teams...
      </p>
    </div>

    <!-- Create Team Modal -->
    <div id="create-team-modal" class="modal hidden">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create Team</h2>
          <button class="close-btn" onclick="closeCreateTeamModal(event)">&times;</button>
        </div>
        <div class="modal-body">
          <form id="create-team-form" onsubmit="handleSaveTeam(event)">
            ${renderFormGroup("team-name", "Team Name", "text", "e.g., Backend Team", true)}
            ${renderFormGroup("team-description", "Description", "textarea", "Team description (optional)", false)}
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
              <button type="submit" class="btn btn-primary" id="team-save-btn">Create Team</button>
              <button type="button" class="btn btn-secondary" onclick="closeCreateTeamModal(event)">Cancel</button>
            </div>
          </form>
        </div>
      </div>
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
            <div class="form-group">
              <label for="member-user-select">Select User</label>
              <select id="member-user-select" required>
                <option value="">-- Select a user --</option>
              </select>
            </div>
            <div class="form-group">
              <label for="member-permission">Permission</label>
              <select id="member-permission" required>
                <option value="view">View Only</option>
                <option value="edit">Edit</option>
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
  
  return renderHtmlShell("Piper - Teams", content, false);
}
