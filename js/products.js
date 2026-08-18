/**
 * Parth Plastopack Pvt. Ltd. - Dynamic Product Catalog Script
 * Dynamically connects to IndexedDB (db.js) for live shared catalog data.
 */

let dynamicProducts = [];
let dynamicCategories = [];
let categoryLookup = new Map();

let activeCategory = 'all';
let searchQuery = '';
let activeMaterial = 'all';
let activeCapacity = 'all';
let activeSort = 'featured';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    await loadCatalogData();
    setupUrlParams();
    bindCatalogEventListeners();
  } catch (err) {
    console.error('Failed to initialize public product catalog:', err);
  }
});

/**
 * Load live products and categories from IndexedDB
 */
async function loadCatalogData() {
  [dynamicCategories, dynamicProducts] = await Promise.all([
    getCategories({ status: 'active' }),
    getProducts({ status: 'active' })
  ]);

  categoryLookup = new Map(dynamicCategories.map(c => [c.id, c.name]));

  // Render Horizontal Category Circles & Sidebar Links
  renderCategoryNavigation();

  // Render Product Cards
  renderProductsGrid();
}

/**
 * Render Horizontal Circular Icons and Category Sidebars Dynamically
 */
function renderCategoryNavigation() {
  // Top Circular Icons Strip
  const circleContainer = document.getElementById('categoryCircleRow') || document.querySelector('.category-circle-row');
  if (circleContainer) {
    const allPill = `
      <button class="cat-circle-btn ${activeCategory === 'all' ? 'active' : ''}" onclick="selectCategory('all')" data-category="all" title="All Products">
        <div class="cat-circle-icon">
          <i class="fa-solid fa-boxes-stacked icon-box-svg"></i>
        </div>
        <span class="cat-circle-label">All Products</span>
      </button>
    `;

    const catPills = dynamicCategories.map(cat => `
      <button class="cat-circle-btn ${activeCategory === cat.id || activeCategory === cat.slug ? 'active' : ''}" onclick="selectCategory('${cat.id}')" data-category="${cat.id}" title="${sanitizeHTML(cat.name)}">
        <div class="cat-circle-icon">
          <img src="${cat.image || 'assets/images/products/tube-trio.jpg'}" alt="${sanitizeHTML(cat.name)}" onerror="this.src=getPlaceholderSVG('${cat.name}')">
        </div>
        <span class="cat-circle-label">${sanitizeHTML(cat.name)}</span>
      </button>
    `).join('');

    circleContainer.innerHTML = allPill + catPills;
  }

  // Sidebar Category List
  const sidebarNav = document.getElementById('sidebarCategoryList') || document.getElementById('catalogSidebarCategories');
  if (sidebarNav) {
    const allItem = `
      <button class="sidebar-cat-btn ${activeCategory === 'all' ? 'active' : ''}" onclick="selectCategory('all')" data-category="all">
        <div class="sidebar-cat-left">
          <i class="fa-solid fa-box"></i>
          <span>All Products</span>
        </div>
        <span style="font-size:0.75rem; background:#f3e8ff; color:#7b3fa3; padding:2px 8px; border-radius:999px; font-weight:700;">${dynamicProducts.length}</span>
      </button>
    `;

    const catItems = dynamicCategories.map(cat => {
      const count = dynamicProducts.filter(p => p.categoryId === cat.id).length;
      return `
        <button class="sidebar-cat-btn ${activeCategory === cat.id || activeCategory === cat.slug ? 'active' : ''}" onclick="selectCategory('${cat.id}')" data-category="${cat.id}">
          <div class="sidebar-cat-left">
            <img src="${cat.image || 'assets/images/products/tube-trio.jpg'}" class="cat-thumb-mini" alt="" onerror="this.src=getPlaceholderSVG('${cat.name}')">
            <span>${sanitizeHTML(cat.name)}</span>
          </div>
          <span style="font-size:0.75rem; background:#f3e8ff; color:#7b3fa3; padding:2px 8px; border-radius:999px; font-weight:700;">${count}</span>
        </button>
      `;
    }).join('');

    sidebarNav.innerHTML = allItem + catItems;
  }
}

/**
 * Filter and Render Product Grid Cards
 */
