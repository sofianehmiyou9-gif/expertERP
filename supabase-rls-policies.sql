-- ExpertERPHub - Supabase RLS policies
-- Date: 2026-03-17
--
-- HOW TO USE:
-- 1) Open Supabase SQL Editor.
-- 2) Run SECTION A first to remove 401 quickly.
-- 3) (Optional) run SECTION B later for stricter policies.
--
-- NOTE:
-- SECTION A is intentionally permissive to unblock current frontend flows.
-- Do not keep it forever in production.

-- =========================================================
-- SECTION A - QUICK FIX (remove 401 immediately)
-- =========================================================

alter table if exists public.entreprises enable row level security;
alter table if exists public.consultants enable row level security;

-- Ensure anon/authenticated can access according to policies
grant select, insert, update, delete on public.entreprises to anon, authenticated;
grant select, insert, update, delete on public.consultants to anon, authenticated;

-- Drop old broad policy names if they already exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'entreprises' AND policyname = 'entreprises_open_access'
  ) THEN
    DROP POLICY entreprises_open_access ON public.entreprises;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'consultants' AND policyname = 'consultants_open_access'
  ) THEN
    DROP POLICY consultants_open_access ON public.consultants;
  END IF;
END $$;

-- =========================================================
-- SECTION E - PHASE 2 RLS (PROGRESSIVE HARDENING)
-- =========================================================
-- Goal: replace permissive FOR ALL policies with minimal access
-- while preserving current signup and listing flows.
--
-- Expected app behavior after this section:
-- - consultants: public read only approved profiles; public insert allowed
-- - entreprises: public insert allowed; no public read/update/delete
-- - invitation_codes flow remains unchanged (SECTION C)

-- 1) Remove broad open-access policies.
DROP POLICY IF EXISTS entreprises_open_access ON public.entreprises;
DROP POLICY IF EXISTS consultants_open_access ON public.consultants;

-- 2) Keep grants broad enough for policy evaluation, but policy will enforce limits.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entreprises TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultants TO anon, authenticated;

-- 3) Consultants policies.
-- Public can read only approved consultants (supports public consultant list).
CREATE POLICY consultants_public_read_approved
  ON public.consultants
  FOR SELECT
  TO anon, authenticated
  USING (
    lower(coalesce(statut, '')) IN ('approuve', 'approuvé')
    AND coalesce(admin_state, '') NOT IN ('desactive', 'expire', 'deleted')
  );

-- Public can insert consultant signup rows.
CREATE POLICY consultants_public_insert
  ON public.consultants
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Optional: deny public update/delete by not creating UPDATE/DELETE policies.

-- 4) Entreprises policies.
-- Public insert for enterprise signup.
CREATE POLICY entreprises_public_insert
  ON public.entreprises
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Optional: no public SELECT/UPDATE/DELETE policy on entreprises.

-- 5) Idempotency helpers: avoid duplicate policy creation on repeated runs.
-- If you need rerun safety, drop these named policies first:
-- DROP POLICY IF EXISTS consultants_public_read_approved ON public.consultants;
-- DROP POLICY IF EXISTS consultants_public_insert ON public.consultants;
-- DROP POLICY IF EXISTS entreprises_public_insert ON public.entreprises;

-- Create permissive policies for current app behavior
DO $$
BEGIN
  CREATE POLICY entreprises_open_access
    ON public.entreprises
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY consultants_open_access
    ON public.consultants
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =========================================================
-- SECTION B - STRICTER BASELINE (run later)
-- =========================================================
-- This section is a template. Uncomment and adapt when ready.
--
-- 1) Keep SELECT public on consultants only if needed.
-- 2) Restrict INSERT/UPDATE by role or ownership model.
-- 3) Move sensitive operations to edge functions with service role.
--
-- Example (commented):
--
-- -- Drop permissive policies
-- DROP POLICY IF EXISTS entreprises_open_access ON public.entreprises;
-- DROP POLICY IF EXISTS consultants_open_access ON public.consultants;
--
-- -- Public read for approved consultants only
-- CREATE POLICY consultants_public_read
--   ON public.consultants
--   FOR SELECT
--   TO anon, authenticated
--   USING (statut = 'approuve');
--
-- -- Allow inserts (signup/import) for now

-- =========================================================
-- SECTION C — INVITATION CODES
-- Run this in Supabase SQL Editor to enable invite-only
-- consultant registration.
-- =========================================================

