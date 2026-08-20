/**
 * Parth Plastopack Pvt. Ltd.
 * Admin Products Management Controller
 */

let allProducts = [];
let allCategories = [];
let categoryMap = new Map();
let currentFilter = {
  search: '',
  categoryId: 'all',
  status: 'all',
  sortBy: 'featured'
};

let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let imageGalleryManager = null;
let currentEditingProductId = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    await loadInitialCategories();
    imageGalleryManager = new ProductImageGalleryManager('product-modal-images-container');
    
    bindFilterEvents();
    bindFormEvents();
    await fetchAndRenderProducts();

    // Check if URL has ?edit=id or ?action=new
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit')) {
      openEditProductModal(params.get('edit'));
    } else if (params.get('action') === 'new') {
      openAddProductModal();
    }
  } catch (err) {
    console.error('Failed to initialize products management:', err);
  }
});

/**
 * Load categories for dropdowns & mapping
 */
async function loadInitialCategories() {
  allCategories = await getCategories();
  categoryMap = new Map(allCategories.map(c => [c.id, c.name]));

  // Populate Filter Category Dropdown
  const filterCatSelect = document.getElementById('filter-category-select');
  if (filterCatSelect) {
    filterCatSelect.innerHTML = '<option value="all">All Categories</option>' + 
      allCategories.map(c => `<option value="${c.id}">${sanitizeHTML(c.name)}</option>`).join('');
  }

  // Populate Form Category Dropdown
  const formCatSelect = document.getElementById('product-form-category');
  if (formCatSelect) {
    formCatSelect.innerHTML = allCategories.map(c => `<option value="${c.id}">${sanitizeHTML(c.name)}</option>`).join('');
  }
}

/**
 * Bind Search, Filter & Bulk Action Listeners
 */
function bindFilterEvents() {
  const searchInput = document.getElementById('filter-search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentFilter.search = e.target.value;
        currentPage = 1;
        fetchAndRenderProducts();
      }, 250);
    });
  }

  const catSelect = document.getElementById('filter-category-select');
  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      currentFilter.categoryId = e.target.value;
      currentPage = 1;
      fetchAndRenderProducts();
    });
  }

  const statusSelect = document.getElementById('filter-status-select');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      currentFilter.status = e.target.value;
      currentPage = 1;
      fetchAndRenderProducts();
    });
  }

  // Select All Checkbox
  const selectAll = document.getElementById('select-all-products');
  if (selectAll) {
    selectAll.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('.product-row-checkbox');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
      updateBulkActionVisibility();
    });
  }

  // Bulk Actions
  const bulkBtn = document.getElementById('bulk-action-apply-btn');
  const bulkSelect = document.getElementById('bulk-action-select');
  if (bulkBtn && bulkSelect) {
    bulkBtn.addEventListener('click', handleBulkAction);
  }

  // Export Buttons
  const exportJsonBtn = document.getElementById('btn-export-json');
  if (exportJsonBtn) exportJsonBtn.onclick = () => exportProductsJSON();

  const exportCsvBtn = document.getElementById('btn-export-csv');
  if (exportCsvBtn) exportCsvBtn.onclick = () => exportProductsCSV();

  // Import Inputs
  const importJsonInput = document.getElementById('import-json-file');
  if (importJsonInput) {
    importJsonInput.onchange = (e) => {
      if (e.target.files?.[0]) {
        importProductsJSON(e.target.files[0], () => fetchAndRenderProducts());
      }
    };
  }

  const importCsvInput = document.getElementById('import-csv-file');
  if (importCsvInput) {
    importCsvInput.onchange = (e) => {
      if (e.target.files?.[0]) {
        importProductsCSV(e.target.files[0], () => fetchAndRenderProducts());
      }
    };
  }
}

/**
 * Fetch and render products with current filter and pagination
 */
async function fetchAndRenderProducts() {
  allProducts = await getProducts(currentFilter);
  renderProductTable();
}

/**
 * Render Product Table Rows & Pagination
 */
