/**
 * Parth Plastopack Pvt. Ltd.
 * Dynamic Product Detail Page Controller
 * Reads product data directly from IndexedDB (db.js)
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    await renderProductDetailPage();
  } catch (err) {
    console.error('Failed to initialize product detail page:', err);
  }
});

async function renderProductDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const prodId = urlParams.get('id');
  const prodSlug = urlParams.get('slug');

  let product = null;
  const allActiveProducts = await getProducts({ status: 'active' });
  const allCategories = await getCategories();
  const categoryMap = new Map(allCategories.map(c => [c.id, c.name]));

  if (prodId) {
    product = allActiveProducts.find(p => p.id === prodId || String(p.id) === String(prodId));
  } else if (prodSlug) {
    product = allActiveProducts.find(p => p.slug === prodSlug);
  }

  // Fallback to first active product if not found
  if (!product && allActiveProducts.length > 0) {
    product = allActiveProducts[0];
  }

  if (!product) {
    document.querySelector('.detail-container').innerHTML = `
      <div style="text-align: center; padding: 120px 20px;">
        <i class="fa-solid fa-box-open" style="font-size: 3.5rem; color: #9ca3af; margin-bottom: 20px;"></i>
        <h2>No Product Found</h2>
        <p style="color: #6b7280; margin-bottom: 24px;">The requested packaging product could not be located in our catalog.</p>
        <a href="products.html" class="btn btn-primary">Browse All Products</a>
      </div>
    `;
    return;
  }

  const categoryName = categoryMap.get(product.categoryId) || product.subCategory || 'Packaging Container';

  // 1. Page Title & Meta
  document.title = product.seo?.title || `${product.name} | Parth Plasto Pack Pvt. Ltd.`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = product.seo?.description || product.shortDescription || `Technical specifications for ${product.name}`;
  }

  // 2. Breadcrumbs
  const breadcrumbName = document.getElementById('breadcrumbProductName');
  if (breadcrumbName) breadcrumbName.textContent = product.name;

  const breadcrumbCat = document.getElementById('breadcrumbCategory');
  if (breadcrumbCat) {
    breadcrumbCat.textContent = categoryName;
    breadcrumbCat.href = `products.html?category=${product.categoryId}`;
  }

  // 3. Category Tag & Product Title
  const tagEl = document.getElementById('detailCatTag');
  if (tagEl) tagEl.textContent = categoryName;

  const titleEl = document.getElementById('detailTitle');
  if (titleEl) titleEl.textContent = product.name;

  // 4. Main Image & Gallery Switcher
  const mainImgEl = document.getElementById('detailImg');
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['assets/images/products/tube-trio.jpg'];

  if (mainImgEl) {
    mainImgEl.src = images[0];
    mainImgEl.alt = product.name;
  }

  renderGalleryThumbnails(images, product.name);

  // 5. Description
  const descContainer = document.getElementById('detailDescriptionBox');
  if (descContainer) {
    descContainer.innerHTML = `
      <p style="color: #4b5563; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
        ${sanitizeHTML(product.description || product.shortDescription || 'Precision-manufactured pharmaceutical packaging engineered for optimal shelf-life, moisture protection, and brand distinction.')}
      </p>
    `;
  }

  // 6. Dynamic Specifications Grid Pills
  renderProductSpecifications(product);

  // 7. Dynamic Features Checklist
  renderProductFeatures(product);

  // 8. Quote Button
  const quoteBtn = document.getElementById('detailReqQuoteBtn');
  if (quoteBtn) {
    quoteBtn.onclick = (e) => {
      e.preventDefault();
      if (typeof openQuoteModal === 'function') {
        openQuoteModal(product.name);
      } else {
        window.location.href = `contact.html?product=${encodeURIComponent(product.name)}`;
      }
    };
  }

  // 9. Prev / Next Navigation
  renderPrevNextNavigation(allActiveProducts, product);

  // 10. Related Products
  renderRelatedProducts(allActiveProducts, product, categoryName);

  if (typeof setupImageFallbacks === 'function') {
    setupImageFallbacks();
  }
}

/**
 * Render Gallery Thumbnails below or beside main image
 */
