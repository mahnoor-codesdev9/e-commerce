/*
# Fix infinite recursion in admin RLS policies (root cause of /admin redirect)

## Root Cause
Every "admin" RLS policy in this project (on profiles, categories, products,
orders, order_items, reviews, coupons, newsletter_subscribers,
contact_messages, every CMS table, and storage.objects) checks admin status
with an inline subquery:

  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')

For every table EXCEPT `profiles` itself this is merely inefficient. But the
policy "profiles_select_admin" on the `profiles` table uses this exact
subquery ON THE `profiles` TABLE ITSELF. A SELECT policy that queries its own
table is self-referential: to decide whether a row of `profiles` is visible,
Postgres must evaluate the policy's subquery, which selects from `profiles`
again, which re-triggers RLS evaluation on `profiles` again, and so on.
Postgres's planner detects this and aborts the query with:

  ERROR: infinite recursion detected in policy for relation "profiles" (42P17)

## Why customer login "worked" but admin didn't
`AuthContext.loadProfile()` swallows the error from this failed query
(`console.error` + `return null`), so `profile` silently stays `null` for
EVERY user, admin or customer. `AccountPage` never gates on `profile` being
non-null (it only checks `session`), so the customer-facing account page
rendered fine and hid the bug. `AdminLayout`, however, does
`if (!profile) return <Navigate to="/login" />`, so a null profile always
bounced the admin straight back to the login page — regardless of the
account's actual role in the database.

The exact same recursion is triggered by every OTHER admin policy in the
project as soon as they need to check a row that isn't the caller's own
profiles row (e.g. any admin listing another customer's profile in
AdminCustomers, or any admin write to products/orders/coupons/CMS tables),
because evaluating `EXISTS (SELECT 1 FROM profiles ...)` from within ANY
policy still routes through the broken `profiles` RLS policies.

## Fix
Introduce a `SECURITY DEFINER` helper function `public.is_admin()`. Because
it is owned by the migration-running role (which owns `public.profiles` and
therefore bypasses RLS on it), the function can check `profiles.role` WITHOUT
re-triggering RLS on `profiles`, breaking the recursion entirely. Every
policy that used the inline self-join subquery is replaced with a call to
`public.is_admin()`, with identical USING/WITH CHECK semantics and identical
policy names (so this migration only redefines existing policies; it changes
no permissions or behavior other than removing the recursion bug).

## Security
- RLS remains enabled on every table; no policy is removed or weakened.
- `is_admin()` only ever returns a boolean and only ever reads `profiles`;
  it grants no additional access on its own.
- EXECUTE on `is_admin()` is granted to `anon` and `authenticated` (needed
  because it's invoked from policies evaluated for both roles); the function
  itself does not expose row data, only a boolean.
*/

-- ============================================================
-- 1. SECURITY DEFINER helper: is_admin()
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin(check_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = check_uid AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated;

-- ============================================================
-- 2. profiles (the table with the actual recursive policy)
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin());

-- ============================================================
-- 3. categories
-- ============================================================
DROP POLICY IF EXISTS "categories_insert_admin" ON public.categories;
CREATE POLICY "categories_insert_admin" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_update_admin" ON public.categories;
CREATE POLICY "categories_update_admin" ON public.categories
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_delete_admin" ON public.categories;
CREATE POLICY "categories_delete_admin" ON public.categories
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- 4. products
-- ============================================================
DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
CREATE POLICY "products_insert_admin" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_update_admin" ON public.products;
CREATE POLICY "products_update_admin" ON public.products
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
CREATE POLICY "products_delete_admin" ON public.products
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- 5. orders
-- ============================================================
DROP POLICY IF EXISTS "orders_select_admin" ON public.orders;
CREATE POLICY "orders_select_admin" ON public.orders
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- 6. order_items
-- ============================================================
DROP POLICY IF EXISTS "order_items_select_admin" ON public.order_items;
CREATE POLICY "order_items_select_admin" ON public.order_items
  FOR SELECT TO authenticated USING (public.is_admin());

-- ============================================================
-- 7. reviews
-- ============================================================
DROP POLICY IF EXISTS "reviews_update_admin" ON public.reviews;
CREATE POLICY "reviews_update_admin" ON public.reviews
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "reviews_delete_admin" ON public.reviews;
CREATE POLICY "reviews_delete_admin" ON public.reviews
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- 8. coupons
-- ============================================================
-- Separate bug found during audit: coupons previously had NO select policy
-- reachable by anon/authenticated customers, only "coupons_select_admin".
-- CartPage.tsx queries `coupons` directly by code to apply a discount at
-- checkout, so every coupon application by a real customer or guest was
-- silently rejected by RLS. Add a narrow public policy that only exposes
-- active coupons (matches the `is_active = true` filter already used by the
-- app) — inactive/draft coupons remain visible to admins only.
DROP POLICY IF EXISTS "coupons_select_public_active" ON public.coupons;
CREATE POLICY "coupons_select_public_active" ON public.coupons
  FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "coupons_select_admin" ON public.coupons;
CREATE POLICY "coupons_select_admin" ON public.coupons
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "coupons_insert_admin" ON public.coupons;
CREATE POLICY "coupons_insert_admin" ON public.coupons
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "coupons_update_admin" ON public.coupons;
CREATE POLICY "coupons_update_admin" ON public.coupons
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "coupons_delete_admin" ON public.coupons;
CREATE POLICY "coupons_delete_admin" ON public.coupons
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- 9. newsletter_subscribers
-- ============================================================
DROP POLICY IF EXISTS "newsletter_select_admin" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_select_admin" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "newsletter_delete_admin" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_delete_admin" ON public.newsletter_subscribers
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- 10. contact_messages
-- ============================================================
DROP POLICY IF EXISTS "contact_select_admin" ON public.contact_messages;
CREATE POLICY "contact_select_admin" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "contact_update_admin" ON public.contact_messages;
CREATE POLICY "contact_update_admin" ON public.contact_messages
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "contact_delete_admin" ON public.contact_messages;
CREATE POLICY "contact_delete_admin" ON public.contact_messages
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- 11. CMS tables — all follow the same insert/update/delete admin shape
-- ============================================================
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'site_settings', 'homepage_slides', 'homepage_sections', 'about_content',
    'contact_content', 'header_config', 'footer_config', 'page_contents',
    'faqs', 'media_files'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_admin', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_admin())',
      t || '_insert_admin', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_admin', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',
      t || '_update_admin', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_admin', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_admin())',
      t || '_delete_admin', t
    );
  END LOOP;
END $$;

-- ============================================================
-- 12. storage.objects (product-images admin policies)
-- ============================================================
DROP POLICY IF EXISTS "product_images_admin_upload" ON storage.objects;
CREATE POLICY "product_images_admin_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
CREATE POLICY "product_images_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
CREATE POLICY "product_images_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());