function renderProductTable() {
  const tbody = document.getElementById('products-table-tbody');
  const totalCountEl = document.getElementById('products-total-count');
  if (!tbody) return;

  if (totalCountEl) totalCountEl.textContent = allProducts.length;

  if (allProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="table-empty-state" style="padding: 60px 20px;">
          <div class="empty-icon-box" style="width: 72px; height: 72px; font-size: 2rem; margin: 0 auto 16px;"><i class="fa-solid fa-boxes-packing"></i></div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">No Products in Catalog</h3>
          <p style="color: var(--admin-text-muted); max-width: 440px; margin: 0 auto 20px; font-size: 0.95rem;">
            Your product catalog is currently empty. Click the button below to add your first product with images, specifications, and features.
          </p>
          <button type="button" class="btn-admin btn-purple-custom" style="padding: 12px 26px; font-size: 1rem; font-weight: 700; box-shadow: 0 4px 16px rgba(123, 63, 163, 0.4); display: inline-flex; align-items: center; gap: 8px;" onclick="openAddProductModal()">
            <i class="fa-solid fa-plus"></i> Add First Product
          </button>
        </td>
      </tr>
    `;
    renderPagination(0);
    return;
  }

  // Pagination slicing
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageProducts = allProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  tbody.innerHTML = pageProducts.map(p => `
    <tr data-id="${p.id}" draggable="true" ondragstart="handleDragStart(event, '${p.id}')" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, '${p.id}')" ondragend="handleDragEnd(event)" style="cursor: grab;">
      <td style="width: 40px;">
        <input type="checkbox" class="product-row-checkbox" value="${p.id}" onchange="updateBulkActionVisibility()">
      </td>
      <td data-label="Product Image" style="width: 70px;">
        <div class="table-thumbnail-box">
          <img src="${p.images?.[0] || 'assets/images/products/tube-trio.jpg'}" alt="${sanitizeHTML(p.name)}" loading="lazy">
        </div>
      </td>
      <td data-label="Product Name">
        <strong class="table-product-title">${sanitizeHTML(p.name)}</strong>
        <span class="table-product-subtitle">${sanitizeHTML(p.modelNumber || 'No Model')}</span>
      </td>
      <td data-label="SKU">
        <span class="badge-custom badge-sku">${sanitizeHTML(p.sku)}</span>
      </td>
      <td data-label="Category">
        <span class="badge-custom badge-category">
          ${sanitizeHTML(categoryMap.get(p.categoryId) || p.categoryId)}
        </span>
      </td>
      <td data-label="Status">
        <span class="badge-custom badge-status-${p.status || 'active'}">${p.status || 'active'}</span>
      </td>
      <td data-label="Updated">
        <span style="font-size: 0.82rem; color: var(--admin-text-muted);">${formatDate(p.updatedAt || p.createdAt)}</span>
      </td>
      <td data-label="Actions">
        <div class="table-actions-cell">
          <button type="button" class="btn-action-icon" title="Edit" onclick="openEditProductModal('${p.id}')">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button type="button" class="btn-action-icon" title="Move Up" onclick="moveProductOrder('${p.id}', -1)">
            <i class="fa-solid fa-arrow-up"></i>
          </button>
          <button type="button" class="btn-action-icon" title="Move Down" onclick="moveProductOrder('${p.id}', 1)">
            <i class="fa-solid fa-arrow-down"></i>
          </button>
          <button type="button" class="btn-action-icon" title="Preview" onclick="previewProduct('${p.id}')">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button type="button" class="btn-action-icon" title="Duplicate" onclick="duplicateProduct('${p.id}')">
            <i class="fa-solid fa-copy"></i>
          </button>
          <button type="button" class="btn-action-icon danger" title="Delete" onclick="confirmDeleteProduct('${p.id}', '${sanitizeHTML(p.name)}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination(allProducts.length);
  if (typeof setupImageFallbacks === 'function') setupImageFallbacks();
}

/**
 * Render Pagination Controls
 */
function renderPagination(totalItems) {
  const container = document.getElementById('products-pagination-container');
  if (!container) return;

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startNum = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endNum = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  container.innerHTML = `
    <span>Showing <strong>${startNum} - ${endNum}</strong> of <strong>${totalItems}</strong> products</span>
    <div class="pagination-controls">
      <button type="button" class="btn-admin btn-secondary-custom btn-sm-custom" ${currentPage === 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} onclick="changePage(${currentPage - 1})">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <span style="font-weight: 600; padding: 0 8px;">Page ${currentPage} of ${totalPages}</span>
      <button type="button" class="btn-admin btn-secondary-custom btn-sm-custom" ${currentPage === totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} onclick="changePage(${currentPage + 1})">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `;
}

function changePage(newPage) {
  currentPage = newPage;
  renderProductTable();
}