function renderGalleryThumbnails(images, prodName) {
  let thumbContainer = document.getElementById('detailThumbnailsRow');
  if (!thumbContainer && images.length > 1) {
    const showcaseBox = document.querySelector('.image-showcase-box');
    if (showcaseBox) {
      thumbContainer = document.createElement('div');
      thumbContainer.id = 'detailThumbnailsRow';
      thumbContainer.style.cssText = 'display: flex; gap: 10px; margin-top: 14px; justify-content: center; flex-wrap: wrap; width: 100%;';
      showcaseBox.parentElement.appendChild(thumbContainer);
    }
  }

  if (thumbContainer) {
    if (images.length <= 1) {
      thumbContainer.innerHTML = '';
      return;
    }

    thumbContainer.innerHTML = images.map((src, idx) => `
      <div class="gallery-thumb-item ${idx === 0 ? 'active-thumb' : ''}" style="width: 60px; height: 60px; border-radius: 10px; border: 2px solid ${idx === 0 ? '#7b3fa3' : '#e5e7eb'}; cursor: pointer; padding: 4px; background: #fff; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onclick="switchMainImage('${src}', this)">
        <img src="${src}" alt="${sanitizeHTML(prodName)} - View ${idx + 1}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
      </div>
    `).join('');
  }
}

window.switchMainImage = function(src, thumbEl) {
  const mainImg = document.getElementById('detailImg');
  if (mainImg) {
    mainImg.style.opacity = '0.5';
    mainImg.src = src;
    setTimeout(() => { mainImg.style.opacity = '1'; }, 150);
  }
  document.querySelectorAll('.gallery-thumb-item').forEach(t => {
    t.style.borderColor = '#e5e7eb';
  });
  if (thumbEl) {
    thumbEl.style.borderColor = '#7b3fa3';
  }
};

/**
 * Render Dynamic Specifications Pills
 */
function renderProductSpecifications(product) {
  const specsGrid = document.getElementById('detailSpecsGrid');
  if (!specsGrid) return;

  let specs = [];
  if (Array.isArray(product.specifications) && product.specifications.length > 0) {
    specs = product.specifications;
  } else {
    // Generate specs from physical attributes if not in specs array
    if (product.material) specs.push({ label: 'MATERIAL', value: product.material, icon: 'fa-solid fa-layer-group' });
    if (product.capacity) specs.push({ label: 'VOLUME', value: product.capacity, icon: 'fa-solid fa-cube' });
    if (product.height) specs.push({ label: 'HEIGHT', value: product.height, icon: 'fa-solid fa-ruler' });
    if (product.neckSize) specs.push({ label: 'NECK SIZE', value: product.neckSize, icon: 'fa-solid fa-ruler-combined' });
    if (product.diameter) specs.push({ label: 'DIAMETER', value: product.diameter, icon: 'fa-solid fa-ruler-horizontal' });
    if (product.weight) specs.push({ label: 'WEIGHT', value: product.weight, icon: 'fa-solid fa-scale-balanced' });
  }

  specsGrid.innerHTML = specs.map(s => `
    <div class="spec-pill-card">
      <div class="spec-icon-holder">
        <i class="${s.icon || 'fa-solid fa-cube'}"></i>
      </div>
      <div class="spec-info-holder">
        <span class="spec-field-label">${sanitizeHTML(s.label)}</span>
        <span class="spec-field-value">${sanitizeHTML(s.value)}</span>
      </div>
    </div>
  `).join('');
}

/**
 * Render Dynamic Features Checklist
 */
