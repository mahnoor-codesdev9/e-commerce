/*
# Fix Storage Policies: Restrict product-images to admin users only

## Problem
The storage policies for the `product-images` bucket allow ANY authenticated
user to upload, update, and delete images. They only check `bucket_id` but
don't verify the user has an admin role.

## Fix
Replace the admin storage policies with ones that also check
`profiles.role = 'admin'` via a subquery on auth.uid().
*/

-- Drop the existing non-admin-restricted policies
DROP POLICY IF EXISTS "product_images_admin_upload" ON storage.objects;
DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;

-- Re-create with admin role check
CREATE POLICY "product_images_admin_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "product_images_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "product_images_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
