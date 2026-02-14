let setupStatus = { initialized: false };

async function initializeApp() {
  try {
    setupStatus = await authService.checkSetupStatus();

    if (!setupStatus.initialized) {
      // Show setup page
      document.body.innerHTML = '<p>Redirecting to setup...</p>';
      window.location.href = '/setup';
    } else if (!authService.isAuthenticated()) {
      // Show login page
      document.body.innerHTML = '<p>Redirecting to login...</p>';
      window.location.href = '/login';
    } else {
      // User is authenticated, navbar should handle visibility
      updateNavbar();
    }
  } catch (error) {
    console.error('App initialization error:', error);
    UIUtil.showAlert('Failed to initialize app', 'error');
  }
}

function updateNavbar() {
  const user = authService.getUser();
  if (user) {
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-avatar').textContent = getUserInitials(user.email);

    const isAdmin = authService.isAdmin();
    const isManager = user.role === 'manager';

    if (isAdmin) {
      UIUtil.show('nav-users');
      UIUtil.show('card-users');
    } else {
      UIUtil.hide('nav-users');
      UIUtil.hide('card-users');
    }

    // Only super-admin and manager can see and access teams
    if (isAdmin || isManager) {
      UIUtil.show('nav-teams');
      UIUtil.show('card-teams');
    } else {
      UIUtil.hide('nav-teams');
      UIUtil.hide('card-teams');
    }
  }
}

async function handleSetup(event) {
  event.preventDefault();

  const formData = new FormData(document.getElementById('setup-form'));
  const orgName = formData.get('org-name');
  const email = formData.get('email');
  const password = formData.get('password');
  const passwordConfirm = formData.get('password-confirm');

  console.log("Setup form data:", { orgName, email, password, passwordConfirm });

  if (password !== passwordConfirm) {
    UIUtil.showAlert('Passwords do not match', 'error');
    return;
  }

  if (!validatePasswordStrength(password)) {
    UIUtil.showAlert(
      'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
      'error'
    );
    return;
  }

  UIUtil.setButtonLoading('setup-submit-btn', true);

  try {
    const response = await authService.initializeInstance(orgName, email, password);

    if (response.success) {
      UIUtil.showAlert('Setup complete! Logging you in...', 'success');

      setTimeout(async () => {
        try {
          await authService.login(email, password);
          setupStatus.initialized = true;
          showHomeView();
        } catch (error) {
          UIUtil.showAlert('Setup complete. Please log in.', 'success');
          setupStatus.initialized = true;
          showLoginView();
        }
      }, 1000);
    }
  } catch (error) {
    UIUtil.showAlert(error.message || 'Setup failed', 'error');
    UIUtil.setButtonLoading('setup-submit-btn', false);
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const formData = new FormData(document.getElementById('login-form'));
  const email = formData.get('email');
  const password = formData.get('password');

  UIUtil.setButtonLoading('login-submit-btn', true);

  try {
    const response = await authService.login(email, password);

    if (response.success) {
      UIUtil.showAlert('Login successful!', 'success');
      setTimeout(() => showHomeView(), 500);
    }
  } catch (error) {
    UIUtil.showAlert(error.message || 'Login failed', 'error');
    UIUtil.setButtonLoading('login-submit-btn', false);
  }
}

async function handleLogout(event) {
  event.preventDefault();

  if (confirm('Are you sure you want to logout?')) {
    await authService.logout();
    showLoginView();
    UIUtil.showAlert('Logged out successfully', 'success');
  }
}

// Load data based on current page
function loadPageData() {
  const path = window.location.pathname.toLowerCase();
  
  if (path.includes('/teams')) {
    const user = authService.getUser();
    const isAdmin = authService.isAdmin();
    const isManager = user?.role === 'manager';
    if (!isAdmin && !isManager) {
      UIUtil.showAlert('You do not have permission to view teams', 'error');
      window.location.href = '/home';
      return;
    }
    loadTeams();
  } else if (path.includes('/users')) {
    if (!authService.isAdmin()) {
      UIUtil.showAlert('You do not have permission to view users', 'error');
      window.location.href = '/home';
      return;
    }
    loadUsers();
  } else if (path.includes('/home')) {
    const orgName = setupStatus.orgName || 'Organization';
    const orgNameEl = document.getElementById('org-name');
    if (orgNameEl) {
      orgNameEl.textContent = orgName;
    }
  }
}

async function loadUsers() {
  try {
    const response = await api.getUsers();
    const users = response.data || [];

    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';

    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(user.email)}</td>
        <td><span class="badge badge-primary">${escapeHtml(user.role)}</span></td>
        <td>${formatDate(user.createdAt)}</td>
        <td>
          <button class="btn btn-small btn-secondary" onclick="handleChangeRole('${user.id}', '${user.role}')">
            Change Role
          </button>
          <button class="btn btn-small btn-danger" onclick="handleDeleteUser('${user.id}', '${user.email}')" style="margin-left: 0.5rem;">
            Delete
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    UIUtil.showAlert(error.message || 'Failed to load users', 'error');
  }
}

