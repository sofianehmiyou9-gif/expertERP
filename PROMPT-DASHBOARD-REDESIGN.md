# Prompt — Redesign Premium des Dashboards ExpertERPHub

## Contexte
ExpertERPHub est une plateforme B2B de staffing ERP. Elle connecte des entreprises partenaires (ESN/firmes de conseil) qui placent leurs consultants ERP disponibles, avec d'autres entreprises qui cherchent ces experts. Le site a aussi des consultants freelances visibles publiquement.

**Stack technique** : HTML/CSS/JS vanilla, Tailwind CSS 3.4, Supabase (PostgreSQL + API REST), Vercel hosting. Pas de React/Vue — tout est en vanilla JS avec des `<script>` inline.

**Design system actuel** : Inspiré de Linear.app — Inter font, couleur primaire `#5e6ad2`, design monochrome avec accents indigo. Variables CSS : `--ink`, `--bg`, `--surface`, `--surface-low`, `--surface-high`, `--primary`, `--border`, `--text-secondary`, `--text-muted`. Dark mode complet via `[data-theme="dark"]`.

---

## Ce que je veux

Redesigne mes 3 dashboards (Consultant, Entreprise, Admin) avec un look **premium, moderne et professionnel** — au niveau de Linear, Vercel Dashboard, Raycast, ou Stripe Dashboard. Le design doit être :

- **Monochrome avec accents** : palette neutre (gris/noir/blanc) + accents indigo `#5e6ad2` pour les éléments interactifs
- **Dense mais lisible** : maximiser l'information visible sans scroll inutile, layout en grille/colonnes
- **Glass morphism subtil** : backdrop-filter blur sur les panels, pas de glass excessif
- **Micro-interactions** : hover states, transitions fluides, skeleton loaders
- **Dark mode first** : le dashboard doit être magnifique en dark mode (fond `#08080a` / surfaces `#0f0f11`)
- **Responsive** : desktop-first mais utilisable sur tablette

---

## DASHBOARD CONSULTANT — `dashboard-consultant.html`

### Layout global
Sidebar fine à gauche (60px icônes only, expand 220px on hover) + zone principale à droite.

### Onglet "Dashboard" (vue par défaut)
**Header** : Nom du consultant + avatar circulaire + badge statut (Disponible/En mission) + bouton "Voir ma carte publique"

**KPI Strip** (4 cards en ligne horizontale) :
- Messages reçus (nombre + trend ↑↓ vs mois dernier)
- Taux de réponse (% + jauge circulaire)
- Vues du profil (nombre + sparkline 30j)
- Score de complétion profil (% + progress ring)

**Section Conversations** (prend ~60% de la largeur) :
- Liste des conversations à gauche (avatar entreprise + nom + dernier message tronqué + timestamp + badge unread)
- Panel de chat à droite (bulles de messages, input en bas, boutons email/appel)
- Onglets en haut : "Toutes" | "Demandes reçues" | "Archivées"

**Section Activité récente** (sidebar droite ~40%) :
- Timeline verticale des événements (nouveau message, profil consulté par X, certification ajoutée)
- Chaque event : icône + texte + timestamp relatif ("il y a 2h")

### Onglet "Mon Profil"
**Layout en 2 colonnes** :

