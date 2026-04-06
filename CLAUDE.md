# ExpertERPHub — Mémoire Projet pour Claude

> Ce fichier est lu automatiquement par Claude au début de chaque session.
> Il contient toute l'architecture, les règles critiques, et l'état actuel du projet.
> **Dernière mise à jour : 2026-04-06**

---

## RÈGLES CRITIQUES (À RESPECTER ABSOLUMENT)

### 1. Pas de push GitHub depuis Claude
- **TOUT le travail se fait en LOCAL uniquement** (fichiers dans ce repo).
- L'utilisateur push lui-même depuis VS Code PowerShell à `C:\Users\sofia\OneDrive\Documents\Claude\Projects\ExpertERPHUB`.
- Ne JAMAIS exécuter `git push` ou toute commande git distante.

### 2. Mot de passe admin inchangeable
- Le hash du mot de passe admin NE DOIT JAMAIS être modifié.
- Hash SHA-256 du mot de passe admin : `dc7e5959782f36f7f99fa7f893d693262581aeb21b87a822a23c66b98e63fc0d`
- Ce hash est utilisé dans `dashboard-admin.html` (variable `ADMIN_PWD_HASH`) et dans `config.js` (`ADMIN_EMAIL_HASHES`).
- Si tu tombes sur ce hash dans le code, ne le touche pas.

### 3. Design horizontal et compact
- Les layouts doivent être **HORIZONTAUX et COMPACTS**, jamais verticaux avec trop d'espace vide.
- Éviter les longues pages scrollables quand un layout en grille/colonnes est possible.

### 4. Décisions de sécurité documentées
- **CSP `unsafe-inline`** : Requis dans `script-src` et `style-src` car tout le JS est inline dans les HTML et Tailwind injecte des styles inline. Ne pas retirer sans migrer vers des fichiers JS externes + nonces.
- **RLS UPDATE permissif** : Les policies UPDATE sur `consultants` et `entreprises` sont `USING (true)` car le dashboard admin utilise la clé anon Supabase. Migration prévue vers Edge Functions + service_role key.
- **Session signature SHA-256** : `portal-auth.js` utilise SHA-256 (async via Web Crypto API) pour signer les sessions localStorage. Le sel est côté client donc pas cryptographiquement sûr, mais empêche la falsification triviale. Les anciennes sessions DJB2 sont auto-migrées.

---

## BUSINESS MODEL

**ExpertERPHub** est une plateforme B2B de staffing ERP ("annuaire premium + mise en relation") qui connecte :
- **Entreprises partenaires** : firmes de conseil/ESN qui placent leurs consultants ERP disponibles ou cherchent des ressources qualifiées d'autres firmes
- **Consultants freelances** : experts ERP indépendants visibles publiquement
- **Visiteurs professionnels** : accès limité aux freelances uniquement (pas de ressources B2B entreprise)

### Modèle de revenus
- Inscription entreprise gratuite → accès aux profils
- Messagerie directe = plan payant (Stripe billing intégré)
- Codes d'invitation pour l'inscription consultant (optionnel)

---

## INFRASTRUCTURE

### Hébergement & Déploiement
- **Frontend** : Site statique (HTML/CSS/JS vanilla) déployé sur **Vercel**
- **URL prod** : `https://expert-erp.vercel.app/`
- **Backend** : **Supabase** (PostgreSQL + REST API + Auth)
- **Supabase URL** : `https://aqvkcbeezzbmoiykzfyo.supabase.co`
- **Vercel config** : `vercel.json` (rewrites, headers CSP, etc.)

### Configuration côté client
- `config.js` : IIFE qui expose `window.ExpertConfig` avec :
  - `SB_URL` : URL Supabase
  - `SB_KEY` : Clé anon Supabase (publique, publishable)
  - `ADMIN_EMAIL_HASHES` : tableau de hash SHA-256 des emails admin
  - `ACCESS_TOKEN_HASH` : hash pour tokens d'accès

### Helpers Supabase
- `supabase-helpers.js` : IIFE qui expose `window.ExpertSB` et des fonctions globales :
  - `sbFetch(table, query)` — GET (lecture)
  - `sbSelect(table, query)` — alias de sbFetch
  - `sbInsert(table, data)` — POST (insertion)
  - `sbUpdate(table, id, data)` — PATCH (mise à jour)
  - `sbDelete(table, id)` — DELETE
  - `sbRpc(fnName, params)` — Appel de fonction PostgreSQL
  - `parseNotes(raw)` — Parse JSON notes_admin
  - `normalizeStatus(value)` — Normalise les statuts
  - `sha256Hex(text)` — Hash SHA-256