function handleCreatePipeline(event) {
  event.preventDefault();
  UIUtil.showAlert('Pipeline creation coming soon', 'info');
}

function handleCreateTeam(event) {
  event.preventDefault();
  UIUtil.showAlert('Team creation coming soon', 'info');
}

function handleRegisterRunner(event) {
  event.preventDefault();
  UIUtil.showAlert('Runner registration coming soon', 'info');
}

function handleCreateUserModal(event) {
  event.preventDefault();
  UIUtil.show('create-user-modal');
  UIUtil.clearForm('create-user-form');
}

function closeUserModal() {
  UIUtil.hide('create-user-modal');
}

async function handleCreateUser(event) {
  event.preventDefault();

  const formData = new FormData(document.getElementById('create-user-form'));
  const email = formData.get('email');
  const password = formData.get('password');
  const role = formData.get('role');

  if (!role) {
    UIUtil.showAlert('Please select a role', 'error');
    return;
  }

  UIUtil.setButtonLoading('create-user-submit-btn', true);

  try {
    const response = await api.createUser(email, password, role);

    if (response.success) {
      UIUtil.showAlert('User ' + email + ' created successfully', 'success');
      closeUserModal();
      await loadUsers();
    }
  } catch (error) {
    UIUtil.showAlert(error.message || 'Failed to create user', 'error');
  } finally {
    UIUtil.setButtonLoading('create-user-submit-btn', false);
  }
}

async function handleChangeRole(userId, currentRole) {
  const newRole = prompt('Current role: ' + currentRole + '\n\nChange to (admin/user):', currentRole);

  if (!newRole || newRole === currentRole) {
    return;
  }

  if (!['admin', 'user'].includes(newRole)) {
    UIUtil.showAlert('Invalid role. Must be admin or user', 'error');
    return;
  }

  try {
    const response = await api.updateUserRole(userId, newRole);

    if (response.success) {
      UIUtil.showAlert(response.message, 'success');
      await loadUsers();
    }
  } catch (error) {
    UIUtil.showAlert(error.message || 'Failed to update role', 'error');
  }
}

async function handleDeleteUser(userId, email) {
  if (!confirm('Are you sure you want to delete ' + email + '?')) {
    return;
  }

  try {
    const response = await api.deleteUser(userId);

    if (response.success) {
      UIUtil.showAlert(response.message, 'success');
      await loadUsers();
    }
  } catch (error) {
    UIUtil.showAlert(error.message || 'Failed to delete user', 'error');
  }
}

function validatePasswordStrength(password) {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*]/.test(password)) return false;
  return true;
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function getUserInitials(email) {
  if (!email) return '?';
  const parts = email.split('@')[0].split(/[._-]/);
  return parts.slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('');
}

// ============== TEAM MANAGEMENT ==============

let currentEditTeamId = null;
let teams = [];

async function loadTeams() {
  try {
    UIUtil.setLoading('teams-list', true);
    const response = await api.get('/team');

    if (response.success) {
      teams = response.data || [];
      renderTeamsList();
    }
  } catch (error) {
    UIUtil.showAlert(error.message || 'Failed to load teams', 'error');
  } finally {
    UIUtil.setLoading('teams-list', false);
  }
}

