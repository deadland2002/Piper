/**
 * Login page - User authentication
 */
import { renderFormGroup, renderHtmlShell } from "../components/Shared.ts";

export function renderLoginPage(): string {
  const content = `<div class="page-layout">
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
  return renderHtmlShell("Piper - Sign In", content, false);
}