**Colonne gauche (preview live)** :
- Preview de la carte consultant telle qu'elle apparaît dans l'annuaire (la même card 3D qu'on a sur la page publique)
- Se met à jour en temps réel quand on édite à droite

**Colonne droite (formulaire d'édition)** :
- Sections collapsibles avec headers cliquables :
  1. **Informations personnelles** : avatar upload (drag-drop circle), nom, email, téléphone, LinkedIn, localisation
  2. **Expertise ERP** : dropdown ERP principal + multi-select modules + tags certifications (add/remove)
  3. **Résumé professionnel** : textarea + bouton "✨ Générer avec IA"
  4. **Expériences** : liste d'expériences (titre, entreprise, secteur, durée, description, modules). Boutons add/edit/delete. Bouton "✨ Générer avec IA"
  5. **Tarification & Disponibilité** : TJM (range slider ou inputs min/max), mode de travail (Remote/Hybride/Sur site), disponibilité (toggle + date)
  6. **Langues** : multi-select avec niveaux
  7. **Paramètres** : changement mot de passe, export RGPD (télécharger mes données JSON), supprimer mon compte (danger zone)

---

## DASHBOARD ENTREPRISE — `dashboard-entreprise.html`

### Layout global
Sidebar à gauche avec icônes + labels (8 items). Zone principale à droite. Header fixe avec logo + nom entreprise + notifications bell + avatar.

### Tab "Mes Ressources" (vue par défaut)
**KPI Strip** (4 cards) :
- Total ressources postées
- Ressources disponibles (vs en mission)
- Messages envoyés ce mois
- Taux de réponse reçu

**Toolbar** : Toggle vue (grille ⊞ / tableau ☰) + bouton "Exporter CSV" + bouton "+ Ajouter ressource" (primary CTA)

**Vue Grille** : Cards de chaque ressource postée (code anonymisé, ERP, modules, ville, TJM, statut dispo, actions edit/archive)

**Vue Tableau** : Table avec colonnes sortables (Code, ERP, Modules, Ville, TJM, Statut, Actions)

### Tab "+ Ajouter"
**Deux options** :
1. **Formulaire rapide** : Card centrée avec champs essentiels (ERP, ville, TJM, description courte) → bouton "Ajouter"
2. **Import en lot** : Zone drag-drop pour fichier Excel (.xlsx) → preview tableau → bouton "Importer X ressources" + lien "Télécharger le modèle Excel"

### Tab "Rechercher"
**Barre de recherche prominente** en haut + filtres inline (ERP, modules, localisation, langues, TJM range, disponibilité)

**Résultats** : Cards consultants (même style que l'annuaire public mais avec actions supplémentaires : ⭐ Favoris, 💬 Contacter, 👁 Voir profil)

**Pagination** en bas

### Tab "Messages"
Même layout que le chat consultant mais côté entreprise. Liste conversations + panel chat.

### Tab "Favoris"
Grille de cards des consultants sauvegardés. Bouton retirer des favoris. Bouton contacter.

### Tab "Historique"
Timeline des consultants consultés avec date/heure. Bouton "Recontacter" / "Voir profil".

### Tab "Équipe"
Table des membres de l'équipe (nom, email, rôle, statut actif/inactif). Boutons : inviter membre, activer/désactiver, retirer.

### Tab "Mon Profil"
Formulaire : logo upload, nom entreprise, secteur, description, site web, téléphone, localisation. Section abonnement (plan actuel + upgrade). RGPD : export/suppression.

---

## DASHBOARD ADMIN — `dashboard-admin.html`

### Layout global
Sidebar dark navy (#0a0e1a) avec menu vertical. Zone principale avec fond sombre.

### Vue "Overview"
**KPI Cards** (4 en ligne) :
- Total consultants (nombre + badge pending)
- Total entreprises
- Inscriptions ce mois (trend)
- Messages échangés

**Graphiques** (2 colonnes) :
- Inscriptions par mois (bar chart 6 derniers mois)
- Répartition par ERP (donut chart : SAP, Oracle, Dynamics, Workday, NetSuite, Autre)

**Tableaux résumés** (2 colonnes) :
- "Dernières inscriptions" : 5 derniers consultants (nom, ERP, date, statut)
- "Entreprises actives" : 5 dernières (nom, nb ressources, statut)

### Vue "Consultants"
**Toolbar** : Barre de recherche + filtres (statut : Tous/En attente/Approuvé/Refusé, ERP)

**Table** :
| Nom | Email | ERP | Statut | Date | Actions |
Statut = badges couleur (vert approuvé, orange en attente, rouge refusé)
Actions = boutons Approuver ✓ / Refuser ✕ / Détail 👁

**Panel de détail** (slide-in depuis la droite) : profil complet du consultant, historique des actions admin, champ "motif de refus" si rejeté.

### Vue "Entreprises"
**Table** :
| Nom | Email | Nb Consultants | Statut | Actions |
Actions = Voir consultants de cette entreprise (ouvre panel), éditer statut

**Panel "Consultants de [Entreprise]"** : liste des ressources postées par cette entreprise avec détails.

---

## Éléments UI communs aux 3 dashboards

### Composants réutilisables
- **Stat Card** : icône + nombre + label + trend indicator (↑ vert / ↓ rouge + %)
- **Badge** : pill arrondi, 4 variantes (success/warning/error/info)
- **Table** : headers sticky, rows hover highlight, pagination, tri par colonne
- **Chat bubble** : côté gauche (reçu, surface-low) / côté droit (envoyé, primary)
- **Sidebar** : collapsed 60px → expanded 220px, icônes Material Symbols, active state = fond primary-light + texte primary
- **Empty state** : illustration + texte + CTA quand une section est vide
- **Skeleton loader** : animation shimmer pendant le chargement des données
- **Toast notifications** : slide-in depuis le coin supérieur droit, auto-dismiss 5s
- **Confirmation modal** : pour les actions destructives (supprimer, archiver)

### Typographie
- Titres : Inter 600-700, letter-spacing -0.02em
- Body : Inter 400-500, 14px
- Labels : Inter 500, 12px, text-muted
- Nombres/KPIs : Inter 700, taille variable, tabular-nums

### Couleurs (tokens CSS existants à réutiliser)
- `--ink` / `--bg` / `--surface` / `--surface-low` / `--surface-high`
- `--primary` (#5e6ad2) / `--primary-hover` / `--primary-light`
- `--border` / `--outline`
- `--green` / `--red` / `--orange` (pour statuts)
- `--text-secondary` / `--text-muted`

### Animations
- Transitions : `cubic-bezier(.16,1,.3,1)` partout
- Hover cards : `translateY(-2px)` + shadow amplifiée
- Page transitions : fade-up 400ms
- Skeleton shimmer : gradient animé
- Sidebar : width transition 200ms

---

## Contraintes techniques
- HTML/CSS/JS vanilla uniquement (pas de React, Vue, etc.)
- Tailwind CSS 3.4 disponible via CDN
- Supabase pour les données (API REST avec clé anon)
- Les fonctions JS existantes (sbFetch, sbInsert, sbUpdate, etc.) doivent être conservées
- Le mot de passe admin hash SHA-256 `dc7e5959782f36f7f99fa7f893d693262581aeb21b87a822a23c66b98e63fc0d` ne doit JAMAIS être modifié
- Dark mode obligatoire via `[data-theme="dark"]`
- i18n FR/EN via data-i18n attributes
