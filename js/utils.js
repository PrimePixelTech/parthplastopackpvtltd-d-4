/**
 * Parth Plastopack Pvt. Ltd.
 * Utility Functions: Toasts, Modals, Sanitization, Slugs, Formatting, Fallbacks
 */

/**
 * Show modern animated Toast Notification
 * @param {string} message 
 * @param {'success'|'error'|'info'|'warning'} type 
 * @param {number} duration 
 */
function showToast(message, type = 'success', duration = 3200) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  const iconMap = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-triangle-exclamation',
    info: 'fa-solid fa-circle-info',
    warning: 'fa-solid fa-circle-exclamation'
  };

  toast.innerHTML = `
    <div class="toast-icon"><i class="${iconMap[type] || iconMap.info}"></i></div>
    <div class="toast-content">
      <span class="toast-msg">${sanitizeHTML(message)}</span>
    </div>
    <button type="button" class="toast-close" onclick="this.parentElement.remove()" aria-label="Close">&times;</button>
  `;

  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/**
 * Show Reusable Modal Confirmation Dialog
 */
function showConfirmModal({
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'primary' | 'warning'
  onConfirm = () => {}
}) {
  // Remove existing confirm modal if any
  const existing = document.getElementById('global-confirm-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'global-confirm-modal';
  modal.className = 'modal-backdrop-custom modal-active';

  const btnClass = type === 'danger' ? 'btn-danger-custom' : 'btn-primary-custom';
  const iconClass = type === 'danger' ? 'fa-solid fa-triangle-exclamation text-danger' : 'fa-solid fa-circle-question text-primary';

  modal.innerHTML = `
    <div class="modal-dialog-custom modal-dialog-sm animate-pop">
      <div class="modal-header-custom">
        <div style="display: flex; align-items: center; gap: 12px;">
          <i class="${iconClass}" style="font-size: 1.3rem;"></i>
          <h3 class="modal-title-custom">${sanitizeHTML(title)}</h3>
        </div>
        <button type="button" class="modal-close-btn" id="modal-close-x">&times;</button>
      </div>
      <div class="modal-body-custom">
        <p style="color: #4b5563; font-size: 0.95rem; line-height: 1.5; margin: 0;">${sanitizeHTML(message)}</p>
      </div>
      <div class="modal-footer-custom">
        <button type="button" class="btn-secondary-custom" id="modal-cancel-btn">${sanitizeHTML(cancelText)}</button>
        <button type="button" class="${btnClass}" id="modal-confirm-btn">${sanitizeHTML(confirmText)}</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => {
    modal.classList.remove('modal-active');
    setTimeout(() => modal.remove(), 250);
  };

  modal.querySelector('#modal-close-x').onclick = closeModal;
  modal.querySelector('#modal-cancel-btn').onclick = closeModal;
  modal.querySelector('#modal-confirm-btn').onclick = () => {
    closeModal();
    if (typeof onConfirm === 'function') onConfirm();
  };

  // Close on backdrop click
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
}

/**
 * XSS-Safe HTML Escaping
 */
function sanitizeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate URL slug from string
 */
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Format ISO Date string into human readable format
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Format Relative Date (e.g., '2 hours ago', 'Yesterday')
 */
function formatRelativeTime(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) return formatDate(dateStr);
    if (diffDays > 1) return `${diffDays} days ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffHours >= 1) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffMin >= 1) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
    return 'Just now';
  } catch (e) {
    return formatDate(dateStr);
  }
}

/**
 * Generate Universal Inline SVG Placeholder for Packaging
 */
function getPlaceholderSVG(label = 'Parth Plastopack') {
  const cleanLabel = sanitizeHTML(label);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <rect width="100%" height="100%" fill="#f3f0f8"/>
    <circle cx="200" cy="180" r="70" fill="#e4dbf0"/>
    <path d="M175 140 H225 V155 H175 Z M180 155 H220 V225 C220 235 215 240 200 240 C185 240 180 235 180 225 Z" fill="#7b3fa3"/>
    <rect x="188" y="125" width="24" height="15" rx="3" fill="#6a2ba1"/>
    <text x="200" y="290" fill="#6b7280" font-family="system-ui, sans-serif" font-size="15" font-weight="600" text-anchor="middle">${cleanLabel}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Universal Image Fallback Attacher
 */
function setupImageFallbacks() {
  document.querySelectorAll('img').forEach(img => {
    if (!img.getAttribute('data-fallback-attached')) {
      img.setAttribute('data-fallback-attached', 'true');
      img.addEventListener('error', function() {
        if (!this.src.startsWith('data:image/svg+xml')) {
          this.src = getPlaceholderSVG(this.alt || 'Product Image');
        }
      });
    }
  });
}

/**
 * Active navigation highlighter for Admin Sidebar
 */
function initAdminNavigation() {
  const currentPath = window.location.pathname.split('/').pop() || 'admin.html';
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    const linkHref = item.getAttribute('href');
    if (linkHref && (linkHref === currentPath || (currentPath === '' && linkHref === 'admin.html'))) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Mobile drawer toggle
  const toggleBtn = document.getElementById('mobile-sidebar-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('sidebar-backdrop');

  if (toggleBtn && sidebar) {
    toggleBtn.onclick = () => {
      sidebar.classList.toggle('sidebar-open');
      if (overlay) overlay.classList.toggle('backdrop-open');
    };
  }

  if (overlay) {
    overlay.onclick = () => {
      if (sidebar) sidebar.classList.remove('sidebar-open');
      overlay.classList.remove('backdrop-open');
    };
  }
}

// Auto attach handlers when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  setupImageFallbacks();
  initAdminNavigation();
});
