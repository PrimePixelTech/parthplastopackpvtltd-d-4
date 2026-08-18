-- ============================================================================
-- PARTH PLASTOPACK PVT. LTD. - SUPABASE DATABASE & STORAGE SETUP SCHEMA
-- Copy and paste this complete SQL script into your Supabase SQL Editor
-- ============================================================================

-- 1. Enable UUID Extension (Optional helper)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT,
    model_number TEXT,
    category_id TEXT DEFAULT 'cat_effervescent',
    category_name TEXT,
    sub_category TEXT,
    product_type TEXT DEFAULT 'Container',
    price TEXT,
    short_description TEXT,
    description TEXT,
    image_url TEXT,
    primary_image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    material TEXT,
    color TEXT,
    shape TEXT,
    capacity TEXT,
    size TEXT,
    weight TEXT,
    height TEXT,
    width TEXT,
    diameter TEXT,
    neck_size TEXT,
    packaging_type TEXT,
    usage TEXT,
    country_of_origin TEXT DEFAULT 'India',
    specifications JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    featured BOOLEAN DEFAULT false,
    "order" INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    icon TEXT,
    status TEXT DEFAULT 'active',
    "order" INT DEFAULT 0
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES FOR PRODUCTS TABLE
-- Allow public select for active products or all for anon client
DROP POLICY IF EXISTS "Public Read Active Products" ON public.products;
CREATE POLICY "Public Read Active Products" 
ON public.products FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Anon Full Access Products" ON public.products;
CREATE POLICY "Anon Full Access Products" 
ON public.products FOR ALL 
USING (true) WITH CHECK (true);

-- 6. RLS POLICIES FOR CATEGORIES TABLE
DROP POLICY IF EXISTS "Anon Full Access Categories" ON public.categories;
CREATE POLICY "Anon Full Access Categories" 
ON public.categories FOR ALL 
USING (true) WITH CHECK (true);

-- 7. SETUP PUBLIC STORAGE BUCKET FOR PRODUCT IMAGES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 8. STORAGE RLS POLICIES (Allow public reading and image uploads)
DROP POLICY IF EXISTS "Public Storage Select" ON storage.objects;
CREATE POLICY "Public Storage Select" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Public Storage Insert" ON storage.objects;
CREATE POLICY "Public Storage Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Public Storage Update" ON storage.objects;
CREATE POLICY "Public Storage Update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;
CREATE POLICY "Public Storage Delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'products');