### Authentification portail
- `portal-auth.js` : Gestion de session côté client via `localStorage`
  - `window.ExpertPortalAuth.getSession()` — récupère la session courante
  - `setSession({role, email})` — crée une session (TTL 8h)
  - `clearSession()` — déconnexion
  - Rôles : `consultant`, `entreprise`, `admin`, `visiteur_pro`
  - `_isEnterprise` : flag booléen dérivé de `session.role === 'entreprise'`

---

## STRUCTURE DES FICHIERS

### Pages principales
| Fichier | Description |
|---------|-------------|
| `index.html` | Page principale SPA (~397KB). Contient TOUT : accueil, consultants, entreprises, tarifs, inscription, modals, filtres, etc. |
| `consultant.html` | Page profil consultant individuelle |
| `dashboard-admin.html` | Dashboard administrateur |
| `dashboard-consultant.html` | Dashboard consultant |
| `dashboard-entreprise.html` | Dashboard entreprise |
| `inscription-consultant.html` | Formulaire d'inscription consultant |
| `reset-password.html` | Page de reset mot de passe |
| `recovery.html` | Page de récupération |

### Scripts JS
| Fichier | Description |
|---------|-------------|
| `config.js` | Configuration Supabase (SB_URL, SB_KEY, hashes admin) |
| `supabase-helpers.js` | CRUD Supabase (sbFetch, sbInsert, sbUpdate, sbDelete, sbRpc) |
| `portal-auth.js` | Gestion session localStorage (rôles, TTL 8h) |
| `profile-enhancer.js` | Enrichissement des profils consultant |
| `messaging.js` | Système de messagerie (nécessite plan payant) |
| `notifications.js` | Système de notifications |
| `i18n.js` | Internationalisation FR/EN |
| `translate-content.js` | Traduction du contenu |
| `cookie-consent.js` | Bannière de consentement cookies |
| `email-notify.js` | Notifications email |
| `supabase-auth-client.js` | Client auth Supabase |
| `inscription-consultant.js` | Logique d'inscription consultant |
| `seed-consultants.js` | Données de seed consultants |
| `utils.js` | Utilitaires divers |

### Fichiers SQL
| Fichier | Description |
|---------|-------------|
| `supabase-rls-policies.sql` | Politiques RLS (Row Level Security) |
| `supabase-billing-schema.sql` | Schéma billing Stripe (billing_subscriptions, billing_webhook_events) |
| `seed-entreprises.sql` | Script de seed des 2 entreprises + 10 ressources B2B |

### Autres
| Fichier | Description |
|---------|-------------|
| `vercel.json` | Config Vercel (rewrites, headers CSP) |
| `ExpertERPHub-Modele-Ressources.xlsx` | Template Excel pour import de ressources |
| `api/send-email.js` | Serverless function Vercel pour envoi d'emails |

---

## BASE DE DONNÉES SUPABASE

### Tables principales

#### `consultants`
Colonnes publiques : `id, created_at, nom, prenom, email, telephone, titre, experience_annees, competences, disponibilite, tjm_min, tjm_max, notes_admin, statut`

- `statut` : `approuve`, `en_attente`, `refuse`, `en_mission`
- `notes_admin` : champ JSON (string) contenant les métadonnées étendues :
  ```json
  {
    "source": "import_b2b",           // "import_b2b" = ressource entreprise, sinon freelance
    "entreprise_nom": "Nexia Conseil",
    "entreprise_email": "i.mercier@nexiaconseil.ca",
    "visibility": "private",
    "resume": "...",
    "annees_exp": 8,
    "ville": "Montréal",
    "mode_travail": "Hybride",
    "langues": "Français, Anglais",
    "secteurs": ["Finance", "Assurance"],
    "certifications": ["SAP S/4HANA"],
    "erp_modules": ["SAP FI/CO"]
  }
  ```
- **Filtre B2B** : `notes.source === 'import_b2b'` → ressource d'entreprise. Si `_isEnterprise` est false, ces consultants sont **cachés**.

#### `entreprises`
Colonnes : `id, created_at, nom, email, telephone, site_web, secteur, taille, description, statut, password_hash, ...`

- `statut` : `approuve`, `en_attente`, `refuse`

#### `invitation_codes`
Pour l'inscription consultant par invitation.
- `code, label, created_by_email, used_by_email, used_at, expires_at, is_active`
- Fonction RPC : `consume_invitation_code(p_code, p_email)`

