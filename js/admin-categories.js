/**
 * Parth Plastopack Pvt. Ltd.
 * Admin Categories Management Controller
 */

let allCategories = [];
let allProducts = [];
let currentEditingCategoryId = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    bindCategoryEvents();
    await fetchAndRenderCategories();
  } catch (err) {
    console.error('Failed to initialize category management:', err);
  }
});

function bindCategoryEvents() {
  const searchInput = document.getElementById('search-category-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderCategoryTable(e.target.value.trim());
    });
  }

  const form = document.getElementById('category-editor-form');
  if (form) {
    form.addEventListener('submit', handleCategoryFormSubmit);
  }

  const nameInput = document.getElementById('category-form-name');
  const slugInput = document.getElementById('category-form-slug');
  if (nameInput && slugInput) {
    nameInput.addEventListener('input', () => {
      if (!currentEditingCategoryId) {
        slugInput.value = slugify(nameInput.value);
      }
    });
  }

  // Category Image File Input Handler
  const fileInput = document.getElementById('category-image-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        let dataUrl;
        if (typeof ImageProcessor !== 'undefined') {
          dataUrl = await ImageProcessor.processImage(file, { maxWidth: 600, maxHeight: 600, quality: 0.85 });
        } else {
          dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }
        setCategoryImagePreview(dataUrl);
      } catch (err) {
        console.error('Failed to process category image:', err);
        showToast('Failed to process image: ' + err.message, 'error');
      }
    });
  }

  // Remove Category Image Button
  const removeBtn = document.getElementById('btn-remove-category-image');
  if (removeBtn) {
    removeBtn.addEventListener('click', removeCategoryImage);
  }
}