function updateBulkActionVisibility() {
  const checked = document.querySelectorAll('.product-row-checkbox:checked');
  const countSpan = document.getElementById('selected-items-count');
  if (countSpan) countSpan.textContent = checked.length;
}

/**
 * Handle Bulk Actions (Activate, Deactivate, Delete, Export)
 */
async function handleBulkAction() {
  const action = document.getElementById('bulk-action-select')?.value;
  const checkedBoxes = Array.from(document.querySelectorAll('.product-row-checkbox:checked'));
  const selectedIds = checkedBoxes.map(cb => cb.value);

  if (selectedIds.length === 0) {
    showToast('Please select at least one product.', 'warning');
    return;
  }

  if (action === 'delete') {
    showConfirmModal({
      title: 'Bulk Delete Products',
      message: `Are you sure you want to permanently delete ${selectedIds.length} product(s)?`,
      confirmText: 'Delete Selected',
      type: 'danger',
      onConfirm: async () => {
        await bulkDeleteProducts(selectedIds);
        showToast(`Deleted ${selectedIds.length} products.`, 'success');
        await fetchAndRenderProducts();
      }
    });
  } else if (action === 'activate') {
    await bulkUpdateProductStatus(selectedIds, 'active');
    showToast(`Activated ${selectedIds.length} products.`, 'success');
    await fetchAndRenderProducts();
  } else if (action === 'deactivate') {
    await bulkUpdateProductStatus(selectedIds, 'inactive');
    showToast(`Deactivated ${selectedIds.length} products.`, 'info');
    await fetchAndRenderProducts();
  }
}

/* ==========================================================================
   PRODUCT CREATION & EDITING FORM MODAL
   ========================================================================== */

function bindFormEvents() {
  const nameInput = document.getElementById('product-form-name');
  const slugInput = document.getElementById('product-form-slug');

  // Auto slug generator from Product Name
  if (nameInput && slugInput) {
    nameInput.addEventListener('input', () => {
      if (!currentEditingProductId) { // only auto-generate on new product
        slugInput.value = slugify(nameInput.value);
      }
    });
  }

  // Specifications Dynamic Row Add
  const addSpecBtn = document.getElementById('btn-add-spec-row');
  if (addSpecBtn) {
    addSpecBtn.addEventListener('click', () => addSpecificationRow());
  }

  // Features Dynamic Tag Add
  const addFeatureBtn = document.getElementById('btn-add-feature-tag');
  const featureInput = document.getElementById('feature-tag-input');
  if (addFeatureBtn && featureInput) {
    addFeatureBtn.addEventListener('click', () => {
      const val = featureInput.value.trim();
      if (val) {
        addFeatureTag(val);
        featureInput.value = '';
      }
    });
    featureInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addFeatureBtn.click();
      }
    });
  }

  // Form Submission
  const form = document.getElementById('product-editor-form');
  if (form) {
    form.addEventListener('submit', handleProductFormSubmit);
  }
}

/**
 * Open Add Product Modal
 */
function openAddProductModal() {
  currentEditingProductId = null;
  document.getElementById('product-modal-title').textContent = 'Add New Product';
  document.getElementById('product-editor-form').reset();
  
  // Clear Specs & Features
  document.getElementById('specs-dynamic-rows-container').innerHTML = '';
  document.getElementById('features-tags-container').innerHTML = '';

  // Add standard default spec rows
  addSpecificationRow('MATERIAL', 'Food Grade PP Plastic', 'fa-solid fa-layer-group');
  addSpecificationRow('O.F. VOLUME', '', 'fa-solid fa-cube');
  addSpecificationRow('HEIGHT', '', 'fa-solid fa-ruler');
  addSpecificationRow('NECK SIZE', '', 'fa-solid fa-ruler-combined');
  addSpecificationRow('MOQ', '1000 PCS', 'fa-solid fa-cubes-stacked');

  // Add default features
  ['Food Grade Material', 'Leak Proof', 'High Impact Resistance'].forEach(f => addFeatureTag(f));

  // Initialize empty image gallery
  if (imageGalleryManager) {
    imageGalleryManager.setImages(['assets/images/products/tube-trio.jpg']);
  }

  openProductModal();
}

/**
 * Open Edit Product Modal
 */
