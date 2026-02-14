/**
 * Runners page template
 */
import { renderNavbar } from "../components/Navbar.ts";
import { renderHtmlShell } from "../components/Shared.ts";

export function renderRunnersPage(): string {
  const pageContent = `<h1>Runners</h1>
  <div class="mb-3">
    <button class="btn btn-success" onclick="handleRegisterRunner(event)">+ Register Runner</button>
  </div>
  <div class="card">
    <p class="text-center" style="color: var(--gray-400); padding: 2rem;">
      Coming soon - Runner management
    </p>
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
  
  return renderHtmlShell("Piper - Runners", content, false);
}