function renderTeamsList() {
  const container = document.getElementById('teams-list');

  if (teams.length === 0) {
    container.innerHTML = '<p class="text-center" style="color: var(--gray-400); padding: 2rem;">No teams created yet. Create your first team!</p>';
    return;
  }

  let html = '<div style="padding: 1rem;">';
  teams.forEach(team => {
    html += `
      <div class="team-item">
        <div class="team-info">
          <div class="team-name">${escapeHtml(team.name)}</div>
          ${team.description ? `<div class="team-description">${escapeHtml(team.description)}</div>` : ''}
          <div class="team-member-count">${team.memberCount || 0} members</div>
        </div>
        <div class="team-actions">
          <button class="btn btn-sm btn-primary" onclick="handleEditTeam('${team.id}', '${escapeHtml(team.name)}', '${escapeHtml(team.description || '')}')">Edit</button>
          <button class="btn btn-sm btn-info" onclick="handleManageTeamMembers('${team.id}')">Members</button>
          <button class="btn btn-sm btn-danger" onclick="handleDeleteTeam('${team.id}', '${escapeHtml(team.name)}')">Delete</button>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

function handleCreateTeam(event) {
  if (event) event.preventDefault();
  currentEditTeamId = null;
  document.getElementById('create-team-form').reset();
  UIUtil.show('create-team-modal');
  document.getElementById('team-name').focus();
}

function closeCreateTeamModal(event) {
  if (event) event.preventDefault();
  UIUtil.hide('create-team-modal');
  document.getElementById('create-team-form').reset();
}

async function handleSaveTeam(event) {
  event.preventDefault();

  const name = document.getElementById('team-name').value.trim();
  const description = document.getElementById('team-description').value.trim();

  if (!name) {
    UIUtil.showAlert('Team name is required', 'error');
    return;
  }

  UIUtil.setButtonLoading('team-save-btn', true);

  try {
    const body = { name, description: description || undefined };
    const response = await api.post('/team', body);

    if (response.success) {
      UIUtil.showAlert('Team created successfully', 'success');
      closeCreateTeamModal();
      await loadTeams();
    }
  } catch (error) {
    UIUtil.showAlert(error.message || 'Failed to create team', 'error');
  } finally {
    UIUtil.setButtonLoading('team-save-btn', false);
  }
}

function handleEditTeam(teamId, name, description) {
  currentEditTeamId = teamId;
  document.getElementById('team-name').value = name;
  document.getElementById('team-description').value = description;
  UIUtil.show('create-team-modal');
  document.getElementById('team-name').focus();
}

async function handleDeleteTeam(teamId, name) {
  if (!confirm('Are you sure you want to delete the team "' + name + '"?')) {
    return;
  }

  try {
    const response = await api.delete('/team/' + teamId);

    if (response.success) {
      UIUtil.showAlert('Team deleted successfully', 'success');
      await loadTeams();
    }
  } catch (error) {
    UIUtil.showAlert(error.message || 'Failed to delete team', 'error');
  }
}

async function handleManageTeamMembers(teamId) {
  try {
    // Load all users to populate the select
    const usersResponse = await api.get('/admin/users');
    if (usersResponse.success) {
      const users = usersResponse.data || [];
      const select = document.getElementById('member-user-select');
      
      // Clear and populate user select
      select.innerHTML = '<option value="">-- Select a user --</option>';
      users.forEach(user => {
        select.innerHTML += `<option value="${user.id}">${escapeHtml(user.email)}</option>`;
      });
    }

    // Store team ID for member management
    document.getElementById('add-member-modal').dataset.teamId = teamId;
    UIUtil.show('add-member-modal');
  } catch (error) {
    UIUtil.showAlert(error.message || 'Failed to load users', 'error');
  }
}

function closeAddMemberModal(event) {
  if (event) event.preventDefault();
  UIUtil.hide('add-member-modal');
  document.getElementById('add-member-form').reset();
}

async function handleAddMember(event) {
  event.preventDefault();

  const teamId = document.getElementById('add-member-modal').dataset.teamId;
  const userId = document.getElementById('member-user-select').value;
  const permission = document.getElementById('member-permission').value;

  if (!userId) {
    UIUtil.showAlert('Please select a user', 'error');
    return;
  }

  UIUtil.setButtonLoading('member-save-btn', true);

  try {
    const response = await api.post(`/team/${teamId}/members`, { userId, permission });

    if (response.success) {
      UIUtil.showAlert('Member added successfully', 'success');
      closeAddMemberModal();
      await loadTeams();
    }
  } catch (error) {
    UIUtil.showAlert(error.message || 'Failed to add member', 'error');
  } finally {
    UIUtil.setButtonLoading('member-save-btn', false);
  }
}

document.addEventListener('click', function(event) {
  const userModal = document.getElementById('create-user-modal');
  if (event.target === userModal) {
    closeUserModal();
  }

  const teamModal = document.getElementById('create-team-modal');
  if (event.target === teamModal) {
    closeCreateTeamModal();
  }

  const memberModal = document.getElementById('add-member-modal');
  if (event.target === memberModal) {
    closeAddMemberModal();
  }
});

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  loadPageData();
});