async function openEditProductModal(productId) {
  const product = await getProductById(productId);
  if (!product) {
    showToast('Product not found.', 'error');
    return;
  }

  currentEditingProductId = productId;
  document.getElementById('product-modal-title').textContent = `Edit Product: ${product.name}`;

  // Populate basic inputs
  document.getElementById('product-form-name').value = product.name || '';
  document.getElementById('product-form-sku').value = product.sku || '';
  document.getElementById('product-form-model').value = product.modelNumber || '';
  document.getElementById('product-form-slug').value = product.slug || '';
  document.getElementById('product-form-category').value = product.categoryId || allCategories[0]?.id;
  document.getElementById('product-form-subcategory').value = product.subCategory || '';
  document.getElementById('product-form-type').value = product.productType || '';
  document.getElementById('product-form-status').value = product.status || 'active';
  document.getElementById('product-form-price').value = product.price || '';
  document.getElementById('product-form-short-desc').value = product.shortDescription || '';
  document.getElementById('product-form-desc').value = product.description || '';

  // Physical specifications
  document.getElementById('product-form-material').value = product.material || '';
  document.getElementById('product-form-color').value = product.color || '';
  document.getElementById('product-form-shape').value = product.shape || '';
  document.getElementById('product-form-capacity').value = product.capacity || '';
  document.getElementById('product-form-size').value = product.size || '';
  document.getElementById('product-form-weight').value = product.weight || '';
  document.getElementById('product-form-height').value = product.height || '';
  document.getElementById('product-form-diameter').value = product.diameter || '';
  document.getElementById('product-form-neck').value = product.neckSize || '';
  document.getElementById('product-form-packaging').value = product.packagingType || '';
  document.getElementById('product-form-usage').value = product.usage || '';
  document.getElementById('product-form-origin').value = product.countryOfOrigin || 'India';

  // SEO
  document.getElementById('product-form-seo-title').value = product.seo?.title || '';
  document.getElementById('product-form-seo-desc').value = product.seo?.description || '';
  document.getElementById('product-form-seo-keywords').value = product.seo?.keywords || '';
  document.getElementById('product-form-seo-canonical').value = product.seo?.canonicalUrl || '';

  // Images
  if (imageGalleryManager) {
    imageGalleryManager.setImages(product.images || []);
  }

  // Specifications
  const specsContainer = document.getElementById('specs-dynamic-rows-container');
  specsContainer.innerHTML = '';
  if (Array.isArray(product.specifications) && product.specifications.length > 0) {
    product.specifications.forEach(s => addSpecificationRow(s.label, s.value, s.icon));
  } else {
    addSpecificationRow('MATERIAL', product.material || 'PP Plastic');
    addSpecificationRow('O.F. VOLUME', product.capacity || '');
  }

  // Features
  const featuresContainer = document.getElementById('features-tags-container');
  featuresContainer.innerHTML = '';
  if (Array.isArray(product.features) && product.features.length > 0) {
    product.features.forEach(f => addFeatureTag(f));
  }

  openProductModal();
}

function openProductModal() {
  const modal = document.getElementById('product-editor-modal');
  if (modal) modal.classList.add('modal-active');
}

function closeProductModal() {
  const modal = document.getElementById('product-editor-modal');
  if (modal) modal.classList.remove('modal-active');
}

/**
 * Add Dynamic Specification Key-Value Row
 */
function addSpecificationRow(label = '', value = '', icon = 'fa-solid fa-cube') {
  const container = document.getElementById('specs-dynamic-rows-container');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'dynamic-row-item spec-row-item';
  row.innerHTML = `
    <input type="text" class="form-control-custom spec-label-input" placeholder="Spec Name (e.g. MATERIAL)" value="${sanitizeHTML(label)}" required>
    <input type="text" class="form-control-custom spec-value-input" placeholder="Spec Value (e.g. Food Grade PP)" value="${sanitizeHTML(value)}" required>
    <button type="button" class="btn-delete-row" title="Delete Spec Row" onclick="this.parentElement.remove()">
      <i class="fa-solid fa-trash"></i>
    </button>
  `;
  container.appendChild(row);
}

/**
 * Add Dynamic Feature Tag
 */
function addFeatureTag(text) {
  const container = document.getElementById('features-tags-container');
  if (!container || !text) return;

  const tag = document.createElement('span');
  tag.className = 'feature-tag-item';
  tag.innerHTML = `
    <span class="tag-text">${sanitizeHTML(text)}</span>
    <button type="button" onclick="this.parentElement.remove()" title="Remove">&times;</button>
  `;
  container.appendChild(tag);
}

/**
 * Handle Save Product (Add or Update)
 */