function renderProductFeatures(product) {
  let featuresBox = document.getElementById('detailFeaturesBox');
  if (!featuresBox && Array.isArray(product.features) && product.features.length > 0) {
    const specsSection = document.querySelector('.details-showcase-box');
    if (specsSection) {
      featuresBox = document.createElement('div');
      featuresBox.id = 'detailFeaturesBox';
      featuresBox.style.cssText = 'margin-bottom: 28px;';
      specsSection.insertBefore(featuresBox, specsSection.querySelector('.action-buttons-group'));
    }
  }

  if (featuresBox && Array.isArray(product.features) && product.features.length > 0) {
    featuresBox.innerHTML = `
      <h4 class="specs-section-title" style="margin-bottom: 12px;">Key Advantages & Features</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        ${product.features.map(f => `
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: #374151;">
            <i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 1rem;"></i>
            <span>${sanitizeHTML(f)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
}

/**
 * Render Prev / Next Navigation
 */
function renderPrevNextNavigation(allProducts, currentProduct) {
  let navContainer = document.getElementById('prevNextNavContainer');
  if (!navContainer) {
    const detailContainer = document.querySelector('.detail-container');
    if (detailContainer) {
      navContainer = document.createElement('div');
      navContainer.id = 'prevNextNavContainer';
      navContainer.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 24px 0; border-top: 1px solid #ede8f5; margin-top: 40px;';
      
      const relatedSection = document.querySelector('.related-products-section');
      if (relatedSection) {
        relatedSection.parentElement.insertBefore(navContainer, relatedSection);
      } else {
        detailContainer.appendChild(navContainer);
      }
    }
  }

  if (navContainer) {
    const currentIndex = allProducts.findIndex(p => p.id === currentProduct.id);
    const prevProduct = currentIndex > 0 ? allProducts[currentIndex - 1] : null;
    const nextProduct = currentIndex < allProducts.length - 1 ? allProducts[currentIndex + 1] : null;

    navContainer.innerHTML = `
      <div>
        ${prevProduct ? `
          <a href="product-detail.html?id=${prevProduct.id}" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 8px; font-size: 0.85rem;">
            <i class="fa-solid fa-arrow-left"></i> Previous: <strong>${sanitizeHTML(prevProduct.name)}</strong>
          </a>
        ` : '<div></div>'}
      </div>
      <div>
        ${nextProduct ? `
          <a href="product-detail.html?id=${nextProduct.id}" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 8px; font-size: 0.85rem;">
            Next: <strong>${sanitizeHTML(nextProduct.name)}</strong> <i class="fa-solid fa-arrow-right"></i>
          </a>
        ` : '<div></div>'}
      </div>
    `;
  }
}

/**
 * Render Related Products from same Category
 */
function renderRelatedProducts(allProducts, currentProduct, categoryName) {
  const relatedGrid = document.getElementById('relatedGrid');
  if (!relatedGrid) return;

  // Filter products in the same category (excluding current product)
  let related = allProducts.filter(p => p.id !== currentProduct.id && p.categoryId === currentProduct.categoryId);
  if (related.length === 0) {
    related = allProducts.filter(p => p.id !== currentProduct.id).slice(0, 4);
  } else {
    related = related.slice(0, 4);
  }

  if (related.length === 0) {
    relatedGrid.innerHTML = `<p style="color: #6b7280; text-align: center; grid-column: 1 / -1;">No related packaging products at this time.</p>`;
    return;
  }

  relatedGrid.innerHTML = related.map(rp => `
    <div class="related-product-card" onclick="window.location.href='product-detail.html?id=${rp.id}'">
      <div class="rel-image-box">
        <img src="${rp.images?.[0] || 'assets/images/products/tube-trio.jpg'}" alt="${sanitizeHTML(rp.name)}" loading="lazy" onerror="this.src=getPlaceholderSVG('${rp.name}')">
        <span class="rel-tag-badge">${sanitizeHTML(categoryName)}</span>
      </div>
      <h3 class="rel-title">${sanitizeHTML(rp.name)}</h3>
      <div class="rel-specs-list">
        <div class="rel-spec-item">
          <span class="rel-spec-label">Material</span>
          <span class="rel-spec-val">${sanitizeHTML(rp.material || 'PP')}</span>
        </div>
        <div class="rel-spec-item">
          <span class="rel-spec-label">Capacity</span>
          <span class="rel-spec-val">${sanitizeHTML(rp.capacity || 'Standard')}</span>
        </div>
        <div class="rel-spec-item">
          <span class="rel-spec-label">Model</span>
          <span class="rel-spec-val">${sanitizeHTML(rp.sku || rp.modelNumber || 'N/A')}</span>
        </div>
      </div>
      <div class="rel-buttons-row">
        <a href="product-detail.html?id=${rp.id}" class="btn-rel-details" onclick="event.stopPropagation();">
          Details &rarr;
        </a>
        <button type="button" class="btn-rel-quote" onclick="event.stopPropagation(); openQuoteModal('${sanitizeHTML(rp.name)}');">
          Quote
        </button>
      </div>
    </div>
  `).join('');
}
