/**
 * Shared UI components used across pages
 */

/**
 * Reusable button component
 */
export function renderButton(label: string, onclick: string, className: string = "btn btn-primary"): string {
  return `<button class="${className}" onclick="${onclick}">${label}</button>`;
}

/**
 * Render form input group with label
 */
export function renderFormGroup(
  id: string,
  label: string,
  type: string = "text",
  placeholder: string = "",
  required: boolean = false,
  autocomplete: string = ""
): string {
  return `<div class="form-group">
    <label for="${id}">${label}</label>
    ${
      type === "textarea"
        ? `<textarea id="${id}" name="${id}" placeholder="${placeholder}" ${required ? "required" : ""} rows="3"></textarea>`
        : `<input type="${type}" id="${id}" name="${id}" placeholder="${placeholder}" ${required ? "required" : ""} ${autocomplete ? `autocomplete="${autocomplete}"` : ""}>`
    }
  </div>`;
}

/**
 * Reusable alert/modal component
 */
export function renderModal(id: string, title: string, content: string, footer: string = ""): string {
  return `<div id="${id}" class="modal hidden">
    <div class="modal-content">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="close-btn" onclick="closeModal('${id}')">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ""}
    </div>
  </div>`;
}

/**
 * HTML escaping utility for XSS protection
 */
export function escapeHtml(text: string): string {
  if (!text) return "";
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Render complete HTML page shell
 */
export function renderHtmlShell(title: string, content: string, showNavbar: boolean = false): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title || "Piper - Pipeline Orchestration")}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div id="app">
    <!-- Alert Container -->
    <div id="alert-container"></div>
    ${showNavbar ? `<div id="navbar-container"></div>` : ""}
    ${content}
  </div>
  <!-- Scripts -->
  <script src="/js/utils.js"><\/script>
  <script src="/js/app.js"><\/script>
  <script>
    // Handle browser back/forward buttons
    window.addEventListener('popstate', handlePopState);
  <\/script>
</body>
</html>`;
}