async function handleProductFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('product-form-name').value.trim();
  const sku = document.getElementById('product-form-sku').value.trim();
  const categoryId = document.getElementById('product-form-category').value;

  if (!name || !sku) {
    showToast('Product Name and SKU are required.', 'warning');
    return;
  }

  // Gather Specifications
  const specs = [];
  document.querySelectorAll('.spec-row-item').forEach(row => {
    const lbl = row.querySelector('.spec-label-input')?.value.trim();
    const val = row.querySelector('.spec-value-input')?.value.trim();
    if (lbl && val) {
      specs.push({
        label: lbl,
        value: val,
        icon: 'fa-solid fa-cube'
      });
    }
  });

  // Gather Features
  const features = [];
  document.querySelectorAll('.feature-tag-item .tag-text').forEach(t => {
    const txt = t.textContent.trim();
    if (txt) features.push(txt);
  });

  // Gather Images
  const images = imageGalleryManager ? imageGalleryManager.getImages() : [];
  if (images.length === 0) {
    images.push('assets/images/products/tube-trio.jpg');
  }

  const productData = {
    name: name,
    sku: sku,
    modelNumber: document.getElementById('product-form-model').value.trim(),
    slug: document.getElementById('product-form-slug').value.trim() || slugify(name),
    categoryId: categoryId,
    subCategory: document.getElementById('product-form-subcategory').value.trim(),
    productType: document.getElementById('product-form-type').value.trim(),
    status: document.getElementById('product-form-status').value,
    price: document.getElementById('product-form-price').value.trim(),
    shortDescription: document.getElementById('product-form-short-desc').value.trim(),
    description: document.getElementById('product-form-desc').value.trim(),
    material: document.getElementById('product-form-material').value.trim(),
    color: document.getElementById('product-form-color').value.trim(),
    shape: document.getElementById('product-form-shape').value.trim(),
    capacity: document.getElementById('product-form-capacity').value.trim(),
    size: document.getElementById('product-form-size').value.trim(),
    weight: document.getElementById('product-form-weight').value.trim(),
    height: document.getElementById('product-form-height').value.trim(),
    diameter: document.getElementById('product-form-diameter').value.trim(),
    neckSize: document.getElementById('product-form-neck').value.trim(),
    packagingType: document.getElementById('product-form-packaging').value.trim(),
    usage: document.getElementById('product-form-usage').value.trim(),
    countryOfOrigin: document.getElementById('product-form-origin').value.trim(),
    images: images,
    specifications: specs,
    features: features,
    seo: {
      title: document.getElementById('product-form-seo-title').value.trim() || `${name} | Parth Plastopack`,
      description: document.getElementById('product-form-seo-desc').value.trim() || '',
      keywords: document.getElementById('product-form-seo-keywords').value.trim() || '',
      canonicalUrl: document.getElementById('product-form-seo-canonical').value.trim() || ''
    }
  };

  try {
    if (currentEditingProductId) {
      await updateProduct(currentEditingProductId, productData);
      showToast('Product updated successfully!', 'success');
    } else {
      await addProduct(productData);
      showToast('Product created successfully!', 'success');
    }

    closeProductModal();
    await fetchAndRenderProducts();
  } catch (err) {
    console.error('Error saving product:', err);
    showToast(`Failed to save: ${err.message}`, 'error');
  }
}

/**
 * Duplicate Product
 */
async function duplicateProduct(id) {
  const original = await getProductById(id);
  if (!original) return;

  const clone = {
    ...original,
    id: undefined,
    name: `${original.name} (Copy)`,
    sku: `${original.sku}-COPY`,
    slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
    status: 'draft',
    createdAt: new Date().toISOString()
  };

  await addProduct(clone);
  showToast(`Duplicated ${original.name} as Draft`, 'success');
  await fetchAndRenderProducts();
}

/**
 * Delete confirmation
 */
function confirmDeleteProduct(id, name) {
  showConfirmModal({
    title: 'Delete Product',
    message: `Are you sure you want to delete "${name}"? This product will be removed permanently.`,
    confirmText: 'Delete',
    type: 'danger',
    onConfirm: async () => {
      await deleteProduct(id);
      showToast(`Product "${name}" deleted.`, 'success');
      await fetchAndRenderProducts();
    }
  });
}

/**
 * Live Preview Modal (Desktop & Mobile Simulation)
 */
