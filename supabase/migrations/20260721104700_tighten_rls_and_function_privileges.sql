/*
# Tighten RLS policies and revoke function execution

1. Overview
This migration fixes four security findings reported by the database security scanner:
- The `contact_messages` INSERT policy `contact_insert_public` had `WITH CHECK (true)`,
  allowing unrestricted inserts. It is replaced with a policy that validates required
  fields are present and within reasonable length limits.
- The `newsletter_subscribers` INSERT policy `newsletter_insert_public` had `WITH CHECK (true)`,
  allowing unrestricted inserts. It is replaced with a policy that requires a non-null,
  basic-email-shaped value within length limits.
- The `handle_new_user()` SECURITY DEFINER function was executable by `anon` and
  `authenticated` roles via the PostgREST RPC endpoint, exposing it to direct invocation.
  EXECUTE is revoked from PUBLIC so it can only be invoked by the database trigger
  (triggers bypass EXECUTE privileges), not by API callers.

2. Tables Modified
- `public.contact_messages` — INSERT policy replaced.
- `public.newsletter_subscribers` — INSERT policy replaced.

3. Functions Modified
- `public.handle_new_user()` — EXECUTE revoked from PUBLIC. SECURITY DEFINER is retained
  because the function must insert into `public.profiles` during the auth trigger, which
  runs before any user profile row exists. Trigger execution does not require EXECUTE
  privileges, so the `on_auth_user_created` trigger continues to work.

4. Security Changes
- `contact_insert_public`: WITH CHECK now requires name, email, message non-null and
  bounded lengths (name <= 200, email <= 200, message <= 5000, phone <= 50, subject <= 200).
- `newsletter_insert_public`: WITH CHECK now requires email non-null, matching a basic
  email pattern, and length <= 200.
- `handle_new_user()`: REVOKE EXECUTE FROM PUBLIC removes direct-call access from anon
  and authenticated roles while preserving trigger execution.

5. Important Notes
- Both INSERT policies remain open to `anon, authenticated` because the contact form and
  newsletter subscription are public-facing features that must work without sign-in.
  The added WITH CHECK clauses constrain *what* can be inserted rather than *who*.
- The email regex is intentionally simple (^[^@]+@[^@]+\.[^@]+$) to avoid false negatives
  on valid addresses while still blocking obviously malformed input.
- Trigger functions in PostgreSQL are invoked by the trigger mechanism, which does not
  check EXECUTE privileges. Revoking EXECUTE therefore does not break the signup flow.
*/

-- 1. Tighten contact_messages INSERT policy
DROP POLICY IF EXISTS "contact_insert_public" ON public.contact_messages;
CREATE POLICY "contact_insert_public" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL
    AND length(name) <= 200
    AND email IS NOT NULL
    AND length(email) <= 200
    AND message IS NOT NULL
    AND length(message) <= 5000
    AND (phone IS NULL OR length(phone) <= 50)
    AND (subject IS NULL OR length(subject) <= 200)
  );

-- 2. Tighten newsletter_subscribers INSERT policy
DROP POLICY IF EXISTS "newsletter_insert_public" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_insert_public" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) <= 200
    AND email ~ '^[^@]+@[^@]+\.[^@]+$'
  );

-- 3. Revoke direct execution of the auth trigger function from all non-superuser roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
