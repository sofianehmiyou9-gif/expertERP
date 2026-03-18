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
-- CREATE POLICY consultants_insert
--   ON public.consultants
--   FOR INSERT
--   TO anon, authenticated
--   WITH CHECK (true);
--
-- CREATE POLICY entreprises_insert
--   ON public.entreprises
--   FOR INSERT
--   TO anon, authenticated
--   WITH CHECK (true);
--
-- -- Later: add ownership checks on UPDATE/DELETE.