async function previewProduct(id) {
  const product = await getProductById(id);
  if (!product) return;

  const modal = document.getElementById('product-preview-modal');
  const frameContainer = document.getElementById('preview-render-area');
  if (!modal || !frameContainer) return;

  frameContainer.innerHTML = `
    <div style="padding: 20px; background: #faf9fd; border-radius: 12px;">
      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 250px; background: #fff; padding: 20px; border-radius: 16px; border: 1px solid #ede8f5; text-align: center;">
          <img src="${product.images?.[0] || 'assets/images/products/tube-trio.jpg'}" style="max-height: 250px; max-width: 100%; object-fit: contain;">
        </div>
        <div style="flex: 1.5; min-width: 280px;">
          <span style="color: #7b3fa3; font-weight: 700; font-size: 0.75rem; text-transform: uppercase;">
            ${sanitizeHTML(categoryMap.get(product.categoryId) || 'Product')}
          </span>
          <h2 style="font-size: 1.5rem; margin: 4px 0 10px; color: #191426;">${sanitizeHTML(product.name)}</h2>
          <p style="color: #6b7280; font-size: 0.9rem; margin-bottom: 16px;">${sanitizeHTML(product.shortDescription || product.description)}</p>
          
          <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 8px;">Specifications</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.82rem;">
            ${(product.specifications || []).map(s => `
              <div style="background: #fff; padding: 6px 10px; border-radius: 6px; border: 1px solid #eef1f6;">
                <strong>${sanitizeHTML(s.label)}:</strong> ${sanitizeHTML(s.value)}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('modal-active');
}

window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.closeProductModal = closeProductModal;
window.duplicateProduct = duplicateProduct;
window.confirmDeleteProduct = confirmDeleteProduct;
window.previewProduct = previewProduct;
window.changePage = changePage;
window.updateBulkActionVisibility = updateBulkActionVisibility;
window.moveProductOrder = async function(id, direction) {
  const index = allProducts.findIndex(p => p.id === id);
  if (index === -1) return;
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= allProducts.length) return;
  
  // Force strict sequential ordering based on current visual list
  allProducts.forEach((p, i) => {
    p.order = i + 1;
  });
  
  // Swap order values between the two target items
  const currentItem = allProducts[index];
  const targetItem = allProducts[targetIndex];
  
  const tempOrder = currentItem.order;
  currentItem.order = targetItem.order;
  targetItem.order = tempOrder;
  
  // Save the new strict sequence to the database
  try {
    await Promise.all(allProducts.map(p => updateProduct(p.id, { order: p.order })));
    showToast('Product order updated', 'success');
  } catch (err) {
    console.error(err);
    showToast('Error saving product order', 'error');
  }
  
  await fetchAndRenderProducts();
};

// --- Drag and Drop Reordering ---
let draggedProductId = null;

window.handleDragStart = function(e, id) {
  draggedProductId = id;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', id);
  e.target.style.opacity = '0.5';
};

window.handleDragOver = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const targetRow = e.target.closest('tr');
  if (targetRow && targetRow.dataset.id !== draggedProductId) {
    targetRow.style.borderTop = '2px solid var(--admin-purple-primary)';
  }
};

window.handleDragLeave = function(e) {
  const targetRow = e.target.closest('tr');
  if (targetRow) {
    targetRow.style.borderTop = '';
  }
};

window.handleDrop = async function(e, targetId) {
  e.preventDefault();
  const targetRow = e.target.closest('tr');
  if (targetRow) {
    targetRow.style.borderTop = '';
  }
  
  if (!draggedProductId || draggedProductId === targetId) return;

  const sourceIndex = allProducts.findIndex(p => p.id === draggedProductId);
  const targetIndex = allProducts.findIndex(p => p.id === targetId);

  if (sourceIndex === -1 || targetIndex === -1) return;

  // Move in array
  const [movedItem] = allProducts.splice(sourceIndex, 1);
  allProducts.splice(targetIndex, 0, movedItem);

  // Update order
  allProducts.forEach((p, i) => {
    p.order = i + 1;
  });

  try {
    await Promise.all(allProducts.map(p => updateProduct(p.id, { order: p.order })));
    showToast('Product order updated', 'success');
  } catch (err) {
    console.error(err);
    showToast('Error saving product order', 'error');
  }

  await fetchAndRenderProducts();
};

window.handleDragEnd = function(e) {
  e.target.style.opacity = '1';
  document.querySelectorAll('tr').forEach(el => el.style.borderTop = '');
  draggedProductId = null;
};
