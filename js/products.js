/**
 * Parth Plasto Pack Pvt. Ltd. - Product Catalog Script
 * Handles product rendering, category navigation (top circular icons + sidebar),
 * dynamic search, URL params, smooth animations, and navigation to product detail page.
 */

const products = [
  // --- EFFERVESCENT TABLET TUBES ---
  {
    id: 1,
    name: "TUBE-L-01",
    category: "tubes",
    categoryName: "Effervescent Tablet Tube",
    tag: "OTHER",
    image: "assets/images/products/tube-trio.jpg",
    material: "MATERIAL PP RELIANCE",
    volume: "88+/-02",
    cap: "Push",
    specs: [
      { label: "MATERIAL", value: "MATERIAL PP RELIANCE", icon: "fa-solid fa-layer-group" },
      { label: "O.F. VOLUME", value: "88+/-02", icon: "fa-solid fa-cube" },
      { label: "HEIGHT", value: "121+/-1", icon: "fa-solid fa-ruler" },
      { label: "NECK SIZE", value: "29+/-0.5", icon: "fa-solid fa-ruler-combined" },
      { label: "MAX DIA", value: "29+/-0.5", icon: "fa-solid fa-ruler-horizontal" },
      { label: "WALL THICK.", value: "1+/-0.1", icon: "fa-solid fa-layer-group" },
      { label: "CAP FITTING", value: "Push", icon: "fa-solid fa-circle-dot" },
      { label: "LABEL TYPE", value: "IML , Label & Shrink Sleeve", icon: "fa-solid fa-palette" },
      { label: "WEIGHT", value: "11.6+/-1", icon: "fa-solid fa-scale-balanced" },
      { label: "POWDER VOL.", value: "15", icon: "fa-solid fa-cube" },
      { label: "MOQ", value: "98", icon: "fa-solid fa-cubes-stacked" }
    ],
    description: "Premium grade effervescent tablet tube engineered with airtight seal and desiccant cap to maintain optimal tablet stability and moisture protection."
  },
  {
    id: 2,
    name: "PPC 02",
    category: "powder",
    categoryName: "Powder Container",
    tag: "Other",
    image: "assets/images/products/products.webp",
    material: "Food Grade PP Plastic",
    volume: "795 +/- 20",
    cap: "Push Fitting",
    specs: [
      { label: "MATERIAL", value: "Food Grade PP Plastic", icon: "fa-solid fa-layer-group" },
      { label: "O.F. VOLUME", value: "795 +/- 20 ML", icon: "fa-solid fa-cube" },
      { label: "HEIGHT", value: "132 +/- 1 MM", icon: "fa-solid fa-ruler" },
      { label: "NECK SIZE", value: "98 +/- 0.5 MM", icon: "fa-solid fa-ruler-combined" },
      { label: "MAX DIA", value: "98 +/- 0.5 MM", icon: "fa-solid fa-ruler-horizontal" },
      { label: "WALL THICK.", value: "1.0 +/- 0.1 MM", icon: "fa-solid fa-layer-group" },
      { label: "CAP FITTING", value: "Push Fitting", icon: "fa-solid fa-circle-dot" },
      { label: "LABEL TYPE", value: "In-Mould Labeling (IML)", icon: "fa-solid fa-palette" },
      { label: "WEIGHT", value: "48 +/- 2 GM", icon: "fa-solid fa-scale-balanced" },
      { label: "POWDER VOL.", value: "350 - 450 GM", icon: "fa-solid fa-cube" },
      { label: "MOQ", value: "1000 PCS", icon: "fa-solid fa-cubes-stacked" }
    ],
    description: "High-capacity nutraceutical and protein powder container with ergonomic grip, smooth mouth opening, and superior seal."
  },
  {
    id: 3,
    name: "PPC 01",
    category: "powder",
    categoryName: "Powder Container",
    tag: "Other",
    image: "assets/images/products/productss.webp",
    material: "Food Grade PP Plastic",
    volume: "555 +/- 20",
    cap: "0.8 +/- 0.1",
    specs: [
      { label: "MATERIAL", value: "Food Grade PP Plastic", icon: "fa-solid fa-layer-group" },
      { label: "O.F. VOLUME", value: "555 +/- 20 ML", icon: "fa-solid fa-cube" },
      { label: "HEIGHT", value: "114 +/- 1 MM", icon: "fa-solid fa-ruler" },
      { label: "NECK SIZE", value: "84 +/- 0.5 MM", icon: "fa-solid fa-ruler-combined" },
      { label: "MAX DIA", value: "82 +/- 0.5 MM", icon: "fa-solid fa-ruler-horizontal" },
      { label: "WALL THICK.", value: "0.8 +/- 0.1 MM", icon: "fa-solid fa-layer-group" },
      { label: "CAP FITTING", value: "0.8 +/- 0.1 Push Fitting", icon: "fa-solid fa-circle-dot" },
      { label: "LABEL TYPE", value: "Label & IML", icon: "fa-solid fa-palette" },
      { label: "WEIGHT", value: "38 +/- 2 GM", icon: "fa-solid fa-scale-balanced" },
      { label: "POWDER VOL.", value: "200 - 250 GM", icon: "fa-solid fa-cube" },
      { label: "MOQ", value: "1000 PCS", icon: "fa-solid fa-cubes-stacked" }
    ],
    description: "Compact, durable protein and health supplement container designed for high shelf appeal and leak-proof storage."
  },
  {
    id: 4,
    name: "TUBE-S-01",
    category: "tubes",
    categoryName: "Effervescent Tablet Tube",
    tag: "Tubes",
    image: "assets/images/products/smtube1.webp",
    material: "Food Grade PP Plastic",
    volume: "45 +/- 02 ML",
    cap: "Push",
    specs: [
      { label: "MATERIAL", value: "Food Grade PP Plastic", icon: "fa-solid fa-layer-group" },
      { label: "O.F. VOLUME", value: "45 +/- 02 ML", icon: "fa-solid fa-cube" },
      { label: "HEIGHT", value: "100 +/- 1 MM", icon: "fa-solid fa-ruler" },
      { label: "NECK SIZE", value: "29 +/- 0.5 MM", icon: "fa-solid fa-ruler-combined" },
      { label: "MAX DIA", value: "29 +/- 0.5 MM", icon: "fa-solid fa-ruler-horizontal" },
      { label: "WALL THICK.", value: "1.0 +/- 0.1 MM", icon: "fa-solid fa-layer-group" },
      { label: "CAP FITTING", value: "Push with Spiral Seal", icon: "fa-solid fa-circle-dot" },
      { label: "LABEL TYPE", value: "IML & Shrink Sleeve", icon: "fa-solid fa-palette" },
      { label: "WEIGHT", value: "8.5 +/- 1 GM", icon: "fa-solid fa-scale-balanced" },
      { label: "POWDER VOL.", value: "10 Tablets", icon: "fa-solid fa-cube" },
      { label: "MOQ", value: "2000 PCS", icon: "fa-solid fa-cubes-stacked" }
    ],
    description: "Compact effervescent tube ideal for travel packs, 10-tablet vitamin packs, and fast-dissolve supplements."
  },
  {
    id: 5,
    name: "TUBE-M-02",
    category: "tubes",
    categoryName: "Effervescent Tablet Tube",
    tag: "Tubes",
    image: "assets/images/products/tube2.webp",
    material: "PP Reliance Food Grade",
    volume: "65 +/- 02 ML",
    cap: "Push Fitting",
    specs: [
      { label: "MATERIAL", value: "PP Reliance Food Grade", icon: "fa-solid fa-layer-group" },
      { label: "O.F. VOLUME", value: "65 +/- 02 ML", icon: "fa-solid fa-cube" },
      { label: "HEIGHT", value: "120 +/- 1 MM", icon: "fa-solid fa-ruler" },
      { label: "NECK SIZE", value: "29 +/- 0.5 MM", icon: "fa-solid fa-ruler-combined" },
      { label: "MAX DIA", value: "29 +/- 0.5 MM", icon: "fa-solid fa-ruler-horizontal" },
      { label: "WALL THICK.", value: "1.1 +/- 0.1 MM", icon: "fa-solid fa-layer-group" },
      { label: "CAP FITTING", value: "Push Fitting", icon: "fa-solid fa-circle-dot" },
      { label: "LABEL TYPE", value: "IML, Label & Shrink Sleeve", icon: "fa-solid fa-palette" },
      { label: "WEIGHT", value: "9.8 +/- 1 GM", icon: "fa-solid fa-scale-balanced" },
      { label: "POWDER VOL.", value: "15 Tablets", icon: "fa-solid fa-cube" },
      { label: "MOQ", value: "2000 PCS", icon: "fa-solid fa-cubes-stacked" }
    ],
    description: "Medium capacity effervescent tablet container suitable for 15-20 tablet formulations with desiccant protection."
  },

  // --- LIDS & CAPS ---
  {
    id: 6,
    name: "CAP-LID-28",
    category: "lid",
    categoryName: "Lid",
    tag: "Lid",
    image: "assets/images/products/Cap.webp",
    material: "Food Grade PP Plastic",
    volume: "28 MM Thread",
    cap: "Screw / Push",
    specs: [
      { label: "MATERIAL", value: "Food Grade PP Plastic", icon: "fa-solid fa-layer-group" },
      { label: "O.F. VOLUME", value: "N/A (Closure)", icon: "fa-solid fa-cube" },
      { label: "HEIGHT", value: "18 +/- 0.5 MM", icon: "fa-solid fa-ruler" },
      { label: "NECK SIZE", value: "28 +/- 0.3 MM", icon: "fa-solid fa-ruler-combined" },
      { label: "MAX DIA", value: "31 +/- 0.5 MM", icon: "fa-solid fa-ruler-horizontal" },
      { label: "WALL THICK.", value: "1.2 +/- 0.1 MM", icon: "fa-solid fa-layer-group" },
      { label: "CAP FITTING", value: "Threaded Screw Cap", icon: "fa-solid fa-circle-dot" },
      { label: "LABEL TYPE", value: "Embossed / Induction Liner", icon: "fa-solid fa-palette" },
      { label: "WEIGHT", value: "4.2 +/- 0.5 GM", icon: "fa-solid fa-scale-balanced" },
      { label: "POWDER VOL.", value: "N/A", icon: "fa-solid fa-cube" },
      { label: "MOQ", value: "5000 PCS", icon: "fa-solid fa-cubes-stacked" }
    ],
    description: "Precision-molded 28mm plastic caps with superior seal integrity to avoid leakage in oral liquid and tablet packaging."
  },
  {
    id: 7,
    name: "CAP-PUSH-84",
    category: "lid",
    categoryName: "Lid",
    tag: "Lid",
    image: "assets/images/products/Cap.webp",
    material: "Virgin PP Plastic",
    volume: "84 MM Neck",
    cap: "Push Fitting",
    specs: [
      { label: "MATERIAL", value: "Virgin PP Plastic", icon: "fa-solid fa-layer-group" },
      { label: "O.F. VOLUME", value: "N/A (Closure)", icon: "fa-solid fa-cube" },
      { label: "HEIGHT", value: "22 +/- 0.5 MM", icon: "fa-solid fa-ruler" },
      { label: "NECK SIZE", value: "84 +/- 0.5 MM", icon: "fa-solid fa-ruler-combined" },
      { label: "MAX DIA", value: "87 +/- 0.5 MM", icon: "fa-solid fa-ruler-horizontal" },
      { label: "WALL THICK.", value: "1.3 +/- 0.1 MM", icon: "fa-solid fa-layer-group" },
      { label: "CAP FITTING", value: "Push Snap-On", icon: "fa-solid fa-circle-dot" },
      { label: "LABEL TYPE", value: "Custom Pantone / Embossed", icon: "fa-solid fa-palette" },
      { label: "WEIGHT", value: "16 +/- 1 GM", icon: "fa-solid fa-scale-balanced" },
      { label: "POWDER VOL.", value: "N/A", icon: "fa-solid fa-cube" },
      { label: "MOQ", value: "2000 PCS", icon: "fa-solid fa-cubes-stacked" }
    ],
    description: "Sturdy push-fitting lid engineered for protein and powder jars, ensuring tamper protection and easy resealability."
  },

  // --- SPOONS / MEASURING SCOOPS ---
  {
    id: 9,
    name: "SPOON-10ML",
    category: "spoon",
    categoryName: "Spoon",
    tag: "Spoon",
    image: "assets/images/products/spoon.jpg",
    material: "Food Grade PP Plastic",
    volume: "10 ML / 5 GM",
    cap: "N/A (Dosing)",
    specs: [
      { label: "MATERIAL", value: "Food Grade PP Plastic", icon: "fa-solid fa-layer-group" },
      { label: "O.F. VOLUME", value: "10 ML (approx 5g)", icon: "fa-solid fa-cube" },
      { label: "HEIGHT", value: "95 MM Length", icon: "fa-solid fa-ruler" },
      { label: "NECK SIZE", value: "24 MM Bowl Dia", icon: "fa-solid fa-ruler-combined" },
      { label: "MAX DIA", value: "26 MM", icon: "fa-solid fa-ruler-horizontal" },
      { label: "WALL THICK.", value: "1.2 +/- 0.1 MM", icon: "fa-solid fa-layer-group" },
      { label: "CAP FITTING", value: "Calibrated Dosing Scoop", icon: "fa-solid fa-circle-dot" },
      { label: "LABEL TYPE", value: "Embossed Graduation", icon: "fa-solid fa-palette" },
      { label: "WEIGHT", value: "3.5 +/- 0.5 GM", icon: "fa-solid fa-scale-balanced" },
      { label: "POWDER VOL.", value: "5 GM", icon: "fa-solid fa-cube" },
      { label: "MOQ", value: "5000 PCS", icon: "fa-solid fa-cubes-stacked" }
    ],
    description: "Calibrated measuring spoon for pediatric syrups, granules, and dietary health powder dosing."
  },

  // --- PET TABLET CONTAINERS ---
  {
    id: 12,
    name: "PET-TC-100",
    category: "pet-tablet",
    categoryName: "PET Tablet Container",
    tag: "PET",
    image: "assets/images/products/pet-bottle.jpg",
    material: "Pharma Grade PET (Amber)",
    volume: "100 ML",
    cap: "Screw / CRC",
    specs: [
      { label: "MATERIAL", value: "Pharma Grade PET (Amber)", icon: "fa-solid fa-layer-group" },
      { label: "O.F. VOLUME", value: "100 ML", icon: "fa-solid fa-cube" },
      { label: "HEIGHT", value: "88 +/- 1 MM", icon: "fa-solid fa-ruler" },
      { label: "NECK SIZE", value: "38 +/- 0.5 MM", icon: "fa-solid fa-ruler-combined" },
      { label: "MAX DIA", value: "48 +/- 0.5 MM", icon: "fa-solid fa-ruler-horizontal" },
      { label: "WALL THICK.", value: "1.2 +/- 0.1 MM", icon: "fa-solid fa-layer-group" },
      { label: "CAP FITTING", value: "Screw Cap with Induction Wad", icon: "fa-solid fa-circle-dot" },
      { label: "LABEL TYPE", value: "Self Adhesive / Shrink Sleeve", icon: "fa-solid fa-palette" },
      { label: "WEIGHT", value: "18 +/- 1 GM", icon: "fa-solid fa-scale-balanced" },
      { label: "POWDER VOL.", value: "60 Capsules", icon: "fa-solid fa-cube" },
      { label: "MOQ", value: "2000 PCS", icon: "fa-solid fa-cubes-stacked" }
    ],
    description: "Amber PET tablet and capsule bottle providing exceptional UV protection and glass-like clarity with light shatterproof resilience."
  },

  // --- TABLET CONTAINERS (HDPE / SOLID) ---
  {
    id: 14,
    name: "TC-BLACK-150",
    category: "tablet-container",
    categoryName: "Tablet Container",
    tag: "Container",
    image: "assets/images/products/tablet-container.jpg",
    material: "Food Grade HDPE Plastic",
    volume: "150 ML",
    cap: "Screw with Wad",
    specs: [
      { label: "MATERIAL", value: "Food Grade HDPE Plastic", icon: "fa-solid fa-layer-group" },
      { label: "O.F. VOLUME", value: "150 ML", icon: "fa-solid fa-cube" },
      { label: "HEIGHT", value: "96 +/- 1 MM", icon: "fa-solid fa-ruler" },
      { label: "NECK SIZE", value: "40 +/- 0.5 MM", icon: "fa-solid fa-ruler-combined" },
      { label: "MAX DIA", value: "54 +/- 0.5 MM", icon: "fa-solid fa-ruler-horizontal" },
      { label: "WALL THICK.", value: "1.2 +/- 0.1 MM", icon: "fa-solid fa-layer-group" },
      { label: "CAP FITTING", value: "Screw with Induction Seal", icon: "fa-solid fa-circle-dot" },
      { label: "LABEL TYPE", value: "Self Adhesive & Shrink Sleeve", icon: "fa-solid fa-palette" },
      { label: "WEIGHT", value: "22 +/- 1 GM", icon: "fa-solid fa-scale-balanced" },
      { label: "POWDER VOL.", value: "90 Tablets", icon: "fa-solid fa-cube" },
      { label: "MOQ", value: "2000 PCS", icon: "fa-solid fa-cubes-stacked" }
    ],
    description: "Matte black solid tablet container offering complete light-block protection for light-sensitive nutraceutical tablets."
  }
];

