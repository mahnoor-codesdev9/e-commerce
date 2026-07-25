/*
# Add coupon increment function and storage bucket

1. Overview
This migration adds the missing `increment_coupon_usage` RPC function that the
checkout flow calls after a coupon is redeemed. It also creates a `product-images`
storage bucket for admin product image uploads.

2. Functions
- `increment_coupon_usage(coupon_code text)` — atomically increments the
  `used_count` column for the matching active coupon. SECURITY DEFINER so it
  can run from the anon/authenticated client without exposing the table.

3. Storage
- Creates `product-images` bucket (public) if it does not exist.
- Adds storage policies allowing authenticated users to upload, and public read.
*/

-- ============================================================
-- 1. increment_coupon_usage function
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE code = upper(coupon_code) AND is_active = true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(text) TO authenticated, anon;

-- ============================================================
-- 2. Storage bucket for product images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Allow authenticated (admin) to upload
DROP POLICY IF EXISTS "product_images_admin_upload" ON storage.objects;
CREATE POLICY "product_images_admin_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated (admin) to update/replace
DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
CREATE POLICY "product_images_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images');

-- Allow authenticated (admin) to delete
DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
CREATE POLICY "product_images_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');
