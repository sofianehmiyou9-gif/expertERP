# ExpertERPHub — Rapport d'Audit Complet & Tests Fonctionnels

**Date :** 6 avril 2026
**Plateforme :** https://expert-erp.vercel.app/
**Auditeur :** Claude (Audit automatisé)
**Version testée :** Production (branche main)

---

## 1. Résumé Exécutif

Ce rapport combine un **audit de sécurité complet** du code, des API et de l'infrastructure, ainsi que des **tests fonctionnels end-to-end** réalisés comme un vrai utilisateur via le navigateur Chrome sur le site en production.

**Résultat global :** La plateforme est fonctionnelle et opérationnelle. Les fonctionnalités principales marchent correctement. Cependant, **15 vulnérabilités de sécurité** ont été identifiées, dont 5 critiques qui nécessitent une attention prioritaire avant l'acquisition de vrais clients.

---

## 2. Audit de Sécurité

### 2.1 Synthèse des Vulnérabilités

| Sévérité | Nombre | Statut |
|----------|--------|--------|
| CRITIQUE | 5 | À corriger en priorité |
| HAUTE | 3 | À corriger rapidement |
| MOYENNE | 4 | À planifier |
| BASSE | 3 | Améliorations recommandées |
| **Total** | **15** | |

### 2.2 Vulnérabilités CRITIQUES (5)

**C1 — XSS DOM dans la messagerie (messaging.js)**
Les noms d'utilisateur sont injectés via `innerHTML` sans échappement. Un attaquant peut injecter du HTML/JS malveillant via un nom de consultant contenant des balises `<script>` ou des attributs `onerror`.
*Impact :* Vol de session, exfiltration de données.
*Correction :* Remplacer `innerHTML` par `textContent` ou utiliser une fonction d'échappement HTML systématique.

**C2 — Absence de politique RLS DELETE sur les consultants**
La table `consultants` n'a pas de politique RLS pour DELETE. Bien que cela bloque les suppressions via l'API anon (comportement par défaut de Supabase), ce n'est pas explicitement sécurisé.
*Impact :* Risque si les politiques RLS changent ou si un accès non-anon est configuré.
*Correction :* Ajouter une politique DELETE explicite : `CREATE POLICY "deny_anon_delete" ON consultants FOR DELETE USING (false);`

**C3 — Endpoint email sans authentification ni rate limiting (api/send-email.js)**
La fonction serverless Vercel `api/send-email.js` ne vérifie pas l'identité de l'appelant et n'a pas de limitation de débit. Peut être utilisé comme relais de spam.
*Impact :* Abus de l'endpoint pour envoyer des emails de spam, dégradation de la réputation du domaine.
*Correction :* Ajouter une vérification de session, un rate limiter (ex: Vercel Edge Config ou Redis), et un CAPTCHA côté client.

**C4 — XSS via handlers onclick avec échappement insuffisant**
Certains gestionnaires `onclick` dans `index.html` et `dashboard-entreprise.html` construisent des chaînes JavaScript avec des valeurs non échappées pour le contexte JS.
*Impact :* Injection de code JavaScript via des données de consultant malveillantes.
*Correction :* Utiliser `data-*` attributs + `addEventListener` au lieu de `onclick` inline avec concaténation de chaînes.

**C5 — Fonction safe() incomplète pour le contexte JavaScript**
La fonction `safe()` échappe les caractères HTML (`<`, `>`, `&`, `"`, `'`) mais pas les caractères dangereux dans un contexte JavaScript (backtick, `\n`, `\r`).
*Impact :* Contournement de l'échappement dans les attributs `onclick` et les template literals.
*Correction :* Créer une fonction `safeJS()` dédiée qui échappe aussi les backticks, backslashes et caractères de contrôle.

### 2.3 Vulnérabilités HAUTES (3)

**H1 — Clé anon Supabase exposée côté client avec UPDATE permissif**
Les politiques RLS UPDATE sur `consultants` et `entreprises` utilisent `USING (true)`, permettant à n'importe qui avec la clé anon de modifier n'importe quel enregistrement.
*Impact :* Modification malveillante de profils consultants ou entreprises.
*Correction :* Migrer vers des Edge Functions Supabase avec `service_role` key pour les opérations admin.

**H2 — Session forgeable côté client**
`portal-auth.js` utilise SHA-256 avec un sel côté client pour signer les sessions localStorage. Le sel étant dans le code source, un attaquant peut forger une session valide.
*Impact :* Usurpation d'identité, accès non autorisé aux dashboards.
*Correction :* Migrer vers Supabase Auth avec des JWT signés côté serveur.

