/**
 * Setup page - System initialization
 */
import { renderFormGroup, renderHtmlShell } from "../components/Shared.ts";

export function renderSetupPage(): string {
  const content = `<div class="page-layout">
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
  return renderHtmlShell("Piper - Setup", content, false);
}