let activeCategory = "all";
let searchQuery = "";

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    activeCategory = categoryParam.toLowerCase();
  }

  initCatalog();
});

function initCatalog() {
  const topCategoryIcons = document.querySelectorAll('.cat-circle-btn');
  const sidebarCategoryBtns = document.querySelectorAll('.sidebar-cat-btn');
  const searchInput = document.getElementById('productSearch');

  if (topCategoryIcons.length) {
    topCategoryIcons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        selectCategory(cat);
      });
    });
  }

  if (sidebarCategoryBtns.length) {
    sidebarCategoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        selectCategory(cat);
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterAndRender();
    });
  }

  syncCategoryUI(activeCategory);
  filterAndRender();
}

function selectCategory(cat) {
  activeCategory = cat || "all";
  syncCategoryUI(activeCategory);
  filterAndRender();

  const url = new URL(window.location);
  if (activeCategory === "all") {
    url.searchParams.delete("category");
  } else {
    url.searchParams.set("category", activeCategory);
  }
  window.history.replaceState({}, '', url);
}

function syncCategoryUI(cat) {
  document.querySelectorAll('.cat-circle-btn').forEach(btn => {
    if (btn.getAttribute('data-category') === cat) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  document.querySelectorAll('.sidebar-cat-btn').forEach(btn => {
    if (btn.getAttribute('data-category') === cat) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function filterAndRender() {
  const productGrid = document.getElementById('productGrid');
  const countDisplay = document.getElementById('productCountDisplay');

  if (!productGrid) return;

  let filtered = products;

  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => p.category === activeCategory);
  }

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      (p.volume && p.volume.toLowerCase().includes(q))
    );
  }

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} product${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    productGrid.innerHTML = `
      <div class="no-products-box" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px; border: 1px dashed var(--border); animation: fadeIn 0.4s ease forwards;">
        <i class="fas fa-box-open" style="font-size: 3rem; color: var(--muted); margin-bottom: 16px;"></i>
        <h3 style="font-size: 1.25rem; color: var(--dark); margin-bottom: 8px;">No products found</h3>
        <p style="color: var(--muted); font-size: 0.95rem; margin-bottom: 20px;">Try adjusting your search terms or select another category.</p>
        <button class="btn btn-primary" onclick="selectCategory('all')">View All Products</button>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = filtered.map((p, index) => `
    <div class="product-catalog-card animate-card" style="animation-delay: ${index * 0.04}s;" onclick="goToProductDetail(event, ${p.id})">
      <div class="card-image-box">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="card-badge-tag">${p.tag || 'Other'}</span>
      </div>
      
      <div class="card-body">
        <h3 class="card-product-title">${p.name}</h3>
        
        <div class="card-specs-list">
          <div class="spec-row">
            <span class="spec-label">Material</span>
            <span class="spec-val">${p.material}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Volume</span>
            <span class="spec-val">${p.volume}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Cap</span>
            <span class="spec-val">${p.cap}</span>
          </div>
        </div>
        
        <div class="card-actions-row">
          <a href="product-detail.html?id=${p.id}" class="btn-card-details" onclick="event.stopPropagation();">
            Details &rarr;
          </a>
          <a href="contact.html?product=${encodeURIComponent(p.name)}" class="btn-card-quote" onclick="event.stopPropagation();">
            Quote
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

window.goToProductDetail = function(event, productId) {
  if (event && event.target && (event.target.tagName === 'A' || event.target.tagName === 'BUTTON')) {
    return;
  }
  window.location.href = `product-detail.html?id=${productId}`;
};
