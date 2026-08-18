/**
 * Parth Plastopack Pvt. Ltd.
 * Inquiries / Quote Management Controller
 */

let allInquiries = [];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    
    // If on admin inquiries page
    if (document.getElementById('inquiries-table-tbody')) {
      bindInquiryAdminEvents();
      await fetchAndRenderInquiries();
    }

    // Public website quote modal bindings
    setupPublicQuoteModal();
  } catch (err) {
    console.error('Inquiries init error:', err);
  }
});

/**
 * Public Quote Modal Setup (Works on index, products, category, product-detail)
 */
function setupPublicQuoteModal() {
  const modal = document.getElementById('quote-request-modal');
  const form = document.getElementById('quote-request-form');
  if (!modal || !form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : 'Submit Inquiry';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    }

    const name = document.getElementById('quote-form-name')?.value.trim();
    const company = document.getElementById('quote-form-company')?.value.trim();
    const email = document.getElementById('quote-form-email')?.value.trim();
    const phone = document.getElementById('quote-form-phone')?.value.trim();
    const productName = document.getElementById('quote-form-product')?.value.trim();
    const quantity = document.getElementById('quote-form-quantity')?.value.trim();
    const message = document.getElementById('quote-form-message')?.value.trim();

    try {
      await addInquiry({
        name,
        company,
        email,
        phone,
        productName,
        quantity,
        message
      });

      if (typeof showToast === 'function') {
        showToast('Your quote inquiry has been submitted! Our sales team will get back to you shortly.', 'success', 5000);
      }

      form.reset();
      modal.classList.remove('modal-active');
    } catch (err) {
      console.error('Inquiry submission error:', err);
      if (typeof showToast === 'function') {
        showToast('Failed to submit inquiry: ' + err.message, 'error');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }
  });

  // Close buttons
  modal.querySelectorAll('.modal-close-btn, .modal-close-trigger').forEach(btn => {
    btn.onclick = () => modal.classList.remove('modal-active');
  });

  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('modal-active');
  };
}

/**
 * Open Quote Modal from anywhere on the public site
 */
function openQuoteModal(productName = '') {
  let modal = document.getElementById('quote-request-modal');
  if (!modal) {
    createDynamicQuoteModal();
    modal = document.getElementById('quote-request-modal');
  }

  const prodInput = document.getElementById('quote-form-product');
  if (prodInput) {
    prodInput.value = productName || '';
  }

  modal.classList.add('modal-active');
}

/**
 * Auto inject quote modal markup if missing on public page
 */
