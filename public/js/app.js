let setupStatus = { initialized: false };

async function initializeApp() {
  try {
    setupStatus = await authService.checkSetupStatus();

    if (!setupStatus.initialized) {
      showSetupView();
    } else if (!authService.isAuthenticated()) {
      showLoginView();
    } else {
      showHomeView();
    }
  } catch (error) {
    console.error('App initialization error:', error);
    UIUtil.showAlert('Failed to initialize app', 'error');
  }
}

function showSetupView() {
  hideAllViews();
  UIUtil.show('setup-view');
}

function showLoginView() {
  hideAllViews();
  UIUtil.show('login-view');
}

function showHomeView() {
  hideAllViews();
  UIUtil.show('home-view');
  updateNavbar();
  goToHome();
}

function hideAllViews() {
  UIUtil.hide('setup-view');
  UIUtil.hide('login-view');
  UIUtil.hide('home-view');
}

function updateNavbar() {
  const user = authService.getUser();
  if (user) {
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-avatar').textContent = getUserInitials(user.email);

    if (authService.isAdmin()) {
      UIUtil.show('nav-users');
      UIUtil.show('card-users');
    } else {
      UIUtil.hide('nav-users');
      UIUtil.hide('card-users');
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

function goToHome(event) {
  if (event) event.preventDefault();
  hidePages();
  UIUtil.show('page-home');

  const orgName = setupStatus.orgName || 'Organization';
  document.getElementById('org-name').textContent = orgName;
}

function goToPipelines(event) {
  if (event) event.preventDefault();
  hidePages();
  UIUtil.show('page-pipelines');
}

function goToTeams(event) {
  if (event) event.preventDefault();
  hidePages();
  UIUtil.show('page-teams');
}

function goToRunners(event) {
  if (event) event.preventDefault();
  hidePages();
  UIUtil.show('page-runners');
}

async function goToUsers(event) {
  if (event) event.preventDefault();

  if (!authService.isAdmin()) {
    UIUtil.showAlert('You do not have permission to view users', 'error');
    return;
  }

  hidePages();
  UIUtil.show('page-users');
  await loadUsers();
}

function hidePages() {
  UIUtil.hide('page-home');
  UIUtil.hide('page-pipelines');
  UIUtil.hide('page-teams');
  UIUtil.hide('page-runners');
  UIUtil.hide('page-users');
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

document.addEventListener('click', function(event) {
  const modal = document.getElementById('create-user-modal');
  if (event.target === modal) {
    closeUserModal();
  }
});

document.addEventListener('DOMContentLoaded', initializeApp);
