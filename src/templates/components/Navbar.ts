/**
 * Navbar component - Reusable navigation bar for the application
 */
export function renderNavbar(): string {
  return `<nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <h1>Piper</h1>
      </div>

      <div class="nav-links">
        <a href="/home" class="nav-link">Home</a>
        <a href="/pipelines" class="nav-link">Pipelines</a>
        <a href="/teams" class="nav-link" id="nav-teams">Teams</a>
        <a href="/runners" class="nav-link">Runners</a>
        <a href="/users" class="nav-link" id="nav-users">Users</a>
      </div>

      <div class="navbar-user">
        <div class="user-avatar" id="user-avatar">?</div>
        <span id="user-email">Loading...</span>
        <button class="btn btn-sm btn-danger" onclick="handleLogout(event)">Logout</button>
      </div>
    </div>
  </nav>`;
}
