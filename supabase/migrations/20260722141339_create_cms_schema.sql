/*
# CMS Schema — Site Settings, Homepage, About, Contact, Header, Footer, Pages, FAQs, Media

## Overview
This migration creates the complete CMS infrastructure so the admin can manage
every piece of website content without touching code. All tables use a
single-row pattern (site_settings) or multi-row patterns for collections.

## New Tables

1. **site_settings** (single row, id=1) — global brand settings:
   logo_url, favicon_url, brand_name, brand_tagline, primary_color, accent_color,
   announcement_text, announcement_enabled, search_placeholder,
   contact_email, contact_phone, whatsapp_number, address_line1, address_line2,
   city, country, business_hours, google_maps_embed,
   instagram_url, facebook_url, twitter_url, youtube_url, tiktok_url, linkedin_url,
   seo_title, seo_description, seo_keywords, google_analytics_id, meta_pixel_id,
   gtm_id, copyright_text, free_shipping_threshold, shipping_flat_rate

2. **homepage_slides** — hero slider slides with image, heading, subheading,
   button text, button link, sort order, active flag.

3. **homepage_sections** — configurable homepage sections (features, brand story,
   collections, promo banners, instagram, stats, CTA). Each has type, title,
   subtitle, content (jsonb), image_url, button_text, button_link, sort_order, active.

4. **about_content** (single row) — heading, description, images, mission, vision,
   values (jsonb array), timeline (jsonb array).

5. **contact_content** (single row) — heading, description, address, phone, whatsapp,
   email, business hours, google maps embed, social links.

6. **header_config** (single row) — nav items (jsonb array), mega menu categories
   toggle, show search, show wishlist, show cart, sticky header.

7. **footer_config** (single row) — description, quick links (jsonb), social links,
   payment icons (jsonb), newsletter title, newsletter description, copyright.

8. **page_contents** — dynamic pages (privacy-policy, terms, shipping-policy, etc.)
   with title, slug, content, seo fields.

9. **faqs** — FAQ items with question, answer, sort_order, active.

10. **media_files** — media library tracking uploaded files with url, filename,
    folder, file_size, mime_type.

## Modified Tables
- **products** — adds seo_title, seo_description, seo_keywords columns.

## Security
- All CMS tables: public SELECT (anon+authenticated), admin-only INSERT/UPDATE/DELETE.
- media_files: same pattern.
*/

-- ============================================================
-- 1. site_settings (single-row)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  logo_url text,
  favicon_url text,
  brand_name text NOT NULL DEFAULT 'OutreX Fashion',
  brand_tagline text DEFAULT 'Luxury Fashion & Accessories',
  primary_color text DEFAULT '#000000',
  accent_color text DEFAULT '#D4AF37',
  announcement_text text DEFAULT 'Free shipping on orders over Rs. 15,000 — Crafted for the modern wardrobe',
  announcement_enabled boolean DEFAULT true,
  search_placeholder text DEFAULT 'Search for products...',
  contact_email text DEFAULT 'bhattihashir102@gmail.com',
  contact_phone text DEFAULT '03174120995',
  whatsapp_number text DEFAULT '923174120995',
  address_line1 text,
  address_line2 text,
  city text DEFAULT 'Pakistan',
  country text DEFAULT 'Pakistan',
  business_hours text DEFAULT 'Mon - Sat: 9AM - 9PM',
  google_maps_embed text,
  instagram_url text,
  facebook_url text,
  twitter_url text,
  youtube_url text,
  tiktok_url text,
  linkedin_url text,
  seo_title text DEFAULT 'OutreX Fashion — Luxury Fashion, Watches & Accessories',
  seo_description text DEFAULT 'Premium watches, t-shirts, trousers and caps crafted for the modern wardrobe.',
  seo_keywords text DEFAULT 'luxury fashion, watches, t-shirts, trousers, caps, OutreX, premium accessories',
  google_analytics_id text,
  meta_pixel_id text,
  gtm_id text,
  copyright_text text DEFAULT 'OutreX Fashion. All rights reserved.',
  free_shipping_threshold numeric DEFAULT 15000,
  shipping_flat_rate numeric DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select_public" ON public.site_settings;