**H3 — Pas de validation CSRF sur les actions sensibles**
Les formulaires d'inscription, de modification de profil et d'import de ressources n'ont pas de protection CSRF.
*Impact :* Un site malveillant peut soumettre des formulaires au nom d'un utilisateur connecté.
*Correction :* Implémenter des tokens CSRF ou utiliser l'en-tête `SameSite=Strict` sur les cookies de session.

### 2.4 Vulnérabilités MOYENNES (4)

**M1 — Absence de Content Security Policy stricte**
Le CSP utilise `unsafe-inline` pour `script-src` et `style-src`, ce qui réduit considérablement la protection contre les XSS.
*Correction planifiée :* Migrer vers des fichiers JS externes avec des nonces CSP.

**M2 — Pas de validation des entrées côté serveur**
Les données des formulaires (inscription consultant, import Excel) ne sont validées que côté client. Un attaquant peut envoyer des requêtes directes à l'API Supabase avec des données malformées.
*Correction :* Ajouter des contraintes CHECK en base de données et/ou des Edge Functions de validation.

**M3 — Import Excel sans sanitisation**
La fonction `parseXlsxRows()` parse les fichiers Excel uploadés sans vérifier la taille, le nombre de lignes, ou sanitiser les valeurs des cellules.
*Correction :* Limiter la taille du fichier, le nombre de lignes, et échapper les valeurs avant insertion.

**M4 — Logs d'erreur exposés en console**
Les erreurs Supabase sont affichées en console avec les détails de la requête, potentiellement utiles pour un attaquant.
*Correction :* Supprimer les `console.error` détaillés en production.

### 2.5 Vulnérabilités BASSES (3)

**B1 — Pas de politique de mot de passe pour les entreprises**
L'inscription entreprise ne vérifie pas la complexité du mot de passe.

**B2 — Absence de headers de sécurité supplémentaires**
Manque de `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` dans la config Vercel.

**B3 — Dépendances CDN sans intégrité (SRI)**
Les scripts CDN (Tailwind, SheetJS) sont chargés sans attribut `integrity`, vulnérables à une compromission CDN.

---

## 3. Tests Fonctionnels (End-to-End via Navigateur)

### 3.1 Méthodologie

