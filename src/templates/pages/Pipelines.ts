/**
 * Pipelines page template
 */
import { renderNavbar } from "../components/Navbar.ts";
import { renderHtmlShell } from "../components/Shared.ts";

export function renderPipelinesPage(): string {
  const pageContent = `<h1>Pipelines</h1>
  <div class="mb-3">
    <button class="btn btn-success" onclick="handleCreatePipeline(event)">+ Create Pipeline</button>
  </div>
  <div class="card">
    <p class="text-center" style="color: var(--gray-400); padding: 2rem;">
      Coming soon - Pipeline management
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
  
  return renderHtmlShell("Piper - Pipelines", content, false);
}