CREATE POLICY "site_settings_select_public" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_settings_insert_admin" ON public.site_settings;
CREATE POLICY "site_settings_insert_admin" ON public.site_settings
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "site_settings_update_admin" ON public.site_settings;
CREATE POLICY "site_settings_update_admin" ON public.site_settings
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "site_settings_delete_admin" ON public.site_settings;
CREATE POLICY "site_settings_delete_admin" ON public.site_settings
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- 2. homepage_slides
-- ============================================================
CREATE TABLE IF NOT EXISTS public.homepage_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  heading text NOT NULL,
  subheading text,
  button_text text,
  button_link text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.homepage_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "homepage_slides_select_public" ON public.homepage_slides;
CREATE POLICY "homepage_slides_select_public" ON public.homepage_slides
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "homepage_slides_insert_admin" ON public.homepage_slides;
CREATE POLICY "homepage_slides_insert_admin" ON public.homepage_slides
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "homepage_slides_update_admin" ON public.homepage_slides;
CREATE POLICY "homepage_slides_update_admin" ON public.homepage_slides
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "homepage_slides_delete_admin" ON public.homepage_slides;
CREATE POLICY "homepage_slides_delete_admin" ON public.homepage_slides
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- 3. homepage_sections
-- ============================================================
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  title text,
  subtitle text,
  content jsonb DEFAULT '{}'::jsonb,
  image_url text,
  button_text text,
  button_link text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "homepage_sections_select_public" ON public.homepage_sections;