Tests réalisés le 6 avril 2026 sur le site de production (https://expert-erp.vercel.app/) via Chrome, en tant qu'utilisateur réel connecté comme entreprise "StratERP Solutions" (p.gauthier@straterp.com).

### 3.2 Pages Publiques

| Test | Résultat | Détails |
|------|----------|---------|
| Page d'accueil (Accueil) | ✅ PASS | Hero section, carte consultant Sophie C., barre de recherche, CTAs, section "Comment ça marche" en 3 étapes |
| Page Consultants | ✅ PASS | Grille de consultants en 2 colonnes, filtres (ERP, Rôle, Mode travail, Ville, Disponibilité, Tarif), pagination (3 pages), 8 consultants visibles par page |
| Page Entreprises | ✅ PASS | Hero bleu, 3 CTAs, section Placement + section Accès avec gate 2 chemins (Entreprise partenaire / Visiteur pro) |
| Profil Consultant (Claire Dupont) | ✅ PASS | En-tête avec avatar, badges, compétences, stats (7+ ans, Bordeaux, 650-850$/jour), résumé, certifications, expériences, section contact |
| Navigation SPA | ✅ PASS | Navigation entre sections sans rechargement de page, boutons de navigation fonctionnels |
| Visibilité B2B | ✅ PASS | Ressources B2B ("Ressource partenaire") visibles car connecté en entreprise |

### 3.3 Dashboard Entreprise — Sidebar Navigation

| Onglet | Résultat | Détails |
|--------|----------|---------|
| Mes Ressources | ✅ PASS | 5 ressources affichées (David Roy, Emilie Gagnon, Catherine Lavoie, Samira Hassan, Marc-André Pelletier), stats strip (5 ressources, 5 publiées, $1005), badges ENTREPRISE/B2B |
| Ajouter | ✅ PASS | Zone drag & drop CSV/Excel, formulaire d'ajout manuel avec tous les champs (Nom, ERP, Rôle, Module, Expérience, Taux, Mode travail, Ville, Langues) |
| Rechercher | ✅ PASS | Filtres de recherche (Mot-clé, ERP, Rôle, Disponibilité, Tarif max, Ville), 19 consultants trouvés, cartes de résultats avec tags et boutons Contacter/Profil |
| Messages | ✅ PASS | Interface de messagerie avec panneau Conversations (gauche) et zone de chat (droite), état vide correct |
| Favoris | ✅ PASS | État vide avec message explicatif redirigeant vers l'onglet Rechercher |
| Historique | ✅ PASS | "Historique des contacts" avec état vide correct |
| Équipe | ✅ PASS | Formulaire d'invitation (email + rôle Manager), table des membres avec p.gauthier@straterp.com / Owner / Actif |
| Mon Profil | ✅ PASS | Formulaire éditable (nom, secteur, ville, site web, téléphone, taille, description), logo upload, barre de complétion 29%, infos plan (Growth, 5 slots) |

### 3.4 Dashboard Entreprise — Fonctionnalités

| Test | Résultat | Détails |
|------|----------|---------|
| Toggle Vue cartes / Vue tableau | ✅ PASS | Bascule fluide entre les deux vues. Vue tableau affiche PHOTO, NOM, ERP(S), TAUX, STATUT, VISIBILITÉ, CARTE LIÉE sans débordement horizontal |
| Colonnes masquées en tableau | ✅ PASS | Colonnes Rôle (4e) et Date (9e) correctement masquées via CSS nth-child |
| Filtres Mes Ressources | ✅ PASS | Dropdowns statut et visibilité fonctionnels |
| Boutons Voir fiche / Modifier | ✅ PASS | Liens "Voir" redirigent vers consultant.html, boutons "Modifier" présents |
| Badges visibilité | ✅ PASS | B2B UNIQUEMENT (bleu) et TOUT PUBLIC (vert) correctement affichés |
| Export CSV | ✅ PRÉSENT | Bouton visible et cliquable (non testé pour le téléchargement effectif) |
| Déconnexion | ✅ PRÉSENT | Bouton visible dans la navbar |
| Sidebar active state | ✅ PASS | L'onglet actif est correctement surligné avec un indicateur bleu à gauche |
| User info sidebar | ✅ PASS | "StratERP S... / Owner" affiché en bas de la sidebar |

### 3.5 Responsive Mobile

| Test | Résultat | Détails |
|------|----------|---------|
| Bottom nav mobile | ⚠️ NON TESTÉ | La simulation de viewport mobile via l'outil de resize navigateur n'a pas produit de résultats exploitables dans l'environnement de test. Le CSS (`@media max-width:768px`) est en place dans le code. |
| Sidebar masquée sur mobile | ⚠️ NON TESTÉ | Le CSS `@media max-width:768px { .sidebar-nav { display:none !important; } }` est en place dans le code. |

### 3.6 Internationalisation

| Test | Résultat | Détails |
|------|----------|---------|
| Toggle FR/EN | ✅ PRÉSENT | Boutons FR et EN visibles dans la navbar du dashboard |

---

## 4. Problèmes Visuels & UX Constatés

| # | Problème | Sévérité | Détails |
|---|----------|----------|---------|
| V1 | Complétion profil entreprise basse | Info | Le profil StratERP Solutions est à 29% — certains champs (secteur, ville, site web, description) sont vides |
| V2 | Texte tronqué dans les cartes ressources | Mineure | Certains noms longs (Marc-André Pelleti...) et ERP (Microsoft Dynamics...) sont tronqués avec ellipsis |
| V3 | Navbar desktop occupe beaucoup de place | Info | Avec sidebar + navbar, l'espace vertical pour le contenu est légèrement réduit |

---

## 5. Recommandations Prioritaires

### Priorité 1 — Avant mise en production avec clients (1-2 semaines)

1. **Corriger les XSS** (C1, C4, C5) — Remplacer tous les `innerHTML` par `textContent`, utiliser `data-*` attributs au lieu de `onclick` inline
2. **Sécuriser l'endpoint email** (C3) — Ajouter auth + rate limiting
3. **Ajouter la politique RLS DELETE** (C2) — Une ligne de SQL

### Priorité 2 — Court terme (1 mois)

4. **Migrer vers Supabase Auth** (H2) — Remplacer les sessions localStorage forgées
5. **Sécuriser les UPDATE RLS** (H1) — Edge Functions avec service_role key
6. **Ajouter CSRF protection** (H3)

### Priorité 3 — Moyen terme (2-3 mois)

7. **Renforcer le CSP** (M1) — Migrer vers des fichiers JS externes + nonces
8. **Validation côté serveur** (M2, M3) — Contraintes DB + Edge Functions
9. **Headers de sécurité** (B2) — Ajouter dans vercel.json
10. **SRI sur les CDN** (B3) — Ajouter les attributs integrity

---

## 6. Conclusion

La plateforme ExpertERPHub est **fonctionnellement opérationnelle**. Tous les parcours utilisateur testés (navigation publique, dashboard entreprise, gestion de ressources, recherche, messagerie, profil, équipe) fonctionnent correctement.

Les **5 vulnérabilités critiques** identifiées doivent être adressées avant de recevoir de vrais clients, en particulier les failles XSS et l'endpoint email non sécurisé. Le plan de remédiation proposé est réaliste et peut être exécuté en 2-3 sprints.

---

*Rapport généré automatiquement le 6 avril 2026.*
