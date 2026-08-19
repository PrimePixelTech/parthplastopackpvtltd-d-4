/**
 * Parth Plastopack Pvt. Ltd.
 * Database Layer (IndexedDB with robust promise-based API)
 * 
 * Stores:
 * - products: Complete product catalog, specs, features, images, SEO
 * - categories: Packaging categories with hierarchy & order
 * - inquiries: Customer quote requests from website
 * - settings: Store & catalog settings
 */

const DB_NAME = 'ParthPlastoPackDB';
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Initialize IndexedDB Database & Stores
 */
function initDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Products Store
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id' });
        productStore.createIndex('categoryId', 'categoryId', { unique: false });
        productStore.createIndex('sku', 'sku', { unique: false });
        productStore.createIndex('slug', 'slug', { unique: false });
        productStore.createIndex('status', 'status', { unique: false });
        productStore.createIndex('order', 'order', { unique: false });
        productStore.createIndex('createdAt', 'createdAt', { unique: false });
        productStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Categories Store
      if (!db.objectStoreNames.contains('categories')) {
        const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
        categoryStore.createIndex('slug', 'slug', { unique: false });
        categoryStore.createIndex('order', 'order', { unique: false });
        categoryStore.createIndex('status', 'status', { unique: false });
      }

      // Inquiries Store
      if (!db.objectStoreNames.contains('inquiries')) {
        const inquiryStore = db.createObjectStore('inquiries', { keyPath: 'id' });
        inquiryStore.createIndex('productId', 'productId', { unique: false });
        inquiryStore.createIndex('status', 'status', { unique: false });
        inquiryStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Settings Store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = async (event) => {
      dbInstance = event.target.result;
      // Auto seed initial data if empty
      await seedInitialData();
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB Error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Execute transaction helper
 */
async function getStore(storeName, mode = 'readonly') {
  const db = await initDB();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

/* ==========================================================================
   PRODUCTS CRUD
   ========================================================================== */

// Supabase Data Mappers
function mapSupabaseToProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || 'Untitled Product',
    slug: row.slug || (typeof generateSlug === 'function' ? generateSlug(row.name || 'product') : row.name),
    sku: row.sku || '',
    modelNumber: row.model_number || '',
    categoryId: row.category_id || 'cat_effervescent',
    categoryName: row.category_name || '',
    subCategory: row.sub_category || '',
    productType: row.product_type || 'Container',
    price: row.price || '',
    shortDescription: row.short_description || '',
    description: row.description || '',
    primaryImage: row.image_url || row.primary_image || (Array.isArray(row.images) && row.images[0]) || 'assets/images/products/tube-trio.jpg',
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [row.image_url || row.primary_image || 'assets/images/products/tube-trio.jpg'],
    material: row.material || '',
    color: row.color || '',
    shape: row.shape || '',
    capacity: row.capacity || '',
    size: row.size || '',
    weight: row.weight || '',
    height: row.height || '',
    width: row.width || '',
    diameter: row.diameter || '',
    neckSize: row.neck_size || '',
    packagingType: row.packaging_type || '',
    usage: row.usage || '',
    countryOfOrigin: row.country_of_origin || 'India',
    specifications: Array.isArray(row.specifications) ? row.specifications : (typeof row.specifications === 'string' ? JSON.parse(row.specifications || '[]') : []),
    features: Array.isArray(row.features) ? row.features : (typeof row.features === 'string' ? JSON.parse(row.features || '[]') : []),
    status: row.status || 'active',
    featured: row.featured === true || row.featured === 'true',
    order: row.order || 0,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

function mapProductToSupabase(p) {
  return {
    id: p.id,
    name: p.name || 'Untitled Product',
    slug: p.slug || (typeof generateSlug === 'function' ? generateSlug(p.name || 'product') : p.id),
    sku: p.sku || '',
    model_number: p.modelNumber || '',
    category_id: p.categoryId || 'cat_effervescent',
    category_name: p.categoryName || '',
    sub_category: p.subCategory || '',
    product_type: p.productType || 'Container',
    price: p.price || '',
    short_description: p.shortDescription || '',
    description: p.description || '',
    image_url: p.primaryImage || (Array.isArray(p.images) && p.images[0]) || '',
    primary_image: p.primaryImage || (Array.isArray(p.images) && p.images[0]) || '',
    images: Array.isArray(p.images) ? p.images : [],
    material: p.material || '',
    color: p.color || '',
    shape: p.shape || '',
    capacity: p.capacity || '',
    size: p.size || '',
    weight: p.weight || '',
    height: p.height || '',
    width: p.width || '',
    diameter: p.diameter || '',
    neck_size: p.neckSize || '',
    packaging_type: p.packagingType || '',
    usage: p.usage || '',
    country_of_origin: p.countryOfOrigin || 'India',
    specifications: Array.isArray(p.specifications) ? p.specifications : [],
    features: Array.isArray(p.features) ? p.features : [],
    status: p.status || 'active',
    featured: p.featured === true || p.featured === 'true',
    order: typeof p.order === 'number' ? p.order : 0,
    created_at: p.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Get all products with optional filtering and sorting
 */
async function getProducts(options = {}) {
  // 1. Primary: Fetch directly from Supabase Cloud Database if configured
  const supabase = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (supabase) {
    try {
      let query = supabase.from('products').select('*');

      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }
      if (options.categoryId && options.categoryId !== 'all') {
        query = query.eq('category_id', options.categoryId);
      }
      if (options.featured) {
        query = query.eq('featured', true);
      }
      if (options.search) {
        const s = options.search.trim();
        query = query.or(`name.ilike.%${s}%,sku.ilike.%${s}%,description.ilike.%${s}%,material.ilike.%${s}%`);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        let products = data.map(mapSupabaseToProduct);

        if (options.sortBy) {
          switch (options.sortBy) {
            case 'name-asc': products.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
            case 'name-desc': products.sort((a, b) => (b.name || '').localeCompare(a.name || '')); break;
            case 'newest': products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
            case 'updated': products.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); break;
            case 'featured':
            default: products.sort((a, b) => (a.order || 0) - (b.order || 0)); break;
          }
        } else {
          products.sort((a, b) => (a.order || 0) - (b.order || 0));
        }

        try {
          // Clear old local store to sync fully with Supabase (especially for deletes)
          const store = await getStore('products', 'readwrite');
          await new Promise((res) => {
            const clearReq = store.clear();
            clearReq.onsuccess = () => res();
            clearReq.onerror = () => res();
          });
          products.forEach(p => store.put(p));
        } catch (e) {}

        return products;
      }
    } catch (err) {
      console.warn('Supabase fetch error, falling back to local store:', err);
    }
  }

  // 2. Fallback: Local IndexedDB / data/products.json / DEFAULT_PRODUCTS
  const store = await getStore('products', 'readonly');
  return new Promise(async (resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = async () => {
      let products = request.result || [];

      if (products.length === 0) {
        try {
          const res = await fetch('data/products.json?v=' + Date.now());
          if (res.ok) {
            products = await res.json();
            if (Array.isArray(products) && products.length > 0) {
              const writeStore = await getStore('products', 'readwrite');
              products.forEach(p => writeStore.put(p));
            }
          }
        } catch (e) {
          console.log('Central JSON fallback note:', e);
        }

        if ((!products || products.length === 0) && typeof DEFAULT_PRODUCTS !== 'undefined' && DEFAULT_PRODUCTS.length > 0) {
          products = [...DEFAULT_PRODUCTS];
          try {
            const writeStore = await getStore('products', 'readwrite');
            products.forEach(p => writeStore.put(p));
          } catch (err) {}
        }
      }

      if (options.categoryId && options.categoryId !== 'all') {
        products = products.filter(p => p.categoryId === options.categoryId);
      }
      if (options.status && options.status !== 'all') {
        products = products.filter(p => p.status === options.status);
      }
      if (options.search) {
        const query = options.search.toLowerCase().trim();
        products = products.filter(p => {
          return (
            (p.name && p.name.toLowerCase().includes(query)) ||
            (p.sku && p.sku.toLowerCase().includes(query)) ||
            (p.modelNumber && p.modelNumber.toLowerCase().includes(query)) ||
            (p.material && p.material.toLowerCase().includes(query)) ||
            (p.shortDescription && p.shortDescription.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query))
          );
        });
      }

      resolve(products);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Get single product by ID
 */
async function getProductById(id) {
  const supabase = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (!error && data) {
        return mapSupabaseToProduct(data);
      }
    } catch (e) {}
  }

  const store = await getStore('products', 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Get single product by Slug
 */
async function getProductBySlug(slug) {
  const products = await getProducts();
  return products.find(p => p.slug === slug) || null;
}

/**
 * Add new product (Saves to Supabase DB & Local Cache)
 */
async function addProduct(productData) {
  const now = new Date().toISOString();
  const id = productData.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  const newProduct = {
    id: id,
    name: productData.name?.trim() || 'Untitled Product',
    slug: productData.slug || (typeof generateSlug === 'function' ? `${generateSlug(productData.name)}-${id.slice(-4)}` : id),
    sku: productData.sku?.trim() || `SKU-${Date.now().toString().slice(-4)}`,
    modelNumber: productData.modelNumber?.trim() || '',
    categoryId: productData.categoryId || 'cat_effervescent',
    subCategory: productData.subCategory?.trim() || '',
    productType: productData.productType?.trim() || 'Container',
    price: productData.price || '',
    shortDescription: productData.shortDescription?.trim() || '',
    description: productData.description?.trim() || '',
    primaryImage: productData.primaryImage || (Array.isArray(productData.images) && productData.images[0]) || 'assets/images/products/tube-trio.jpg',
    images: Array.isArray(productData.images) && productData.images.length > 0 
      ? productData.images 
      : ['assets/images/products/tube-trio.jpg'],
    material: productData.material?.trim() || 'Food Grade PP',
    color: productData.color?.trim() || 'White / Translucent / Custom',
    shape: productData.shape?.trim() || 'Cylindrical',
    capacity: productData.capacity?.trim() || '',
    size: productData.size?.trim() || '',
    weight: productData.weight?.trim() || '',
    height: productData.height?.trim() || '',
    width: productData.width?.trim() || '',
    diameter: productData.diameter?.trim() || '',
    neckSize: productData.neckSize?.trim() || '',
    packagingType: productData.packagingType?.trim() || 'Box Packaging / Export Pallet',
    usage: productData.usage?.trim() || 'Pharmaceutical & Nutraceutical Packaging',
    countryOfOrigin: productData.countryOfOrigin?.trim() || 'India',
    specifications: Array.isArray(productData.specifications) ? productData.specifications : [],
    features: Array.isArray(productData.features) ? productData.features : [],
    status: productData.status || 'active',
    featured: productData.featured === true || productData.featured === 'true',
    order: typeof productData.order === 'number' ? productData.order : Date.now(),
    createdAt: productData.createdAt || now,
    updatedAt: now
  };

  const supabase = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (supabase) {
    const supabaseRecord = mapProductToSupabase(newProduct);
    const { error } = await supabase.from('products').insert([supabaseRecord]);
    if (error) {
      console.error('Supabase addProduct insert error:', error);
      throw new Error(`Cloud Database Error: ${error.message}`);
    }
  }

  const store = await getStore('products', 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.put(newProduct);
    request.onsuccess = () => resolve(newProduct);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Update existing product (Updates Supabase & Local Cache)
 */
async function updateProduct(id, productData) {
  const existing = await getProductById(id);
  const updatedProduct = {
    ...(existing || {}),
    ...productData,
    id: id,
    updatedAt: new Date().toISOString()
  };

  const supabase = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (supabase) {
    const supabaseRecord = mapProductToSupabase(updatedProduct);
    const { error } = await supabase.from('products').update(supabaseRecord).eq('id', id);
    if (error) {
      console.error('Supabase updateProduct error:', error);
      throw new Error(`Cloud Database Error: ${error.message}`);
    }
  }

  const store = await getStore('products', 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.put(updatedProduct);
    request.onsuccess = () => resolve(updatedProduct);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Delete product (Hard delete in Supabase & Local Cache by default)
 */
async function deleteProduct(id, softDelete = false) {
  const supabase = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (supabase) {
    if (softDelete) {
      await supabase.from('products').update({ status: 'inactive', updated_at: new Date().toISOString() }).eq('id', id);
    } else {
      await supabase.from('products').delete().eq('id', id);
    }
  }

  const store = await getStore('products', 'readwrite');
  if (softDelete) {
    const existing = await getProductById(id);
    if (existing) {
      existing.status = 'inactive';
      existing.updatedAt = new Date().toISOString();
      await new Promise((resolve, reject) => {
        const req = store.put(existing);
        req.onsuccess = () => resolve(true);
        req.onerror = (e) => reject(e.target.error);
      });
    }
  } else {
    await new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }
  return true;
}

/**
 * Bulk delete products
 */
async function bulkDeleteProducts(ids) {
  const supabase = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (supabase) {
    await supabase.from('products').delete().in('id', ids);
  }

  const store = await getStore('products', 'readwrite');
  return Promise.all(ids.map(id => new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject(e.target.error);
  })));
}

/**
 * Bulk update product status
 */
async function bulkUpdateProductStatus(ids, status) {
  const now = new Date().toISOString();
  const products = await Promise.all(ids.map(id => getProductById(id)));
  const validProducts = products.filter(Boolean);

  const store = await getStore('products', 'readwrite');
  return Promise.all(validProducts.map(product => {
    product.status = status;
    product.updatedAt = now;
    return new Promise((resolve, reject) => {
      const req = store.put(product);
      req.onsuccess = () => resolve(product);
      req.onerror = (e) => reject(e.target.error);
    });
  }));
}

/**
 * Reorder products
 */
async function reorderProducts(orderedIds) {
  const products = await Promise.all(orderedIds.map(id => getProductById(id)));
  const store = await getStore('products', 'readwrite');
  return Promise.all(products.map((product, index) => {
    if (!product) return Promise.resolve(null);
    product.order = index + 1;
    return new Promise((resolve, reject) => {
      const req = store.put(product);
      req.onsuccess = () => resolve(product);
      req.onerror = (e) => reject(e.target.error);
    });
  }));
}

/* ==========================================================================
   CATEGORIES CRUD
   ========================================================================== */

/**
 * Get all categories
 */
async function getCategories(options = {}) {
  const store = await getStore('categories', 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      let categories = request.result || [];

      if (options.status && options.status !== 'all') {
        categories = categories.filter(c => c.status === options.status);
      }

      if (options.search) {
        const query = options.search.toLowerCase().trim();
        categories = categories.filter(c => 
          (c.name && c.name.toLowerCase().includes(query)) ||
          (c.description && c.description.toLowerCase().includes(query))
        );
      }

      categories.sort((a, b) => (a.order || 0) - (b.order || 0));
      resolve(categories);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Get category by ID
 */
async function getCategoryById(id) {
  const store = await getStore('categories', 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Get category by Slug
 */
async function getCategoryBySlug(slug) {
  const categories = await getCategories();
  return categories.find(c => c.slug === slug) || null;
}

/**
 * Add Category
 */
async function addCategory(categoryData) {
  const store = await getStore('categories', 'readwrite');
  const now = new Date().toISOString();

  const newCategory = {
    id: categoryData.id || `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: categoryData.name?.trim() || 'New Category',
    slug: categoryData.slug || generateSlug(categoryData.name),
    description: categoryData.description?.trim() || '',
    image: categoryData.image || 'assets/images/products/tube-trio.jpg',
    icon: categoryData.icon || 'fa-solid fa-pills',
    status: categoryData.status || 'active',
    order: typeof categoryData.order === 'number' ? categoryData.order : Date.now(),
    createdAt: now,
    updatedAt: now
  };

  return new Promise((resolve, reject) => {
    const request = store.add(newCategory);
    request.onsuccess = () => resolve(newCategory);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Update Category
 */
async function updateCategory(id, categoryData) {
  const existing = await getCategoryById(id);
  if (!existing) {
    throw new Error(`Category with ID ${id} not found.`);
  }

  const updatedCategory = {
    ...existing,
    ...categoryData,
    id: id,
    updatedAt: new Date().toISOString()
  };

  const store = await getStore('categories', 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.put(updatedCategory);
    request.onsuccess = () => resolve(updatedCategory);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Delete Category (with safe product check)
 */
async function deleteCategory(id, targetMoveCategoryId = null) {
  const products = await getProducts({ categoryId: id });
  
  if (products.length > 0) {
    if (!targetMoveCategoryId) {
      throw new Error(`Cannot delete category: ${products.length} product(s) are assigned to it. Please reassign or delete them first.`);
    }
    // Reassign products to target category
    const productStore = await getStore('products', 'readwrite');
    for (const p of products) {
      p.categoryId = targetMoveCategoryId;
      p.updatedAt = new Date().toISOString();
      await new Promise((resolve, reject) => {
        const req = productStore.put(p);
        req.onsuccess = resolve;
        req.onerror = reject;
      });
    }
  }

  const store = await getStore('categories', 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Reorder categories
 */
async function reorderCategories(orderedIds) {
  const categories = await Promise.all(orderedIds.map(id => getCategoryById(id)));
  const store = await getStore('categories', 'readwrite');
  return Promise.all(categories.map((category, index) => {
    if (!category) return Promise.resolve(null);
    category.order = index + 1;
    return new Promise((resolve, reject) => {
      const req = store.put(category);
      req.onsuccess = () => resolve(category);
      req.onerror = (e) => reject(e.target.error);
    });
  }));
}

/* ==========================================================================
   INQUIRIES CRUD
   ========================================================================== */

/**
 * Get all quote inquiries
 */
async function getInquiries(options = {}) {
  const store = await getStore('inquiries', 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      let inquiries = request.result || [];

      if (options.status && options.status !== 'all') {
        inquiries = inquiries.filter(i => i.status === options.status);
      }

      if (options.search) {
        const q = options.search.toLowerCase();
        inquiries = inquiries.filter(i => 
          (i.name && i.name.toLowerCase().includes(q)) ||
          (i.company && i.company.toLowerCase().includes(q)) ||
          (i.email && i.email.toLowerCase().includes(q)) ||
          (i.productName && i.productName.toLowerCase().includes(q))
        );
      }

      inquiries.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      resolve(inquiries);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Add customer quote inquiry
 */
async function addInquiry(inquiryData) {
  const store = await getStore('inquiries', 'readwrite');
  const newInquiry = {
    id: `inq_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: inquiryData.name?.trim() || 'Anonymous',
    company: inquiryData.company?.trim() || '',
    email: inquiryData.email?.trim() || '',
    phone: inquiryData.phone?.trim() || '',
    productId: inquiryData.productId || '',
    productName: inquiryData.productName?.trim() || '',
    quantity: inquiryData.quantity || '',
    message: inquiryData.message?.trim() || '',
    status: 'new', // new, contacted, closed
    createdAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const request = store.add(newInquiry);
    request.onsuccess = () => resolve(newInquiry);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Update inquiry status
 */
async function updateInquiryStatus(id, status) {
  const store = await getStore('inquiries', 'readwrite');
  return new Promise((resolve, reject) => {
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const inq = getReq.result;
      if (!inq) return reject(new Error('Inquiry not found'));
      inq.status = status;
      inq.updatedAt = new Date().toISOString();
      const putReq = store.put(inq);
      putReq.onsuccess = () => resolve(inq);
      putReq.onerror = (e) => reject(e.target.error);
    };
    getReq.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Delete inquiry
 */
async function deleteInquiry(id) {
  const store = await getStore('inquiries', 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

/* ==========================================================================
   DASHBOARD STATS & ANALYTICS
   ========================================================================== */

/**
 * Calculate comprehensive dashboard statistics
 */
async function getDashboardStats() {
  const [products, categories, inquiries] = await Promise.all([
    getProducts(),
    getCategories(),
    getInquiries()
  ]);

  const activeProducts = products.filter(p => p.status === 'active').length;
  const draftProducts = products.filter(p => p.status === 'draft').length;
  const inactiveProducts = products.filter(p => p.status === 'inactive').length;

  // Category distribution
  const categoryDistribution = categories.map(cat => {
    const count = products.filter(p => p.categoryId === cat.id).length;
    return {
      id: cat.id,
      name: cat.name,
      count: count,
      percentage: products.length > 0 ? Math.round((count / products.length) * 100) : 0
    };
  });

  // Recent products
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  // Recently updated products
  const recentlyUpdated = [...products]
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 5);

  // Recent inquiries
  const recentInquiries = inquiries.slice(0, 5);

  return {
    totalProducts: products.length,
    activeProducts,
    draftProducts,
    inactiveProducts,
    totalCategories: categories.length,
    totalInquiries: inquiries.length,
    totalCustomers: 1200,
    downloadsCount: 348,
    categoryDistribution,
    recentProducts,
    recentlyUpdated,
    recentInquiries
  };
}

/* ==========================================================================
   SAMPLE DATA SEEDING & RESET ENGINE
   ========================================================================== */

/**
 * Generate clean URL slug
 */
function generateSlug(text) {
  if (!text) return `item-${Date.now()}`;
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Initial Factory Categories for Parth Plastopack
 */
const DEFAULT_CATEGORIES = [
  {
    id: 'cat_effervescent',
    name: 'EFFERVESCENT TABLET TUBE',
    slug: 'effervescent-tablet-tube',
    description: 'Airtight, moisture-resistant packaging for effervescent vitamin & mineral tablets with desiccant cap options.',
    image: 'assets/images/products/tube-trio.jpg',
    icon: 'fa-solid fa-flask-vial',
    status: 'active',
    order: 1
  },
  {
    id: 'cat_powder',
    name: 'POWDER CONTAINER',
    slug: 'powder-container',
    description: 'Heavy-duty food-grade PP containers with airtight seals and IML branding for protein & pharma powders.',
    image: 'assets/images/products/products.webp',
    icon: 'fa-solid fa-cubes',
    status: 'active',
    order: 2
  },
  {
    id: 'cat_pet_tablet',
    name: 'PET TABLET CONTAINER',
    slug: 'pet-tablet-container',
    description: 'Crystal-clear PET containers providing superior UV resistance, lightweight handling, and child-resistant options.',
    image: 'assets/images/products/pet-bottle.jpg',
    icon: 'fa-solid fa-bottle-water',
    status: 'active',
    order: 3
  },
  {
    id: 'cat_tablet_container',
    name: 'TABLET CONTAINER',
    slug: 'tablet-container',
    description: 'High-density polyethylene containers designed for medical tablets, capsules, and health supplements.',
    image: 'assets/images/products/tablet-container.jpg',
    icon: 'fa-solid fa-pills',
    status: 'active',
    order: 4
  },
  {
    id: 'cat_lids_caps',
    name: 'CAPS & CLOSURES',
    slug: 'caps-and-closures',
    description: 'Precision-threaded caps, tamper-evident seals, desiccant spiral stoppers, and child-resistant closures.',
    image: 'assets/images/products/Cap.webp',
    icon: 'fa-solid fa-shield-halved',
    status: 'active',
    order: 5
  },
  {
    id: 'cat_spoons',
    name: 'MEASURING SPOONS',
    slug: 'measuring-spoons',
    description: 'Accurate, food-grade measuring scoops ranging from 1g to 50g for nutraceutical and pharmaceutical dosing.',
    image: 'assets/images/products/spoon.jpg',
    icon: 'fa-solid fa-spoon',
    status: 'active',
    order: 6
  }
];

/**
 * Initial Factory Products for Parth Plastopack
 * Automatically seeded for new visitors across all devices
 */
const DEFAULT_PRODUCTS = [
  {
    id: "prod_eff_01",
    name: "Effervescent Tablet Tube (100mm)",
    slug: "effervescent-tablet-tube-100mm",
    sku: "EFF-TUBE-100",
    categoryId: "cat_effervescent",
    categoryName: "EFFERVESCENT TABLET TUBE",
    material: "Food Grade PP / PE",
    capacity: "20 Tablets",
    height: "100 mm",
    diameter: "29 mm",
    colorOptions: "White, Custom Colors",
    shortDescription: "Airtight, moisture-resistant tube for effervescent vitamin & mineral tablets.",
    description: "Precision-engineered polypropylene tube with desiccant stopper cap designed specifically for effervescent tablets. Ensures maximum barrier protection against humidity.",
    primaryImage: "assets/images/products/tube-trio.jpg",
    images: ["assets/images/products/tube-trio.jpg"],
    status: "active",
    featured: true,
    order: 1
  },
  {
    id: "prod_pow_01",
    name: "Protein Powder Jar (1000ml)",
    slug: "protein-powder-jar-1000ml",
    sku: "PPC-1000ML",
    categoryId: "cat_powder",
    categoryName: "POWDER CONTAINER",
    material: "High Density PP",
    capacity: "1000 ml",
    height: "160 mm",
    diameter: "110 mm",
    colorOptions: "White, Black, Custom",
    shortDescription: "Heavy-duty food-grade container with airtight screw cap for protein powders.",
    description: "Industrial-grade 1000ml container suitable for nutraceuticals, gym supplements, and pharmaceutical powders.",
    primaryImage: "assets/images/products/products.webp",
    images: ["assets/images/products/products.webp"],
    status: "active",
    featured: true,
    order: 2
  },
  {
    id: "prod_pet_01",
    name: "PET Clear Tablet Bottle (250ml)",
    slug: "pet-clear-tablet-bottle-250ml",
    sku: "PET-BOT-250",
    categoryId: "cat_pet_tablet",
    categoryName: "PET TABLET CONTAINER",
    material: "Clear PET",
    capacity: "250 ml",
    height: "120 mm",
    diameter: "60 mm",
    colorOptions: "Clear, Amber, Custom",
    shortDescription: "Crystal-clear PET bottle providing superior clarity and UV protection.",
    description: "Pharma-compliant PET bottle for capsules, tablets, and dietary supplements.",
    primaryImage: "assets/images/products/pet-bottle.jpg",
    images: ["assets/images/products/pet-bottle.jpg"],
    status: "active",
    featured: true,
    order: 3
  },
  {
    id: "prod_tab_01",
    name: "HDPE Pharma Tablet Bottle (150ml)",
    slug: "hdpe-pharma-tablet-bottle-150ml",
    sku: "HDPE-TAB-150",
    categoryId: "cat_tablet_container",
    categoryName: "TABLET CONTAINER",
    material: "Medical HDPE",
    capacity: "150 ml",
    height: "95 mm",
    diameter: "52 mm",
    colorOptions: "Opaque White",
    shortDescription: "US-FDA compliant HDPE container with tamper-evident seal neck.",
    description: "High-density polyethylene container designed for pharmaceutical tablets and capsule packaging.",
    primaryImage: "assets/images/products/tablet-container.jpg",
    images: ["assets/images/products/tablet-container.jpg"],
    status: "active",
    featured: true,
    order: 4
  },
  {
    id: "prod_cap_01",
    name: "Desiccant Stopper Cap (38mm)",
    slug: "desiccant-stopper-cap-38mm",
    sku: "CAP-DES-38",
    categoryId: "cat_lids_caps",
    categoryName: "CAPS & CLOSURES",
    material: "PP with Silica Desiccant",
    capacity: "38mm Neck",
    height: "30 mm",
    diameter: "38 mm",
    colorOptions: "White, Red, Blue",
    shortDescription: "Tamper-evident spiral stopper cap with integrated desiccant chamber.",
    description: "Specialized cap with built-in silica gel chamber to absorb moisture and protect moisture-sensitive tablets.",
    primaryImage: "assets/images/products/Cap.webp",
    images: ["assets/images/products/Cap.webp"],
    status: "active",
    featured: true,
    order: 5
  },
  {
    id: "prod_spn_01",
    name: "Nutraceutical Measuring Scoop (10g)",
    slug: "nutraceutical-measuring-scoop-10g",
    sku: "SCP-10G",
    categoryId: "cat_spoons",
    categoryName: "MEASURING SPOONS",
    material: "Food Grade PP",
    capacity: "10g / 25ml",
    height: "90 mm Handle",
    diameter: "35 mm Bowl",
    colorOptions: "Clear, White, Blue",
    shortDescription: "Accurate food-grade scoop for precise powder dosage.",
    description: "Calibrated measuring scoop manufactured in Class 100k cleanroom for nutraceutical powder products.",
    primaryImage: "assets/images/products/spoon.jpg",
    images: ["assets/images/products/spoon.jpg"],
    status: "active",
    featured: true,
    order: 6
  }
];

/**
 * Initial Sample Inquiries (Starts empty)
 */
const DEFAULT_INQUIRIES = [];

/**
 * Seed initial categories & products if empty
 */
async function seedInitialData(force = false) {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });

  const catTx = db.transaction('categories', 'readwrite');
  const catStore = catTx.objectStore('categories');
  const catCountReq = catStore.count();

  catCountReq.onsuccess = async () => {
    const catCount = catCountReq.result;
    if (catCount === 0 || force) {
      if (force) {
        catStore.clear();
      }
      for (const cat of DEFAULT_CATEGORIES) {
        catStore.put(cat);
      }
    }
  };

  // Seed default products if empty
  const prodTx = db.transaction('products', 'readwrite');
  const prodStore = prodTx.objectStore('products');
  const prodCountReq = prodStore.count();

  prodCountReq.onsuccess = () => {
    if (prodCountReq.result === 0 || force) {
      if (force) prodStore.clear();
      for (const prod of DEFAULT_PRODUCTS) {
        prodStore.put(prod);
      }
    }
  };
}

/**
 * Clear all products completely from database
 */
async function clearAllProducts() {
  const store = await getStore('products', 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.clear();
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Reset whole database
 */
async function resetDatabase() {
  await clearAllProducts();
  await seedInitialData(true);
  return true;
}

window.clearAllProducts = clearAllProducts;

// Auto initialize on load
if (typeof window !== 'undefined') {
  initDB().catch(err => console.warn('DB Auto-init warning:', err));
}