CREATE POLICY "homepage_sections_select_public" ON public.homepage_sections
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "homepage_sections_insert_admin" ON public.homepage_sections;
CREATE POLICY "homepage_sections_insert_admin" ON public.homepage_sections
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "homepage_sections_update_admin" ON public.homepage_sections;
CREATE POLICY "homepage_sections_update_admin" ON public.homepage_sections
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "homepage_sections_delete_admin" ON public.homepage_sections;
CREATE POLICY "homepage_sections_delete_admin" ON public.homepage_sections
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- 4. about_content (single-row)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.about_content (
  id integer PRIMARY KEY DEFAULT 1,
  heading text DEFAULT 'Our Story',
  description text,
  image_url text,
  image_url_2 text,
  mission text,
  vision text,
  values jsonb DEFAULT '[]'::jsonb,
  timeline jsonb DEFAULT '[]'::jsonb,
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "about_content_select_public" ON public.about_content;
CREATE POLICY "about_content_select_public" ON public.about_content
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "about_content_insert_admin" ON public.about_content;
CREATE POLICY "about_content_insert_admin" ON public.about_content
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "about_content_update_admin" ON public.about_content;
CREATE POLICY "about_content_update_admin" ON public.about_content
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "about_content_delete_admin" ON public.about_content;
CREATE POLICY "about_content_delete_admin" ON public.about_content
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- 5. contact_content (single-row)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_content (
  id integer PRIMARY KEY DEFAULT 1,
  heading text DEFAULT 'Contact Us',
  description text,
  address text,
  phone text,
  whatsapp text,
  email text,
  business_hours text,
  google_maps_embed text,
  instagram_url text,
  facebook_url text,
  twitter_url text,
  youtube_url text,
  tiktok_url text,
  linkedin_url text,
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.contact_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_content_select_public" ON public.contact_content;
CREATE POLICY "contact_content_select_public" ON public.contact_content
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "contact_content_insert_admin" ON public.contact_content;
CREATE POLICY "contact_content_insert_admin" ON public.contact_content
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "contact_content_update_admin" ON public.contact_content;
CREATE POLICY "contact_content_update_admin" ON public.contact_content
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "contact_content_delete_admin" ON public.contact_content;
CREATE POLICY "contact_content_delete_admin" ON public.contact_content
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- 6. header_config (single-row)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.header_config (
  id integer PRIMARY KEY DEFAULT 1,
  nav_items jsonb DEFAULT '[]'::jsonb,
  show_search boolean DEFAULT true,
  show_wishlist boolean DEFAULT true,
  show_cart boolean DEFAULT true,
  show_account boolean DEFAULT true,
  sticky_header boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.header_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "header_config_select_public" ON public.header_config;
CREATE POLICY "header_config_select_public" ON public.header_config
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "header_config_insert_admin" ON public.header_config;
CREATE POLICY "header_config_insert_admin" ON public.header_config
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "header_config_update_admin" ON public.header_config;
CREATE POLICY "header_config_update_admin" ON public.header_config
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "header_config_delete_admin" ON public.header_config;
CREATE POLICY "header_config_delete_admin" ON public.header_config
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- 7. footer_config (single-row)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.footer_config (
  id integer PRIMARY KEY DEFAULT 1,
  description text,
  quick_links jsonb DEFAULT '[]'::jsonb,
  social_links jsonb DEFAULT '[]'::jsonb,
  payment_icons jsonb DEFAULT '[]'::jsonb,
  newsletter_title text DEFAULT 'Become an OutreX Insider',
  newsletter_description text DEFAULT 'Subscribe for early access to new collections, private sales, and style notes.',
  copyright_text text DEFAULT 'OutreX Fashion. All rights reserved.',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.footer_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "footer_config_select_public" ON public.footer_config;
CREATE POLICY "footer_config_select_public" ON public.footer_config
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "header_config_insert_admin" ON public.footer_config;
CREATE POLICY "footer_config_insert_admin" ON public.footer_config
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "footer_config_update_admin" ON public.footer_config;
CREATE POLICY "footer_config_update_admin" ON public.footer_config
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "footer_config_delete_admin" ON public.footer_config;
CREATE POLICY "footer_config_delete_admin" ON public.footer_config
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- 8. page_contents
-- ============================================================
CREATE TABLE IF NOT EXISTS public.page_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content text,
  seo_title text,
  seo_description text,
  seo_keywords text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.page_contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "page_contents_select_public" ON public.page_contents;
CREATE POLICY "page_contents_select_public" ON public.page_contents
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "page_contents_insert_admin" ON public.page_contents;
CREATE POLICY "page_contents_insert_admin" ON public.page_contents
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "page_contents_update_admin" ON public.page_contents;
CREATE POLICY "page_contents_update_admin" ON public.page_contents
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "page_contents_delete_admin" ON public.page_contents;
CREATE POLICY "page_contents_delete_admin" ON public.page_contents
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- 9. faqs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "faqs_select_public" ON public.faqs;
CREATE POLICY "faqs_select_public" ON public.faqs
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "faqs_insert_admin" ON public.faqs;
CREATE POLICY "faqs_insert_admin" ON public.faqs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "faqs_update_admin" ON public.faqs;
CREATE POLICY "faqs_update_admin" ON public.faqs
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "faqs_delete_admin" ON public.faqs;
CREATE POLICY "faqs_delete_admin" ON public.faqs
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- 10. media_files
-- ============================================================
CREATE TABLE IF NOT EXISTS public.media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  filename text NOT NULL,
  folder text DEFAULT 'general',
  file_size bigint DEFAULT 0,
  mime_type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_files_select_public" ON public.media_files;
CREATE POLICY "media_files_select_public" ON public.media_files
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "media_files_insert_admin" ON public.media_files;
CREATE POLICY "media_files_insert_admin" ON public.media_files
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "media_files_update_admin" ON public.media_files;
CREATE POLICY "media_files_update_admin" ON public.media_files
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "media_files_delete_admin" ON public.media_files;
CREATE POLICY "media_files_delete_admin" ON public.media_files
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- 11. Add SEO columns to products
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_title') THEN
    ALTER TABLE public.products ADD COLUMN seo_title text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_description') THEN
    ALTER TABLE public.products ADD COLUMN seo_description text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_keywords') THEN
    ALTER TABLE public.products ADD COLUMN seo_keywords text;
  END IF;
END $$;

-- ============================================================
-- 12. updated_at trigger for site_settings, about_content, contact_content, header_config, footer_config, page_contents
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS site_settings_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS about_content_updated_at ON public.about_content;
CREATE TRIGGER about_content_updated_at BEFORE UPDATE ON public.about_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS contact_content_updated_at ON public.contact_content;
CREATE TRIGGER contact_content_updated_at BEFORE UPDATE ON public.contact_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS header_config_updated_at ON public.header_config;
CREATE TRIGGER header_config_updated_at BEFORE UPDATE ON public.header_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS footer_config_updated_at ON public.footer_config;
CREATE TRIGGER footer_config_updated_at BEFORE UPDATE ON public.footer_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS page_contents_updated_at ON public.page_contents;
CREATE TRIGGER page_contents_updated_at BEFORE UPDATE ON public.page_contents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