function createDynamicQuoteModal() {
  if (document.getElementById('quote-request-modal')) return;

  const modalHtml = `
    <div id="quote-request-modal" class="modal-backdrop-custom">
      <div class="modal-dialog-custom modal-dialog-sm" style="max-width: 540px;">
        <div class="modal-header-custom" style="background: linear-gradient(135deg, #7b3fa3, #58217d); color: #fff;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-paper-plane" style="font-size: 1.2rem;"></i>
            <h3 class="modal-title-custom" style="color: #fff; font-size: 1.15rem;">Request a Fast Quote</h3>
          </div>
          <button type="button" class="modal-close-btn modal-close-trigger" style="color: #fff;">&times;</button>
        </div>
        <form id="quote-request-form">
          <div class="modal-body-custom" style="padding: 24px;">
            <p style="font-size: 0.85rem; color: #6b7280; margin-bottom: 16px;">
              Get wholesale pricing, custom tooling details, and samples for your pharmaceutical packaging requirements.
            </p>
            <div class="form-grid-2">
              <div class="form-group-custom">
                <label class="form-label-custom">Full Name <span class="required-star">*</span></label>
                <input type="text" id="quote-form-name" class="form-control-custom" placeholder="e.g. Dr. Rajesh Mehta" required>
              </div>
              <div class="form-group-custom">
                <label class="form-label-custom">Company / Brand <span class="required-star">*</span></label>
                <input type="text" id="quote-form-company" class="form-control-custom" placeholder="e.g. Zydus Pharma" required>
              </div>
            </div>
            <div class="form-grid-2">
              <div class="form-group-custom">
                <label class="form-label-custom">Work Email <span class="required-star">*</span></label>
                <input type="email" id="quote-form-email" class="form-control-custom" placeholder="name@company.com" required>
              </div>
              <div class="form-group-custom">
                <label class="form-label-custom">Phone / WhatsApp <span class="required-star">*</span></label>
                <input type="tel" id="quote-form-phone" class="form-control-custom" placeholder="+91 98765 43210" required>
              </div>
            </div>
            <div class="form-grid-2">
              <div class="form-group-custom">
                <label class="form-label-custom">Product of Interest</label>
                <input type="text" id="quote-form-product" class="form-control-custom" placeholder="Product name or SKU">
              </div>
              <div class="form-group-custom">
                <label class="form-label-custom">Estimated Order Quantity</label>
                <input type="text" id="quote-form-quantity" class="form-control-custom" placeholder="e.g. 25,000 pcs">
              </div>
            </div>
            <div class="form-group-custom">
              <label class="form-label-custom">Specifications / Notes</label>
              <textarea id="quote-form-message" class="form-control-custom" rows="3" placeholder="Specify requirements, custom color, caps, IML label, or delivery timeline..."></textarea>
            </div>
          </div>
          <div class="modal-footer-custom" style="padding: 14px 24px;">
            <button type="button" class="btn-admin btn-secondary-custom modal-close-trigger">Cancel</button>
            <button type="submit" class="btn-admin btn-purple-custom" style="background: linear-gradient(135deg, #7b3fa3, #58217d);">
              <i class="fa-solid fa-paper-plane"></i> Submit Inquiry
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  setupPublicQuoteModal();
}

/* ==========================================================================
   ADMIN INQUIRIES VIEW LOGIC
   ========================================================================== */

function bindInquiryAdminEvents() {
  const searchInput = document.getElementById('search-inquiry-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderInquiriesTable(e.target.value.trim());
    });
  }

  const statusSelect = document.getElementById('filter-inquiry-status');
  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      renderInquiriesTable();
    });
  }

  const exportBtn = document.getElementById('btn-export-inquiries-csv');
  if (exportBtn) {
    exportBtn.onclick = () => exportInquiriesCSV();
  }
}

async function fetchAndRenderInquiries() {
  allInquiries = await getInquiries();
  renderInquiriesTable();
}

function renderInquiriesTable(searchTerm = '') {
  const tbody = document.getElementById('inquiries-table-tbody');
  const countEl = document.getElementById('inquiries-total-count');
  const statusFilter = document.getElementById('filter-inquiry-status')?.value || 'all';
  if (!tbody) return;

  let list = allInquiries;

  if (statusFilter !== 'all') {
    list = list.filter(i => i.status === statusFilter);
  }

  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    list = list.filter(i => 
      (i.name && i.name.toLowerCase().includes(q)) ||
      (i.company && i.company.toLowerCase().includes(q)) ||
      (i.email && i.email.toLowerCase().includes(q)) ||
      (i.productName && i.productName.toLowerCase().includes(q))
    );
  }

  if (countEl) countEl.textContent = list.length;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="table-empty-state">
          <p>No quote inquiries match your criteria.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(inq => `
    <tr data-id="${inq.id}">
      <td data-label="Date">
        <span style="font-size: 0.85rem; color: var(--admin-text-muted);">${formatDate(inq.createdAt)}</span>
      </td>
      <td data-label="Contact">
        <strong style="color: var(--admin-text-main);">${sanitizeHTML(inq.name)}</strong>
        <div style="font-size: 0.8rem; color: var(--admin-text-muted);">${sanitizeHTML(inq.company || 'Private Buyer')}</div>
      </td>
      <td data-label="Email & Phone">
        <div><a href="mailto:${sanitizeHTML(inq.email)}" style="color: var(--admin-blue-primary);"><i class="fa-solid fa-envelope"></i> ${sanitizeHTML(inq.email)}</a></div>
        <div style="font-size: 0.8rem; color: var(--admin-text-muted);"><i class="fa-solid fa-phone"></i> ${sanitizeHTML(inq.phone || 'N/A')}</div>
      </td>
      <td data-label="Product">
        <span class="badge-custom badge-category">${sanitizeHTML(inq.productName || 'General Inquiry')}</span>
      </td>
      <td data-label="Quantity">
        <strong>${sanitizeHTML(inq.quantity || 'N/A')}</strong>
      </td>
      <td data-label="Status">
        <select class="select-filter-custom btn-sm-custom" onchange="changeInquiryStatus('${inq.id}', this.value)" style="padding: 4px 24px 4px 8px; font-size: 0.8rem;">
          <option value="new" ${inq.status === 'new' ? 'selected' : ''}>New</option>
          <option value="contacted" ${inq.status === 'contacted' ? 'selected' : ''}>Contacted</option>
          <option value="closed" ${inq.status === 'closed' ? 'selected' : ''}>Closed</option>
        </select>
      </td>
      <td data-label="Actions">
        <div class="table-actions-cell">
          <button type="button" class="btn-action-icon" title="View Details" onclick="viewInquiryDetails('${inq.id}')">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button type="button" class="btn-action-icon danger" title="Delete" onclick="confirmDeleteInquiry('${inq.id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function changeInquiryStatus(id, newStatus) {
  await updateInquiryStatus(id, newStatus);
  showToast(`Inquiry marked as ${newStatus}`, 'info');
  await fetchAndRenderInquiries();
}