#### `billing_subscriptions`
Schéma Stripe-ready pour les abonnements entreprise.
- `entreprise_email, stripe_customer_id, stripe_subscription_id, status`
- Status : `inactive, trialing, active, past_due, canceled, unpaid`
- Fonction : `is_subscription_active(p_email)`

### RLS (Row Level Security)

#### Consultants
- **SELECT** : anon peut lire uniquement les profils `approuve`
- **INSERT** : anon peut insérer (inscription/import)
- **UPDATE** : anon peut mettre à jour (compatibilité dashboard admin)
- **DELETE** : PAS de politique → **impossible via API anon** (doit utiliser SQL Editor avec rôle postgres)

#### Entreprises
- **SELECT** : anon peut lire
- **INSERT** : politique existe MAIS **en pratique bloqué** — les INSERT via API anon échouent (erreur 42501 RLS). Utiliser le SQL Editor Supabase (rôle postgres) pour insérer.
- **UPDATE** : anon peut mettre à jour
- **DELETE** : **bloqué via API anon** (le DELETE retourne 204 mais ne supprime rien). Utiliser le SQL Editor.

> **IMPORTANT** : Pour toute modification des données `entreprises` (INSERT/DELETE), utiliser obligatoirement le **Supabase SQL Editor** avec le rôle `postgres`. L'API anon ne fonctionne pas pour ces opérations.

---

## DONNÉES ACTUELLES (État au 2026-03-28)

### Entreprises (2 entrées)
| Nom | Email | Statut |
|-----|-------|--------|
| Nexia Conseil | i.mercier@nexiaconseil.ca | approuve |
| StratERP Solutions | p.gauthier@straterp.com | approuve |

### Ressources B2B (10 consultants import_b2b)
**Nexia Conseil (5)** :
1. Alexandre Tremblay — Consultant fonctionnel SAP FI/CO
2. Jean-François Côté — Consultant technique SAP ABAP/S4
3. Marie-Ève Bouchard — Chef de projet Oracle Cloud
4. Nadia El Fassi — Consultante SAP MM/SD
5. Patrick Nguyen — Analyste fonctionnel Oracle EBS

**StratERP Solutions (5)** :
1. Catherine Lavoie — Consultante Dynamics 365 F&O
2. David Roy — Architecte Dynamics 365 CE
3. Émilie Gagnon — Chef de projet Workday HCM
4. Marc-André Pelletier — Développeur Dynamics 365
5. Samira Hassan — Consultante Workday HCM

### Freelances
~12+ consultants freelances (sans `source: import_b2b` dans notes_admin), visibles par tout le monde.

---

## FONCTIONNALITÉS RÉCENTES (Mars 2026)

### Template Excel pour import de ressources
- Remplace l'ancien CSV par un fichier `.xlsx` professionnel
- Template intégré en base64 dans `index.html` via `downloadOfferTemplate()`
- Parsing côté client avec **SheetJS** (CDN : `https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js`)
- Fonction `parseXlsxRows(json)` mappe les colonnes du template vers les champs consultant
- Labels mis à jour : "Import en lot (Excel)", "Télécharger le modèle Excel"

### Gate d'accès 2 chemins (page Entreprises)
La carte "Accédez aux ressources qualifiées d'autres firmes" propose 2 options :
- **Option A — Entreprise partenaire** (badge "Recommandé") : inscription entreprise, accès complet
- **Option B — Visiteur professionnel** : accès freelances uniquement, pas d'inscription requise

### Filtre de visibilité B2B
```javascript
var isB2B = notes.source === 'import_b2b';
if (isB2B && !_isEnterprise) return false;
```
Les ressources B2B sont **totalement cachées** pour les non-entreprises (même si visibility = 'public').

### Overlay gate messagerie
`showContactGateOverlay()` : modal overlay pour les utilisateurs non-connectés qui cliquent "Contacter", expliquant que la messagerie nécessite une inscription entreprise + plan actif.

### Système de codes d'invitation
Table `invitation_codes` + fonction `consume_invitation_code()` pour contrôler l'inscription des consultants.

### Billing Stripe (schéma prêt)
Table `billing_subscriptions` + `billing_webhook_events` prêtes pour l'intégration Stripe. Fonction `is_subscription_active(p_email)` pour vérifier les abonnements.

---

## DÉPENDANCES CDN

