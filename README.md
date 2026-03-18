# ExpertERPHub

Marketplace B2B pour mettre en relation des experts ERP avec des entreprises.

## Présentation

ExpertERPHub est une plateforme permettant aux entreprises de trouver et contacter des consultants experts ERP (SAP, Oracle, Microsoft Dynamics, Workday, etc.), et aux consultants de présenter leur profil et leurs compétences.

## Fonctionnalités

- **Page d'accueil** : recherche de consultants par ERP, disponibilité, ville, mode de travail
- **Profil consultant** : fiche détaillée avec compétences, expériences et formulaire de contact
- **Tableau de bord consultant** : gestion du profil, des disponibilités et des notifications
- **Tableau de bord entreprise** : gestion des ressources et des demandes de contact
- **Tableau de bord admin** : validation des profils consultants, gestion de la plateforme
- **Inscription consultant** : formulaire d'inscription multi-étapes
- **Réinitialisation de mot de passe** : via lien email Supabase
- **Mode sombre** : thème clair/sombre
- **Internationalisation** : support français/anglais (i18n.js)

## ERP supportés

- SAP S/4HANA
- Oracle
- Microsoft Dynamics 365
- Workday
- Salesforce
- NetSuite
- SuccessFactors
- ServiceNow
- Infor

## Stack technique

- **Frontend** : HTML, CSS, JavaScript vanilla (sans framework)
- **Backend / BDD** : [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS)
- **Déploiement** : [Netlify](https://www.netlify.com/)

## Structure du projet

```
ExpertERPHUB/
├── index.html                  # Page d'accueil / marketplace
├── consultant.html             # Fiche profil consultant (publique)
├── dashboard-consultant.html   # Tableau de bord consultant
├── dashboard-entreprise.html   # Tableau de bord entreprise
├── dashboard-admin.html        # Tableau de bord administrateur
├── inscription-consultant.html # Formulaire d'inscription consultant
├── reset-password.html         # Réinitialisation de mot de passe
├── portal-auth.js              # Utilitaire d'authentification (session)
├── notifications.js            # Gestion des notifications (localStorage)
├── i18n.js                     # Traductions FR/EN
├── supabase-rls-policies.sql   # Politiques RLS Supabase
├── _headers                    # En-têtes HTTP Netlify (CSP, sécurité)
├── _redirects                  # Redirections Netlify
├── netlify.toml                # Configuration Netlify
└── assets/
    └── erp-logos/              # Logos SVG des ERP
```

## Déploiement

Le projet est déployé sur Netlify. La configuration se trouve dans `netlify.toml` et `_redirects`.

### Variables d'environnement Supabase

Les clés Supabase sont intégrées directement dans les fichiers HTML. Pour un environnement de production, pensez à sécuriser vos clés via des variables d'environnement Netlify.

### Politiques RLS Supabase

Le fichier `supabase-rls-policies.sql` contient :
- **Section A** : politiques permissives pour déblocage rapide
- **Section B** : politiques plus strictes à activer en production

## Sécurité

- Content Security Policy (CSP) configurée dans `_headers`
- Protection clickjacking (`X-Frame-Options: DENY`)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Permissions Policy restrictive (pas de caméra, micro, géolocalisation)

## Développement local

Aucun outil de build requis. Ouvrez simplement `index.html` dans un navigateur depuis le dossier `ExpertERPHUB/`, ou lancez un serveur local :

```bash
cd ExpertERPHUB
npx serve .
# ou
python3 -m http.server 8080
```
