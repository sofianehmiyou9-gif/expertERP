-- ═══════════════════════════════════════════════════════════════
-- FIX RLS: Permettre INSERT anon sur la table entreprises
-- Date: 2026-04-12
-- Contexte: L'inscription entreprise ET visiteur pro échouent
--           car le INSERT via API anon est bloqué (erreur 42501).
-- ═══════════════════════════════════════════════════════════════

-- 1) Diagnostic : lister les policies actives sur entreprises
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'entreprises';

-- 2) Supprimer toute ancienne policy INSERT conflictuelle
DROP POLICY IF EXISTS entreprises_public_insert ON public.entreprises;
DROP POLICY IF EXISTS entreprises_open_access ON public.entreprises;

-- 3) Recréer la policy INSERT avec WITH CHECK (true)
CREATE POLICY entreprises_public_insert
  ON public.entreprises
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4) Vérifier que RLS est bien activé
ALTER TABLE public.entreprises ENABLE ROW LEVEL SECURITY;

-- 5) S'assurer que les GRANTS sont corrects
GRANT SELECT, INSERT, UPDATE ON public.entreprises TO anon, authenticated;

-- 6) Vérification finale
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'entreprises';
