/**
 * Parth Plastopack Pvt. Ltd.
 * Category Page Controller
 */

let currentCategory = null;
let categoryProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    await renderCategoryPage();
    bindCategorySearch();
  } catch (err) {
    console.error('Failed to initialize category page:', err);
  }
});

async function renderCategoryPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const catId = urlParams.get('id');
  const catSlug = urlParams.get('slug');

  const categories = await getCategories({ status: 'active' });
  if (catId) {
    currentCategory = categories.find(c => c.id === catId);
  } else if (catSlug) {
    currentCategory = categories.find(c => c.slug === catSlug);
  }

  if (!currentCategory && categories.length > 0) {
    currentCategory = categories[0];
  }

  if (!currentCategory) {
    document.getElementById('catTitle').textContent = 'Category Not Found';
    return;
  }

  // Set Page Title and Headers
  document.title = `${currentCategory.name} | Parth Plasto Pack Pvt. Ltd.`;
  document.getElementById('breadcrumbCategoryName').textContent = currentCategory.name;
  document.getElementById('catTitle').textContent = currentCategory.name;
  document.getElementById('catDescription').textContent = currentCategory.description || 'Explore our complete range of high-precision pharmaceutical packaging products.';

  // Render Category Hero Image if available
  const heroImageBox = document.getElementById('catHeroImageBox');
  const heroImage = document.getElementById('catHeroImage');
  if (heroImageBox && heroImage) {
    if (currentCategory.image) {
      heroImage.src = currentCategory.image;
      heroImageBox.style.display = 'flex';
    } else {
      heroImageBox.style.display = 'none';
    }
  }

  // Load products for this category
  categoryProducts = await getProducts({ categoryId: currentCategory.id, status: 'active' });
  renderCategoryProductsGrid(categoryProducts);
}

function renderCategoryProductsGrid(products) {
  const grid = document.getElementById('catProductsGrid');
  const countDisplay = document.getElementById('catProductCountDisplay');
  if (!grid) return;

  if (countDisplay) {
    countDisplay.textContent = `Showing ${products.length} product${products.length === 1 ? '' : 's'} in ${currentCategory?.name || 'Category'}`;
  }

  if (products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 20px; border: 1px dashed #e2e8f0;">
        <i class="fa-solid fa-box-open" style="font-size: 3rem; color: #9ca3af; margin-bottom: 16px;"></i>
        <h3 style="font-size: 1.2rem; color: #191426; margin-bottom: 8px;">No products in this category yet</h3>
        <p style="color: #6b7280; font-size: 0.95rem; margin-bottom: 20px;">Check back soon or explore our other packaging options.</p>
        <a href="products.html" class="btn btn-primary">Browse All Products</a>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map((p, index) => `
    <div class="product-catalog-card animate-card" style="animation-delay: ${index * 0.05}s;" onclick="window.location.href='product-detail.html?id=${p.id}'">
      <div class="card-image-box">
        <img src="${p.images?.[0] || 'assets/images/products/tube-trio.jpg'}" alt="${sanitizeHTML(p.name)}" loading="lazy" onerror="this.src=getPlaceholderSVG('${p.name}')">
        <span class="card-badge-tag">${sanitizeHTML(currentCategory.name)}</span>
      </div>
      <div class="card-body">
        <h3 class="card-product-title">${sanitizeHTML(p.name)}</h3>
        <div class="card-specs-list">
          <div class="spec-row">
            <span class="spec-label">Material</span>
            <span class="spec-val">${sanitizeHTML(p.material || 'PP')}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Capacity</span>
            <span class="spec-val">${sanitizeHTML(p.capacity || 'Standard')}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">SKU</span>
            <span class="spec-val">${sanitizeHTML(p.sku || 'N/A')}</span>
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
  `).join('');
}

function bindCategorySearch() {
  const searchInput = document.getElementById('catSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = categoryProducts.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.material && p.material.toLowerCase().includes(q))
      );
      renderCategoryProductsGrid(filtered);
    });
  }
}
