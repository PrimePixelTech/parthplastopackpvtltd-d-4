/**
 * Parth Plastopack Pvt. Ltd.
 * Image Handler: Client-side compression, drag-and-drop, primary switcher, reordering
 */

const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 1200;
const IMAGE_QUALITY = 0.85;

/**
 * Compress an image file using Canvas to WebP / JPEG Data URL
 * @param {File} file 
 * @returns {Promise<string>} Data URL
 */
function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not a valid image.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > MAX_IMAGE_WIDTH) {
            height = Math.round((height * MAX_IMAGE_WIDTH) / width);
            width = MAX_IMAGE_WIDTH;
          }
        } else {
          if (height > MAX_IMAGE_HEIGHT) {
            width = Math.round((width * MAX_IMAGE_HEIGHT) / height);
            height = MAX_IMAGE_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP, fallback to JPEG
        let dataUrl;
        try {
          dataUrl = canvas.toDataURL('image/webp', IMAGE_QUALITY);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
          }
        } catch (err) {
          dataUrl = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to decode image file.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Image Manager Component for Product Creation & Editing Form
 */
class ProductImageGalleryManager {
  constructor(containerId, maxImages = 6) {
    this.container = document.getElementById(containerId);
    this.maxImages = maxImages;
    this.images = [];
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  setImages(imageList) {
    this.images = Array.isArray(imageList) ? [...imageList] : [];
    this.render();
  }

  getImages() {
    return this.images;
  }

  async addFiles(fileList) {
    const remainingSlots = this.maxImages - this.images.length;
    if (remainingSlots <= 0) {
      if (typeof showToast === 'function') {
        showToast(`Maximum ${this.maxImages} images allowed per product.`, 'warning');
      }
      return;
    }

    const filesToProcess = Array.from(fileList).slice(0, remainingSlots);
    for (const file of filesToProcess) {
      try {
        const compressed = await compressImageFile(file);
        this.images.push(compressed);
      } catch (err) {
        console.error('Image compression error:', err);
        if (typeof showToast === 'function') {
          showToast(`Error processing ${file.name}: ${err.message}`, 'error');
        }
      }
    }
    this.render();
    if (typeof showToast === 'function') {
      showToast('Image(s) uploaded and optimized successfully!', 'success');
    }
  }

  removeImage(index) {
    if (index >= 0 && index < this.images.length) {
      this.images.splice(index, 1);
      this.render();
    }
  }

  setPrimary(index) {
    if (index > 0 && index < this.images.length) {
      const [item] = this.images.splice(index, 1);
      this.images.unshift(item);
      this.render();
      if (typeof showToast === 'function') {
        showToast('Primary image updated!', 'info');
      }
    }
  }

  moveImage(fromIndex, toIndex) {
    if (fromIndex >= 0 && fromIndex < this.images.length && toIndex >= 0 && toIndex < this.images.length) {
      const [item] = this.images.splice(fromIndex, 1);
      this.images.splice(toIndex, 0, item);
      this.render();
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="image-uploader-grid">
        <!-- Dropzone Box -->
        <div class="image-dropzone" id="img-dropzone" ${this.images.length >= this.maxImages ? 'style="display:none;"' : ''}>
          <input type="file" id="img-file-input" multiple accept="image/jpeg,image/png,image/webp,image/jpg" style="display: none;">
          <div class="dropzone-inner">
            <i class="fa-solid fa-cloud-arrow-up dropzone-icon"></i>
            <p class="dropzone-text"><strong>Click to upload</strong> or drag and drop</p>
            <span class="dropzone-hint">PNG, JPG, WEBP (Max 6 images, auto-optimized)</span>
          </div>
        </div>

        <!-- Previews list -->
        <div class="image-previews-container" id="img-previews-list">
          ${this.images.map((src, idx) => `
            <div class="image-preview-card ${idx === 0 ? 'is-primary' : ''}" data-index="${idx}">
              <img src="${src}" alt="Product Image ${idx + 1}" loading="lazy">
              ${idx === 0 ? '<span class="primary-badge"><i class="fa-solid fa-star"></i> Primary</span>' : ''}
              
              <div class="image-preview-actions">
                ${idx !== 0 ? `
                  <button type="button" class="btn-preview-action btn-make-primary" title="Set as Primary" data-index="${idx}">
                    <i class="fa-solid fa-star"></i>
                  </button>
                ` : ''}
                <button type="button" class="btn-preview-action btn-del-image" title="Remove" data-index="${idx}">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const dropzone = this.container.querySelector('#img-dropzone');
    const fileInput = this.container.querySelector('#img-file-input');

    if (dropzone && fileInput) {
      dropzone.onclick = () => fileInput.click();

      fileInput.onchange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.addFiles(e.target.files);
        }
      };

      // Drag & Drop events
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add('drag-active');
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove('drag-active');
        }, false);
      });

      dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer && e.dataTransfer.files) {
          this.addFiles(e.dataTransfer.files);
        }
      }, false);
    }

    // Primary & Delete buttons
    this.container.querySelectorAll('.btn-make-primary').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'));
        this.setPrimary(idx);
      };
    });

    this.container.querySelectorAll('.btn-del-image').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'));
        this.removeImage(idx);
      };
    });
  }
}

window.compressImageFile = compressImageFile;
window.ProductImageGalleryManager = ProductImageGalleryManager;