function renderProductsGrid() {
  const grid = document.getElementById('productGrid');
  const countDisplay = document.getElementById('productCountDisplay');
  if (!grid) return;

  let filtered = [...dynamicProducts];

  // Category filter
  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => p.categoryId === activeCategory || p.categoryId === getCategoryIdFromSlug(activeCategory));
  }

  // Search filter
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.material && p.material.toLowerCase().includes(q)) ||
      (p.modelNumber && p.modelNumber.toLowerCase().includes(q)) ||
      (p.capacity && p.capacity.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (categoryLookup.get(p.categoryId) && categoryLookup.get(p.categoryId).toLowerCase().includes(q))
    );
  }

  // Material filter
  if (activeMaterial !== 'all') {
    filtered = filtered.filter(p => p.material && p.material.toLowerCase().includes(activeMaterial.toLowerCase()));
  }

  // Capacity filter
  if (activeCapacity !== 'all') {
    filtered = filtered.filter(p => p.capacity && p.capacity.toLowerCase().includes(activeCapacity.toLowerCase()));
  }

  // Sorting
  if (activeSort === 'name-asc') {
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (activeSort === 'name-desc') {
    filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
  } else if (activeSort === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else {
    filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // Update count badge
  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} product${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-products-box" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 20px; border: 1px dashed #e2e8f0; margin: 20px 0;">
        <i class="fa-solid fa-box-open" style="font-size: 3rem; color: #9ca3af; margin-bottom: 16px;"></i>
        <h3 style="font-size: 1.25rem; color: #191426; margin-bottom: 8px;">No matching products found</h3>
        <p style="color: #6b7280; font-size: 0.95rem; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">
          Try adjusting your search criteria, clearing active filters, or browsing other packaging categories.
        </p>
        <button type="button" class="btn btn-primary" onclick="selectCategory('all')">View All Products</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((p, index) => {
    const catName = categoryLookup.get(p.categoryId) || p.subCategory || 'Container';
    const mainImg = p.images?.[0] || 'assets/images/products/tube-trio.jpg';

    return `
      <div class="product-catalog-card animate-card" style="animation-delay: ${index * 0.04}s;" onclick="goToProductDetail(event, '${p.id}')">
        <div class="card-image-box">
          <img src="${mainImg}" alt="${sanitizeHTML(p.name)}" loading="lazy" onerror="this.src=getPlaceholderSVG('${p.name}')">
          <span class="card-badge-tag">${sanitizeHTML(catName)}</span>
        </div>
        
        <div class="card-body">
          <h3 class="card-product-title">${sanitizeHTML(p.name)}</h3>
          
          <div class="card-specs-list">
            <div class="spec-row">
              <span class="spec-label">Material</span>
              <span class="spec-val">${sanitizeHTML(p.material || 'PP Food Grade')}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Capacity</span>
              <span class="spec-val">${sanitizeHTML(p.capacity || p.size || 'Standard')}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">SKU / Model</span>
              <span class="spec-val">${sanitizeHTML(p.sku || p.modelNumber || 'PPC-Series')}</span>
            </div>
          </div>
          
          <div class="card-actions-row">
            <a href="product-detail.html?id=${p.id}" class="btn-card-details" onclick="event.stopPropagation();">
              View Product &rarr;
            </a>
            <button type="button" class="btn-card-quote" onclick="event.stopPropagation(); openQuoteModal('${sanitizeHTML(p.name)}');">
              Request Quote
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getCategoryIdFromSlug(slug) {
  const found = dynamicCategories.find(c => c.slug === slug);
  return found ? found.id : slug;
}

function selectCategory(catId) {
  activeCategory = catId;
  renderCategoryNavigation();
  renderProductsGrid();

  // Update URL without refresh
  const url = new URL(window.location);
  if (catId === 'all') {
    url.searchParams.delete('category');
  } else {
    url.searchParams.set('category', catId);
  }
  window.history.pushState({}, '', url);
}

function bindCatalogEventListeners() {
  // Search Bar
  const searchInput = document.getElementById('catalogSearchInput') || document.getElementById('productSearch');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        searchQuery = e.target.value;
        renderProductsGrid();
      }, 200);
    });
  }

  // Sorting dropdown
  const sortSelect = document.getElementById('catalogSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderProductsGrid();
    });
  }

  // Filter dropdowns
  const materialSelect = document.getElementById('filterMaterialSelect');
  if (materialSelect) {
    materialSelect.addEventListener('change', (e) => {
      activeMaterial = e.target.value;
      renderProductsGrid();
    });
  }

  const capacitySelect = document.getElementById('filterCapacitySelect');
  if (capacitySelect) {
    capacitySelect.addEventListener('change', (e) => {
      activeCapacity = e.target.value;
      renderProductsGrid();
    });
  }
}

function setupUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('category');
  const searchParam = params.get('search');

  if (catParam) {
    activeCategory = catParam;
  }
  if (searchParam) {
    searchQuery = searchParam;
    const searchInput = document.getElementById('catalogSearchInput');
    if (searchInput) searchInput.value = searchParam;
  }
}

window.selectCategory = selectCategory;
window.goToProductDetail = function(event, productId) {
  if (event && event.target && (event.target.tagName === 'A' || event.target.tagName === 'BUTTON' || event.target.closest('button'))) {
    return;
  }
  window.location.href = `product-detail.html?id=${productId}`;
};
