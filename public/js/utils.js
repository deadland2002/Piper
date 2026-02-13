/**
 * Piper Frontend - Core Utilities
 * Handles API calls, authentication, and storage
 */

const API_BASE = '/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('piper_token');
    this.user = this.getStoredUser();
  }

  /**
   * Get stored user data from localStorage
   */
  getStoredUser() {
    const user = localStorage.getItem('piper_user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  /**
   * Check if user has required role
   */
  hasRole(role) {
    if (!this.user) return false;
    if (this.user.role === 'super-admin') return true; // Super-admin can do everything
    return this.user.role === role;
  }

  /**
   * Check if user is admin or above
   */
  isAdmin() {
    return this.hasRole('admin') || this.hasRole('super-admin');
  }

  /**
   * Get current user
   */
  getUser() {
    return this.user;
  }

  /**
   * Get auth token
   */
  getToken() {
    return this.token;
  }

  /**
   * Get authorization header
   */
  getAuthHeader() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      this.token = data.data.token;
      this.user = {
        id: data.data.userId,
        email: data.data.email,
        role: data.data.role
      };

      localStorage.setItem('piper_token', this.token);
      localStorage.setItem('piper_user', JSON.stringify(this.user));

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeader()
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      this.user = null;
      localStorage.removeItem('piper_token');
      localStorage.removeItem('piper_user');
    }
  }

  /**
   * Check setup status
   */
  async checkSetupStatus() {
    try {
      const response = await fetch(`${API_BASE}/setup/status`);
      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Setup status error:', error);
      return { initialized: false };
    }
  }

  /**
   * Initialize instance (super-admin setup)
   */
  async initializeInstance(orgName, email, password) {
    try {
      const response = await fetch(`${API_BASE}/setup/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Initialization failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

class API {
  constructor(authService) {
    this.auth = authService;
  }

  /**
   * Make API request
   */
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...this.auth.getAuthHeader(),
      ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  /**
   * GET request
   */
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * PUT request
   */
  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  /**
   * DELETE request
   */
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Get list of users
   */
  getUsers() {
    return this.get('/admin/users');
  }

  /**
   * Update user role
   */
  updateUserRole(userId, role) {
    return this.put(`/admin/users/${userId}/role`, { role });
  }

  /**
   * Delete user
   */
  deleteUser(userId) {
    return this.delete(`/admin/users/${userId}`);
  }

  /**
   * Create user (setup)
   */
  createUser(email, password, role) {
    return this.post('/setup/create-admin', { email, password, role });
  }
}

// UI Utilities
class UIUtil {
  /**
   * Show alert
   */
  static showAlert(message, type = 'info') {
    const alertId = 'alert-' + Date.now();
    const alert = document.createElement('div');
    alert.id = alertId;
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      <span>${escapeHtml(message)}</span>
      <span class="alert-close" onclick="document.getElementById('${alertId}').remove()">×</span>
    `;

    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
      alertContainer.appendChild(alert);
      setTimeout(() => {
        const el = document.getElementById(alertId);
        if (el) el.remove();
      }, 5000);
    }
  }

  /**
   * Hide element
   */
  static hide(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.classList.add('hidden');
  }

  /**
   * Show element
   */
  static show(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.classList.remove('hidden');
  }

  /**
   * Toggle element
   */
  static toggle(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.classList.toggle('hidden');
  }

  /**
   * Set button loading state
   */
  static setButtonLoading(buttonId, loading = true) {
    const btn = document.getElementById(buttonId);
    if (btn) {
      btn.disabled = loading;
      if (loading) {
        btn.classList.add('loading');
        btn.textContent = 'Loading...';
      } else {
        btn.classList.remove('loading');
      }
    }
  }

  /**
   * Clear form
   */
  static clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
  }

  /**
   * Get form data
   */
  static getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};
    return new FormData(form);
  }

  /**
   * Escape HTML to prevent XSS
   */
  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize global auth service
const authService = new AuthService();
const api = new API(authService);

// Helper function
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Get user initials for avatar
 */
function getUserInitials(email) {
  return email.split('@')[0].substring(0, 2).toUpperCase();
}

/**
 * Format date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}
