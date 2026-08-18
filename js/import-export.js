/**
 * Parth Plastopack Pvt. Ltd.
 * Import / Export Utility for Products and Inquiries (JSON & CSV)
 */

/**
 * Trigger browser file download
 */
function downloadFile(content, fileName, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Export all products as JSON
 */
async function exportProductsJSON() {
  try {
    const products = await getProducts();
    const categories = await getCategories();
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      company: 'Parth Plastopack Pvt. Ltd.',
      categories: categories,
      products: products
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const fileName = `parth_plastopack_products_${new Date().toISOString().slice(0, 10)}.json`;
    downloadFile(jsonStr, fileName, 'application/json');
    if (typeof showToast === 'function') {
      showToast(`Exported ${products.length} products to JSON successfully!`, 'success');
    }
  } catch (err) {
    console.error('JSON Export Error:', err);
    if (typeof showToast === 'function') {
      showToast(`Export failed: ${err.message}`, 'error');
    }
  }
}

/**
 * Export products as CSV
 */
async function exportProductsCSV() {
  try {
    const products = await getProducts();
    const categories = await getCategories();
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    const headers = [
      'ID',
      'Product Name',
      'SKU',
      'Model Number',
      'Category',
      'Sub Category',
      'Material',
      'Capacity',
      'Size',
      'Weight',
      'Height',
      'Diameter',
      'Neck Size',
      'Status',
      'Short Description',
      'Description'
    ];

    const rows = products.map(p => [
      escapeCSV(p.id),
      escapeCSV(p.name),
      escapeCSV(p.sku),
      escapeCSV(p.modelNumber),
      escapeCSV(categoryMap.get(p.categoryId) || p.categoryId),
      escapeCSV(p.subCategory),
      escapeCSV(p.material),
      escapeCSV(p.capacity),
      escapeCSV(p.size),
      escapeCSV(p.weight),
      escapeCSV(p.height),
      escapeCSV(p.diameter),
      escapeCSV(p.neckSize),
      escapeCSV(p.status),
      escapeCSV(p.shortDescription),
      escapeCSV(p.description)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const fileName = `parth_plastopack_products_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
    
    if (typeof showToast === 'function') {
      showToast(`Exported ${products.length} products to CSV!`, 'success');
    }
  } catch (err) {
    console.error('CSV Export Error:', err);
    if (typeof showToast === 'function') {
      showToast(`CSV Export failed: ${err.message}`, 'error');
    }
  }
}

/**
 * Export Inquiries as CSV
 */
async function exportInquiriesCSV() {
  try {
    const inquiries = await getInquiries();
    const headers = ['Inquiry ID', 'Date', 'Customer Name', 'Company', 'Email', 'Phone', 'Product', 'Quantity', 'Status', 'Message'];
    const rows = inquiries.map(i => [
      escapeCSV(i.id),
      escapeCSV(formatDate(i.createdAt)),
      escapeCSV(i.name),
      escapeCSV(i.company),
      escapeCSV(i.email),
      escapeCSV(i.phone),
      escapeCSV(i.productName),
      escapeCSV(i.quantity),
      escapeCSV(i.status),
      escapeCSV(i.message)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const fileName = `parth_plastopack_inquiries_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
    
    if (typeof showToast === 'function') {
      showToast(`Exported ${inquiries.length} inquiries to CSV!`, 'success');
    }
  } catch (err) {
    console.error('Inquiries Export Error:', err);
    if (typeof showToast === 'function') {
      showToast(`Export failed: ${err.message}`, 'error');
    }
  }
}

/**
 * Escape CSV values
 */
function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Import Products from JSON File
 */
async function importProductsJSON(file, onComplete = () => {}) {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    let productList = [];
    if (Array.isArray(parsed)) {
      productList = parsed;
    } else if (parsed && Array.isArray(parsed.products)) {
      productList = parsed.products;
    } else {
      throw new Error('Invalid JSON format. Expected an array of products or an object with "products" list.');
    }

    if (productList.length === 0) {
      throw new Error('No products found in the uploaded file.');
    }

    const existingProducts = await getProducts();
    const existingSkus = new Set(existingProducts.map(p => (p.sku || '').toLowerCase()));
    
    let imported = 0;
    let duplicates = 0;
    let failed = 0;

    for (const item of productList) {
      try {
        if (!item.name || !item.sku) {
          failed++;
          continue;
        }

        const skuLower = item.sku.toLowerCase();
        if (existingSkus.has(skuLower)) {
          // Update or skip
          duplicates++;
          const existing = existingProducts.find(p => (p.sku || '').toLowerCase() === skuLower);
          if (existing) {
            await updateProduct(existing.id, {
              ...item,
              id: existing.id
            });
            imported++;
          }
        } else {
          await addProduct(item);
          existingSkus.add(skuLower);
          imported++;
        }
      } catch (e) {
        console.error('Failed importing product:', item, e);
        failed++;
      }
    }

    if (typeof showToast === 'function') {
      showToast(`Imported: ${imported} product(s) | Overwritten duplicates: ${duplicates} | Failed: ${failed}`, 'success');
    }

    if (typeof onComplete === 'function') onComplete({ imported, duplicates, failed });
  } catch (err) {
    console.error('Import JSON Error:', err);
    if (typeof showToast === 'function') {
      showToast(`Import failed: ${err.message}`, 'error');
    }
  }
}

/**
 * Import Products from CSV File
 */
async function importProductsCSV(file, onComplete = () => {}) {
  try {
    const text = await file.text();
    const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV file is empty or missing data rows.');
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    const existingProducts = await getProducts();
    const existingSkus = new Set(existingProducts.map(p => (p.sku || '').toLowerCase()));
    const categories = await getCategories();
    const catMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

    let imported = 0;
    let duplicates = 0;
    let failed = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        if (values.length < 2) continue;

        const row = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });

        const name = row['product name'] || row['name'] || row['title'];
        const sku = row['sku'] || row['model number'] || `SKU-${Date.now()}`;
        const catName = (row['category'] || '').toLowerCase();
        const categoryId = catMap.get(catName) || categories[0]?.id || 'cat_effervescent';

        if (!name) {
          failed++;
          continue;
        }

        const productData = {
          name: name,
          sku: sku,
          modelNumber: row['model number'] || '',
          categoryId: categoryId,
          subCategory: row['sub category'] || '',
          material: row['material'] || 'PP Plastic',
          capacity: row['capacity'] || '',
          size: row['size'] || '',
          weight: row['weight'] || '',
          height: row['height'] || '',
          diameter: row['diameter'] || '',
          neckSize: row['neck size'] || '',
          status: row['status'] || 'active',
          shortDescription: row['short description'] || '',
          description: row['description'] || ''
        };

        const skuLower = sku.toLowerCase();
        if (existingSkus.has(skuLower)) {
          duplicates++;
          const existing = existingProducts.find(p => (p.sku || '').toLowerCase() === skuLower);
          if (existing) {
            await updateProduct(existing.id, productData);
            imported++;
          }
        } else {
          await addProduct(productData);
          existingSkus.add(skuLower);
          imported++;
        }
      } catch (e) {
        console.error('Failed row import:', lines[i], e);
        failed++;
      }
    }

    if (typeof showToast === 'function') {
      showToast(`CSV Imported: ${imported} product(s) | Overwritten duplicates: ${duplicates} | Failed: ${failed}`, 'success');
    }

    if (typeof onComplete === 'function') onComplete({ imported, duplicates, failed });
  } catch (err) {
    console.error('Import CSV Error:', err);
    if (typeof showToast === 'function') {
      showToast(`Import failed: ${err.message}`, 'error');
    }
  }
}

/**
 * Basic CSV Line Parser handling quotes
 */
function parseCSVLine(text) {
  const result = [];
  let curr = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        curr += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(curr.trim());
      curr = '';
    } else {
      curr += char;
    }
  }
  result.push(curr.trim());
  return result;
}

window.exportProductsJSON = exportProductsJSON;
window.exportProductsCSV = exportProductsCSV;
window.exportInquiriesCSV = exportInquiriesCSV;
window.importProductsJSON = importProductsJSON;
window.importProductsCSV = importProductsCSV;