function setCategoryImagePreview(url) {
  const previewImg = document.getElementById('category-preview-img');
  const placeholder = document.getElementById('category-preview-placeholder');
  const removeBtn = document.getElementById('btn-remove-category-image');
  const hiddenInput = document.getElementById('category-form-image');

  if (hiddenInput) hiddenInput.value = url || '';

  if (url) {
    if (previewImg) {
      previewImg.src = url;
      previewImg.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'inline-flex';
  } else {
    removeCategoryImage();
  }
}

function removeCategoryImage() {
  const previewImg = document.getElementById('category-preview-img');
  const placeholder = document.getElementById('category-preview-placeholder');
  const removeBtn = document.getElementById('btn-remove-category-image');
  const hiddenInput = document.getElementById('category-form-image');
  const fileInput = document.getElementById('category-image-file-input');

  if (hiddenInput) hiddenInput.value = '';
  if (previewImg) {
    previewImg.src = '';
    previewImg.style.display = 'none';
  }
  if (placeholder) placeholder.style.display = 'block';
  if (removeBtn) removeBtn.style.display = 'none';
  if (fileInput) fileInput.value = '';
}

window.removeCategoryImage = removeCategoryImage;

async function fetchAndRenderCategories() {
  [allCategories, allProducts] = await Promise.all([
    getCategories(),
    getProducts()
  ]);
  renderCategoryTable();
}

function renderCategoryTable(searchTerm = '') {
  const tbody = document.getElementById('categories-table-tbody');
  const countEl = document.getElementById('categories-total-count');
  if (!tbody) return;

  let list = allCategories;
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)));
  }

  if (countEl) countEl.textContent = list.length;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="table-empty-state">
          <p>No categories found.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map((cat, index) => {
    const productCount = allProducts.filter(p => p.categoryId === cat.id).length;
    return `
      <tr data-id="${cat.id}">
        <td data-label="Order" style="width: 50px; color: var(--admin-text-muted); font-weight: 600;">
          #${index + 1}
        </td>
        <td data-label="Category Name">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="table-thumbnail-box" style="width: 44px; height: 44px; border-radius: 8px; overflow: hidden; background: #f8fafc; display: flex; align-items: center; justify-content: center; border: 1px solid var(--admin-border); flex-shrink: 0;">
              ${cat.image ? `<img src="${cat.image}" alt="${sanitizeHTML(cat.name)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
              <i class="${cat.icon || 'fa-solid fa-cube'}" style="color: var(--admin-purple-primary); font-size: 1.1rem; ${cat.image ? 'display: none;' : ''}"></i>
            </div>
            <div>
              <strong class="table-product-title">${sanitizeHTML(cat.name)}</strong>
              <span class="table-product-subtitle">${sanitizeHTML(cat.description || 'No description')}</span>
            </div>
          </div>
        </td>
        <td data-label="URL Slug">
          <span class="badge-custom badge-sku">${sanitizeHTML(cat.slug)}</span>
        </td>
        <td data-label="Products">
          <span class="badge-custom badge-category" style="font-size: 0.82rem;">
            <i class="fa-solid fa-boxes-stacked"></i> ${productCount} Products
          </span>
        </td>
        <td data-label="Status">
          <span class="badge-custom badge-status-${cat.status || 'active'}">${cat.status || 'active'}</span>
        </td>
        <td data-label="Actions">
          <div class="table-actions-cell">
            <button type="button" class="btn-action-icon" title="Edit" onclick="openEditCategoryModal('${cat.id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" class="btn-action-icon danger" title="Delete" onclick="confirmDeleteCategory('${cat.id}', '${sanitizeHTML(cat.name)}', ${productCount})">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddCategoryModal() {
  currentEditingCategoryId = null;
  document.getElementById('category-modal-title').textContent = 'Add New Category';
  document.getElementById('category-editor-form').reset();
  removeCategoryImage();
  document.getElementById('category-editor-modal').classList.add('modal-active');
}

async function openEditCategoryModal(catId) {
  const cat = await getCategoryById(catId);
  if (!cat) return;

  currentEditingCategoryId = catId;
  document.getElementById('category-modal-title').textContent = `Edit Category: ${cat.name}`;
  document.getElementById('category-form-name').value = cat.name || '';
  document.getElementById('category-form-slug').value = cat.slug || '';
  document.getElementById('category-form-desc').value = cat.description || '';
  document.getElementById('category-form-icon').value = cat.icon || 'fa-solid fa-pills';
  document.getElementById('category-form-status').value = cat.status || 'active';

  if (cat.image) {
    setCategoryImagePreview(cat.image);
  } else {
    removeCategoryImage();
  }

  document.getElementById('category-editor-modal').classList.add('modal-active');
}

function closeCategoryModal() {
  document.getElementById('category-editor-modal').classList.remove('modal-active');
}

async function handleCategoryFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('category-form-name').value.trim();
  const slug = document.getElementById('category-form-slug').value.trim() || slugify(name);
  const description = document.getElementById('category-form-desc').value.trim();
  const icon = document.getElementById('category-form-icon').value.trim() || 'fa-solid fa-cube';
  const status = document.getElementById('category-form-status').value;
  const image = document.getElementById('category-form-image').value.trim();

  if (!name) {
    showToast('Category name is required.', 'warning');
    return;
  }

  const data = { name, slug, description, icon, status, image };

  try {
    if (currentEditingCategoryId) {
      await updateCategory(currentEditingCategoryId, data);
      showToast('Category updated successfully!', 'success');
    } else {
      await addCategory(data);
      showToast('Category created successfully!', 'success');
    }

    closeCategoryModal();
    await fetchAndRenderCategories();
  } catch (err) {
    console.error('Save category error:', err);
    showToast(`Failed: ${err.message}`, 'error');
  }
}

/**
 * Safe Category Deletion with Product Reassignment Check
 */
function confirmDeleteCategory(id, name, productCount) {
  if (productCount > 0) {
    // Show Reassignment dialog
    const otherCategories = allCategories.filter(c => c.id !== id);
    if (otherCategories.length === 0) {
      showToast('Cannot delete the only category while products exist.', 'error');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop-custom modal-active';
    modal.innerHTML = `
      <div class="modal-dialog-custom modal-dialog-sm">
        <div class="modal-header-custom">
          <h3 class="modal-title-custom">Reassign Products</h3>
          <button type="button" class="modal-close-btn" onclick="this.closest('.modal-backdrop-custom').remove()">&times;</button>
        </div>
        <div class="modal-body-custom">
          <p style="margin-bottom: 14px; font-size: 0.9rem;">
            There are <strong>${productCount}</strong> product(s) assigned to <strong>"${name}"</strong>.
            Please select a new category to move them into before deleting.
          </p>
          <div class="form-group-custom">
            <label class="form-label-custom">Move Products To:</label>
            <select id="reassign-cat-select" class="form-control-custom">
              ${otherCategories.map(c => `<option value="${c.id}">${sanitizeHTML(c.name)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="modal-footer-custom">
          <button type="button" class="btn-secondary-custom" onclick="this.closest('.modal-backdrop-custom').remove()">Cancel</button>
          <button type="button" class="btn-danger-custom" id="confirm-reassign-delete-btn">Move & Delete</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#confirm-reassign-delete-btn').onclick = async () => {
      const targetCatId = modal.querySelector('#reassign-cat-select').value;
      modal.remove();
      try {
        await deleteCategory(id, targetCatId);
        showToast(`Category "${name}" deleted and products moved.`, 'success');
        await fetchAndRenderCategories();
      } catch (err) {
        showToast(`Deletion failed: ${err.message}`, 'error');
      }
    };
  } else {
    showConfirmModal({
      title: 'Delete Category',
      message: `Are you sure you want to delete "${name}"?`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteCategory(id);
          showToast(`Category "${name}" deleted.`, 'success');
          await fetchAndRenderCategories();
        } catch (err) {
          showToast(`Deletion failed: ${err.message}`, 'error');
        }
      }
    });
  }
}

window.openAddCategoryModal = openAddCategoryModal;
window.openEditCategoryModal = openEditCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.confirmDeleteCategory = confirmDeleteCategory;
