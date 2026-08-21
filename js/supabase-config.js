/**
 * Parth Plastopack Pvt. Ltd.
 * Supabase Cloud Database & Storage Client Configuration
 * 
 * Free-tier cloud backend integration for global product sync & public image storage.
 */

// Configurable Supabase Credentials
// You can set these directly here or in Admin Settings (saved to localStorage)
const DEFAULT_SUPABASE_URL = 'https://fgejtumodaoefpjbomvw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_ICCJLNQPPm7cGHNhESnbLg_ZUkrZs_r';

function getSupabaseUrl() {
  let url = null;
  if (typeof window !== 'undefined' && window.SUPABASE_URL) url = window.SUPABASE_URL;
  else if (typeof localStorage !== 'undefined') url = localStorage.getItem('ppp_supabase_url');
  
  url = url || DEFAULT_SUPABASE_URL;
  
  // Clean URL to prevent errors if user pasted /rest/v1/
  if (url) {
    url = url.trim();
    if (url.endsWith('/rest/v1/')) url = url.replace('/rest/v1/', '');
    if (url.endsWith('/rest/v1')) url = url.replace('/rest/v1', '');
    if (url.endsWith('/')) url = url.slice(0, -1);
  }
  return url;
}

function getSupabaseAnonKey() {
  if (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) return window.SUPABASE_ANON_KEY;
  const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('ppp_supabase_key') : null;
  return storedKey || DEFAULT_SUPABASE_ANON_KEY;
}

let _supabaseInstance = null;

/**
 * Initialize and get active Supabase JS Client instance
 */
function getSupabaseClient() {
  if (_supabaseInstance) return _supabaseInstance;

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (typeof supabase !== 'undefined' && url && key && !url.includes('YOUR_SUPABASE_PROJECT_ID')) {
    try {
      _supabaseInstance = supabase.createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      return _supabaseInstance;
    } catch (err) {
      console.warn('Supabase Client initialization warning:', err);
    }
  }
  return null;
}

/**
 * Check if Supabase connection is active and configured
 */
function isSupabaseConfigured() {
  const client = getSupabaseClient();
  return client !== null;
}

/**
 * Upload image file to Supabase Storage Bucket ('products')
 * Returns the public HTTPS URL of the uploaded image
 */
async function uploadProductImageToSupabase(file, bucketName = 'products') {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not configured. Please set your Supabase URL and Anon Key in Admin Settings.');
  }

  // Generate unique clean filename
  const fileExt = file.name.split('.').pop();
  const fileName = `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `catalog/${fileName}`;

  // Upload file to Supabase Storage Bucket
  const { data, error } = await client.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Supabase Storage Upload Error:', error);
    throw error;
  }

  // Get Public URL
  const { data: publicUrlData } = client.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Failed to retrieve public URL from Supabase Storage.');
  }

  return publicUrlData.publicUrl;
}

// Expose globally
if (typeof window !== 'undefined') {
  window.getSupabaseClient = getSupabaseClient;
  window.isSupabaseConfigured = isSupabaseConfigured;
  window.uploadProductImageToSupabase = uploadProductImageToSupabase;
}
