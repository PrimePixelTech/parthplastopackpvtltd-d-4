/**
 * Parth Plastopack Pvt. Ltd.
 * Admin Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    await loadDashboardData();
  } catch (err) {
    console.error('Failed to initialize dashboard:', err);
  }
});

/**
 * Load and render all dashboard metrics, charts, and recent activity
 */
async function loadDashboardData() {
  const stats = await getDashboardStats();

  // Populate Key Metric Cards
  const totalProdsEl = document.getElementById('stat-total-products');
  const activeProdsEl = document.getElementById('stat-active-products');
  const totalCatsEl = document.getElementById('stat-total-categories');
  const totalInqEl = document.getElementById('stat-total-inquiries');
  const totalCustEl = document.getElementById('stat-total-customers');
  const downloadsEl = document.getElementById('stat-downloads');

  if (totalProdsEl) totalProdsEl.textContent = stats.totalProducts;
  if (activeProdsEl) activeProdsEl.textContent = stats.activeProducts;
  if (totalCatsEl) totalCatsEl.textContent = stats.totalCategories;
  if (totalInqEl) totalInqEl.textContent = stats.totalInquiries;
  if (totalCustEl) totalCustEl.textContent = stats.totalCustomers;
  if (downloadsEl) downloadsEl.textContent = stats.downloadsCount;

  // Render Category Distribution
  renderCategoryDistribution(stats.categoryDistribution);

  // Render Recent Products Table
  renderRecentProducts(stats.recentProducts);

  // Render Recent Inquiries Table
  renderRecentInquiries(stats.recentInquiries);
}

/**
 * Render category progress distribution bars
 */
function renderCategoryDistribution(categories) {
  const container = document.getElementById('category-distribution-container');
  if (!container) return;

  if (!categories || categories.length === 0) {
    container.innerHTML = `<p style="color: var(--admin-text-muted); font-size: 0.9rem;">No categories found.</p>`;
    return;
  }

  container.innerHTML = categories.map(cat => `
    <div class="cat-progress-item">
      <div class="cat-progress-meta">
        <span style="font-weight: 600; color: var(--admin-text-main); font-size: 0.85rem;">${sanitizeHTML(cat.name)}</span>
        <span style="color: var(--admin-text-muted); font-size: 0.8rem;">${cat.count} products (${cat.percentage}%)</span>
      </div>
      <div class="cat-progress-bar-bg">
        <div class="cat-progress-bar-fill" style="width: ${Math.max(cat.percentage, 4)}%;"></div>
      </div>
    </div>
  `).join('');
}

/**
 * Render Recently Added Products
 */
function renderRecentProducts(products) {
  const tbody = document.getElementById('recent-products-tbody');
  if (!tbody) return;

  if (!products || products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="table-empty-state"><p>No products yet.</p></td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td data-label="Product" style="display: flex; align-items: center; gap: 12px;">
        <div class="table-thumbnail-box">
          <img src="${p.images?.[0] || 'assets/images/products/tube-trio.jpg'}" alt="${sanitizeHTML(p.name)}" loading="lazy">
        </div>
        <div>
          <strong class="table-product-title">${sanitizeHTML(p.name)}</strong>
          <span class="table-product-subtitle">${sanitizeHTML(p.modelNumber || p.sku)}</span>
        </div>
      </td>
      <td data-label="SKU"><span class="badge-custom badge-sku">${sanitizeHTML(p.sku)}</span></td>
      <td data-label="Status">
        <span class="badge-custom badge-status-${p.status || 'active'}">${p.status || 'active'}</span>
      </td>
      <td data-label="Created">${formatRelativeTime(p.createdAt)}</td>
      <td data-label="Actions">
        <a href="admin-products.html?edit=${p.id}" class="btn-action-icon" title="Edit"><i class="fa-solid fa-pen-to-square"></i></a>
      </td>
    </tr>
  `).join('');
}

/**
 * Render Recent Inquiries
 */
function renderRecentInquiries(inquiries) {
  const tbody = document.getElementById('recent-inquiries-tbody');
  if (!tbody) return;

  if (!inquiries || inquiries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="table-empty-state"><p>No quote inquiries received yet.</p></td></tr>`;
    return;
  }

  tbody.innerHTML = inquiries.map(inq => `
    <tr>
      <td data-label="Client">
        <strong>${sanitizeHTML(inq.name)}</strong>
        <div style="font-size: 0.78rem; color: var(--admin-text-muted);">${sanitizeHTML(inq.company || inq.email)}</div>
      </td>
      <td data-label="Product"><strong>${sanitizeHTML(inq.productName || 'General Inquiry')}</strong></td>
      <td data-label="Quantity">${sanitizeHTML(inq.quantity || 'N/A')}</td>
      <td data-label="Status">
        <span class="badge-custom badge-status-${inq.status === 'new' ? 'draft' : inq.status === 'contacted' ? 'active' : 'inactive'}">
          ${inq.status || 'new'}
        </span>
      </td>
      <td data-label="Date">${formatRelativeTime(inq.createdAt)}</td>
    </tr>
  `).join('');
}