| Librairie | CDN | Usage |
|-----------|-----|-------|
| Tailwind CSS 3.4.17 | `cdn.tailwindcss.com/3.4.17?plugins=forms,container-queries` | Styles |
| Google Fonts | Newsreader + Manrope + Material Symbols Outlined | Typographie + Icônes |
| SheetJS 0.20.3 | `cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js` | Parsing Excel |

---

## WORKFLOW DE DÉVELOPPEMENT

### Flux actuel (direct en prod)
1. Claude modifie les fichiers **localement** dans ce repo
2. L'utilisateur vérifie les changements
3. L'utilisateur push depuis **VS Code PowerShell** : `git add . && git commit -m "..." && git push`
4. Vercel déploie automatiquement depuis GitHub
5. Pour les données Supabase (surtout `entreprises`) : utiliser le **SQL Editor Supabase** directement

### Flux QA / Staging (à mettre en place quand il y aura des clients)
Le but : ne jamais déployer en prod sans avoir testé sur un environnement de staging.

**Principe : 2 branches GitHub = 2 environnements Vercel**
- `main` → **PROD** → `expert-erp.vercel.app` (les clients)
- `dev` → **STAGING** → URL preview auto-générée par Vercel (test uniquement)

**Flux de travail cible :**
1. Claude travaille sur la branche `dev`
2. L'utilisateur push sur `dev` → Vercel génère une preview URL
3. Tests / validation sur la preview URL
4. Quand c'est OK → Pull Request `dev → main` sur GitHub
5. Merge → Vercel déploie en prod automatiquement

**Côté Supabase (optionnel mais recommandé) :**
- Créer un 2e projet Supabase pour le staging (base de données séparée)
- Utiliser les variables d'environnement Vercel pour switcher les clés :
  - Production : `SB_URL` et `SB_KEY` du projet prod
  - Preview : `SB_URL` et `SB_KEY` du projet staging
- Ça évite de casser les données clients en testant

**Commandes pour initialiser le setup :**
```powershell
git checkout -b dev
git push -u origin dev
# Ensuite travailler toujours sur dev, merger vers main via PR GitHub
```

### Accès Supabase SQL Editor
- URL : `https://supabase.com/dashboard/project/aqvkcbeezzbmoiykzfyo/sql`
- Utiliser le rôle `postgres` pour bypasser les RLS
- Pour les DELETE : Supabase affiche un dialog de confirmation "Potential issue detected" → cliquer "Run this query"
- Pour injecter du SQL multi-lignes : utiliser l'API Monaco `monaco.editor.getModels()[0].setValue("...")`

---

## NOTES TECHNIQUES IMPORTANTES

### Le sandbox bloque les appels réseau vers Supabase
- `curl` depuis le terminal Claude retourne HTTP 403 (proxy bloqué)
- Solution : utiliser les outils Chrome (browser) pour toute interaction avec l'API Supabase

### Structure de données consultant pour insertion
```javascript
{
  prenom: "...",
  nom: "...",
  email: "...",
  telephone: "+1-514-...",
  titre: "Consultant SAP FI/CO",
  competences: ["SAP", "FI/CO", "S/4HANA"],
  tjm_min: 800,
  tjm_max: 1050,
  statut: "approuve",
  notes_admin: JSON.stringify({
    source: "import_b2b",
    entreprise_nom: "Nexia Conseil",
    entreprise_email: "i.mercier@nexiaconseil.ca",
    visibility: "private",
    resume: "...",
    annees_exp: 8,
    ville: "Montréal",
    mode_travail: "Hybride",
    langues: "Français, Anglais",
    secteurs: ["Finance"],
    certifications: ["SAP S/4HANA"],
    erp_modules: ["SAP FI/CO"]
  })
}
```

### Page SPA (index.html)
`index.html` est une **Single Page Application** de ~397KB. Elle contient toutes les sections (accueil, consultants, entreprises, tarifs, inscription, etc.) avec navigation par `data-action="show-page"` et `data-page="..."`.

### Fonctions clés dans index.html
- `downloadOfferTemplate()` — Télécharge le template Excel (base64 → blob)
- `handleFileSelect()` — Parse les fichiers uploadés (.xlsx avec SheetJS, .csv legacy)
- `parseXlsxRows(json)` — Mappe les colonnes Excel vers les champs consultant
- `openConsultantContact(id, event)` — Ouvre le contact ou la gate overlay
- `showContactGateOverlay()` — Affiche le modal de gate messagerie
- `openEntrepriseModal(mode)` — Ouvre le modal d'inscription entreprise (mode: 'chercher' ou 'placer')
- `buildConsultantUrl(id, hash)` — Construit l'URL vers la page profil consultant