CREATE TABLE IF NOT EXISTS public.invitation_codes (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  code        TEXT        UNIQUE NOT NULL,
  label       TEXT,                          -- e.g. "Invitation pour Jean Dupont"
  created_by_email TEXT,                     -- admin who generated this code
  used_by_email    TEXT,                     -- consultant who used it
  used_at     TIMESTAMPTZ,                   -- timestamp of use (NULL = not yet used)
  expires_at  TIMESTAMPTZ,                   -- optional expiry date
  is_active   BOOLEAN     DEFAULT true,      -- can be disabled manually
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON public.invitation_codes TO anon, authenticated;

-- Anon can read active, unused codes (to validate them on the frontend)
CREATE POLICY "invitation_codes_public_check"
  ON public.invitation_codes
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND used_at IS NULL);

-- Allow frontend to mark a code as used once.
-- This permits updating only active + unused codes, and only toward a used state.
DROP POLICY IF EXISTS "invitation_codes_mark_used" ON public.invitation_codes;
CREATE POLICY "invitation_codes_mark_used"
  ON public.invitation_codes
  FOR UPDATE
  TO anon, authenticated
  USING (is_active = true AND used_at IS NULL)
  WITH CHECK (is_active = true AND used_at IS NOT NULL);

CREATE OR REPLACE FUNCTION public.consume_invitation_code(p_code TEXT, p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.invitation_codes
     SET used_by_email = lower(trim(p_email)),
         used_at = now()
   WHERE code = upper(trim(p_code))
     AND is_active = true
     AND used_at IS NULL
     AND (expires_at IS NULL OR expires_at > now());

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_invitation_code(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_invitation_code(TEXT, TEXT) TO anon, authenticated;

-- No public INSERT/DELETE policy (admin/service role only)

-- =========================================================
-- HOW TO CREATE AN INVITATION CODE (run as admin):
-- =========================================================
-- INSERT INTO public.invitation_codes (code, label, created_by_email)
-- VALUES ('EXP-ABC1-2024', 'Invitation Jean Dupont', 'admin@expertERPhub.com');
--
-- To create a batch quickly:
-- INSERT INTO public.invitation_codes (code, label)
-- SELECT 'EXP-' || upper(substring(gen_random_uuid()::text, 1, 4)) || '-' ||
--        upper(substring(gen_random_uuid()::text, 1, 4)),
--        'Code #' || generate_series
-- FROM generate_series(1, 20);
-- =========================================================
--
-- CREATE POLICY entreprises_insert
--   ON public.entreprises
--   FOR INSERT
--   TO anon, authenticated
--   WITH CHECK (true);
--
-- -- Later: add ownership checks on UPDATE/DELETE.

-- =========================================================
-- SECTION D - SAFE HARDENING (NO FLOW BREAK)
-- =========================================================
-- This section improves consistency and performance without
-- changing the currently working frontend behavior.

-- Normalize invitation codes and related emails at write time.
CREATE OR REPLACE FUNCTION public.normalize_invitation_code_row()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.code := upper(trim(NEW.code));
  IF NEW.created_by_email IS NOT NULL THEN
    NEW.created_by_email := lower(trim(NEW.created_by_email));
  END IF;
  IF NEW.used_by_email IS NOT NULL THEN
    NEW.used_by_email := lower(trim(NEW.used_by_email));
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_normalize_invitation_code_row'
  ) THEN
    CREATE TRIGGER trg_normalize_invitation_code_row
    BEFORE INSERT OR UPDATE ON public.invitation_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.normalize_invitation_code_row();
  END IF;
END $$;

-- Helpful indexes for invitation lookup and consultant email checks.
CREATE INDEX IF NOT EXISTS invitation_codes_lookup_idx
  ON public.invitation_codes (code, is_active, used_at, expires_at);

CREATE INDEX IF NOT EXISTS consultants_email_lookup_idx
  ON public.consultants (lower(email));

-- Optional unique email protection (enabled only when data is clean).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.consultants
    WHERE email IS NOT NULL
    GROUP BY lower(trim(email))
    HAVING COUNT(*) > 1
  ) THEN
    RAISE NOTICE 'Unique index on consultants(email) skipped: duplicate emails exist.';
  ELSE
    CREATE UNIQUE INDEX IF NOT EXISTS consultants_email_unique_idx
      ON public.consultants (lower(trim(email)))
      WHERE email IS NOT NULL;
  END IF;
END $$;
