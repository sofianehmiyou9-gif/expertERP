# Audit Complet ExpertERPHub — 6 avril 2026

## Résumé Global

| Catégorie | Critiques | Warnings | Info |
|-----------|-----------|----------|------|
| JS Core (8 fichiers) | 1 | 8 | 12 |
| Dashboards (3 fichiers) | 0 | 4 | 2 |
| Sécurité/Déploiement (5 fichiers) | 4 | 4 | 3 |
| **TOTAL** | **5** | **16** | **17** |

---

## CRITIQUES (à corriger en priorité)

### 1. portal-auth.js — Signature de session forgeable
La signature de session utilise un hash DJB2 (non cryptographique). Un attaquant peut modifier role/email/expiresAt dans localStorage et recalculer la signature pour s'élever en admin.
**Fix:** Remplacer par crypto.subtle.digest('SHA-256') ou valider la session côté serveur.

### 2. supabase-rls-policies.sql — Policies UPDATE trop permissives
`consultants_public_update` et `entreprises_public_update` ont USING(true) / WITH CHECK(true). N'importe qui peut modifier n'importe quel profil (nom, email, statut, TJM...).
**Fix:** Ajouter des checks d'ownership ou utiliser une fonction SECURITY DEFINER.

### 3. supabase-rls-policies.sql — Policies open_access dupliquées (lignes 122-142)
Les blocs DO $$ recréent des policies `open_access` FOR ALL qui écrasent les policies restrictives créées juste avant.
**Fix:** Supprimer les lignes 122-142 du fichier SQL.

### 4. vercel.json — CSP autorise 'unsafe-inline' pour scripts
Le header script-src inclut 'unsafe-inline', ce qui permet l'exécution de scripts injectés (XSS).
**Fix:** Retirer 'unsafe-inline' et utiliser des nonces sur les scripts inline légitimes.

### 5. supabase-security-fixes.sql — Hash admin hardcodé sans documentation
Le hash admin dans is_admin_email() doit rester synchronisé avec config.js. Aucun commentaire n'indique quel email correspond au hash.
**Fix:** Ajouter un commentaire documentant la correspondance.

---

## WARNINGS (à corriger bientôt)

### Console.log en production
- messaging.js : 8 occurrences (emails, thread IDs exposés)
- notifications.js : 4 occurrences
- dashboard-admin.html : console.error ligne 1917
**Fix:** Supprimer ou conditionner (if DEBUG).

### XSS potentiel dans messaging.js
Le body du message est inséré sans échappement HTML.
**Fix:** Échapper le body avant envoi ou s'assurer que l'affichage échappe toujours.

### Race condition dans notifications.js markAllRead()
Le cache est mis à jour de façon synchrone mais les PATCH Supabase sont async et peuvent échouer silencieusement.
**Fix:** Await les patches ou ajouter un fallback.

### supabase-auth-client.js — Tokens en localStorage
access_token et refresh_token en clair dans localStorage, volables via XSS.
**Fix:** Migrer vers sessionStorage ou cookies httpOnly.

### sbInsert() retour incohérent
supabase-helpers.js retourne parfois {success: true}, parfois la réponse réelle.
**Fix:** Uniformiser le retour.

### config.js — Placeholder ACCESS_TOKEN_HASH
Le hash 'a1b2c3d4e5f6' est un placeholder non sécurisé.
**Fix:** Remplacer par un vrai hash ou supprimer si non utilisé.

---

## INFO (améliorations optionnelles)

- Pas de timeout sur les appels fetch (supabase-helpers.js)
- Pas de cache pour le hash SHA-256 admin (utils.js)
- URL email hardcodée dans email-notify.js (devrait être dans config.js)
- Pas de rate limiting sur validation email (inscription-consultant.js)
- Pas d'index explicite sur stripe_event_id (billing schema)
- alert() utilisé pour les erreurs au lieu de toast notifications (dashboard-admin.html)

---

## Statut par fichier

| Fichier | Status | Issues |
|---------|--------|--------|
| config.js | ✅ OK | 1 warning (placeholder hash) |
| supabase-helpers.js | ⚠️ | 4 issues (retour, error handling) |
| portal-auth.js | 🔴 CRITIQUE | Signature forgeable |
| messaging.js | ⚠️ | 5 issues (console.log, XSS) |
| notifications.js | ⚠️ | 5 issues (race condition, logs) |
| utils.js | ✅ OK | 3 mineurs |
| email-notify.js | ✅ OK | 3 mineurs |
| cookie-consent.js | ✅ OK | 2 mineurs |
| dashboard-admin.html | ✅ OK | 1 warning (console.error) |
| consultant.html | ✅ OK | 2 mineurs |
| inscription-consultant.js | ✅ OK | 2 warnings |
| vercel.json | 🔴 CRITIQUE | CSP unsafe-inline |
| supabase-rls-policies.sql | 🔴 CRITIQUE | Policies trop permissives |
| supabase-security-fixes.sql | ⚠️ | Hash admin, regex email |
| supabase-billing-schema.sql | ✅ OK | 1 mineur |
| supabase-auth-client.js | ⚠️ | Tokens en localStorage |
