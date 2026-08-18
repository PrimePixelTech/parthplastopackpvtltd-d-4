const products = [
  { id: 1, name: "TUBE-L-01", category: "tubes", material: "MATERIAL PP RELIANCE", volume: "88 +/- 02", cap: "Push" },
  { id: 2, name: "PPC 02", category: "protein", material: "Food Grade PP", volume: "795 +/- 20", cap: "Push Fitting" },
  { id: 3, name: "PPC 01", category: "protein", material: "Food Grade PP", volume: "555 +/- 20", cap: "0.8 +/- 0.1" },
  { id: 4, name: "HDPE-100", category: "hdpe", material: "HDPE", volume: "100ml", cap: "Screw" },
  { id: 5, name: "PET-250", category: "pet", material: "PET", volume: "250ml", cap: "Flip Top" },
  { id: 6, name: "JAR-50", category: "jars", material: "PP", volume: "50gm", cap: "Screw" },
  { id: 7, name: "CAP-28", category: "caps", material: "PP", volume: "N/A", cap: "N/A" },
  { id: 8, name: "TUBE-S-01", category: "tubes", material: "PP", volume: "45 +/- 02", cap: "Push" }
];

document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('productGrid');
  const searchInput = document.getElementById('productSearch');
  const filterButtons = document.getElementById('filterButtons');

  if (productGrid) {
    renderProducts(products);

    if (filterButtons) {
      filterButtons.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
          // Update active class
          document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');

          const filter = e.target.dataset.filter;
          filterAndRender(filter, searchInput.value);
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        filterAndRender(activeFilter, e.target.value);
      });
    }
  }

  function filterAndRender(category, search) {
    let filtered = products;
    
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (search.trim() !== '') {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.material.toLowerCase().includes(s));
    }
    
    renderProducts(filtered);
  }

  function renderProducts(items) {
    if (items.length === 0) {
      productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--muted);">No products found.</p>';
      return;
    }

    productGrid.innerHTML = items.map(p => `
      <div class="product-card">
        <div class="product-image-box">
          <img src="assets/images/product-1.webp" alt="${p.name}">
        </div>
        <h3>${p.name}</h3>
        <ul class="product-specs">
          <li><span>Material:</span> <strong>${p.material}</strong></li>
          <li><span>Volume:</span> <strong>${p.volume}</strong></li>
          <li><span>Cap:</span> <strong>${p.cap}</strong></li>
        </ul>
        <div class="card-buttons">
          <a href="product-detail.html?id=${p.id}" class="btn btn-secondary" style="flex: 1;">Details &rarr;</a>
          <a href="contact.html?product=${p.name}" class="btn btn-primary" style="flex: 1;">Quote</a>
        </div>
      </div>
    `).join('');
  }
});