function viewInquiryDetails(id) {
  const inq = allInquiries.find(i => i.id === id);
  if (!inq) return;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop-custom modal-active';
  modal.innerHTML = `
    <div class="modal-dialog-custom modal-dialog-sm">
      <div class="modal-header-custom">
        <h3 class="modal-title-custom">Quote Inquiry Details</h3>
        <button type="button" class="modal-close-btn" onclick="this.closest('.modal-backdrop-custom').remove()">&times;</button>
      </div>
      <div class="modal-body-custom" style="display: flex; flex-direction: column; gap: 12px; font-size: 0.9rem;">
        <div><strong>Customer Name:</strong> ${sanitizeHTML(inq.name)}</div>
        <div><strong>Company:</strong> ${sanitizeHTML(inq.company || 'N/A')}</div>
        <div><strong>Email:</strong> <a href="mailto:${sanitizeHTML(inq.email)}" style="color: var(--admin-blue-primary);">${sanitizeHTML(inq.email)}</a></div>
        <div><strong>Phone:</strong> <a href="tel:${sanitizeHTML(inq.phone)}" style="color: var(--admin-blue-primary);">${sanitizeHTML(inq.phone || 'N/A')}</a></div>
        <div><strong>Product:</strong> ${sanitizeHTML(inq.productName || 'General Inquiry')}</div>
        <div><strong>Quantity:</strong> ${sanitizeHTML(inq.quantity || 'N/A')}</div>
        <div><strong>Date Submitted:</strong> ${formatDate(inq.createdAt)}</div>
        <div style="background: #f8f9fc; padding: 12px; border-radius: 8px; border: 1px solid #e9ecf2; margin-top: 8px;">
          <strong>Message / Specs:</strong>
          <p style="margin-top: 6px; white-space: pre-wrap; color: #4b5563;">${sanitizeHTML(inq.message || 'No additional message.')}</p>
        </div>
      </div>
      <div class="modal-footer-custom">
        <a href="mailto:${sanitizeHTML(inq.email)}?subject=Quote Request Response - Parth Plastopack" class="btn-admin btn-primary-custom">
          <i class="fa-solid fa-reply"></i> Reply via Email
        </a>
        <button type="button" class="btn-admin btn-secondary-custom" onclick="this.closest('.modal-backdrop-custom').remove()">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function confirmDeleteInquiry(id) {
  showConfirmModal({
    title: 'Delete Inquiry',
    message: 'Are you sure you want to remove this inquiry from your list?',
    confirmText: 'Delete',
    type: 'danger',
    onConfirm: async () => {
      await deleteInquiry(id);
      showToast('Inquiry deleted.', 'success');
      await fetchAndRenderInquiries();
    }
  });
}

window.openQuoteModal = openQuoteModal;
window.createDynamicQuoteModal = createDynamicQuoteModal;
window.changeInquiryStatus = changeInquiryStatus;
window.viewInquiryDetails = viewInquiryDetails;
window.confirmDeleteInquiry = confirmDeleteInquiry;
