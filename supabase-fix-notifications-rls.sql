-- ============================================================
-- FIX: Autoriser les INSERT anon sur la table notifications
--
-- Problème: Le formulaire de contact sur la page profil consultant
-- utilise ExpertNotifications.push() qui INSERT dans la table
-- "notifications" via l'API REST avec la clé anon.
-- L'INSERT échoue avec 401 car il n'y a pas de politique RLS
-- qui autorise les INSERT pour le rôle anon.
--
-- À exécuter dans: Supabase SQL Editor (rôle postgres)
-- URL: https://supabase.com/dashboard/project/aqvkcbeezzbmoiykzfyo/sql
-- ============================================================

-- 1. Vérifier que RLS est activé
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 2. Politique SELECT: anon peut lire les notifications
CREATE POLICY IF NOT EXISTS "notifications_anon_select"
  ON notifications FOR SELECT
  TO anon
  USING (true);

-- 3. Politique INSERT: anon peut créer des notifications (formulaire contact)
CREATE POLICY IF NOT EXISTS "notifications_anon_insert"
  ON notifications FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Politique UPDATE: anon peut mettre à jour (marquer lu, répondre)
CREATE POLICY IF NOT EXISTS "notifications_anon_update"
  ON notifications FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Vérification
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY policyname;
