# Prompt de maintenance — ExpertERP

> Copie-colle ce prompt au début d'une nouvelle conversation pour corriger des bugs, refactorer ou ajouter des fonctionnalités au site ExpertERP.

---

## PROMPT UNIVERSEL

```
Tu travailles sur le projet ExpertERP — une plateforme SaaS de mise en relation entre consultants ERP et entreprises.

## Stack technique

- **Fichiers principaux** : `index.html`, `consultant.html`, `dashboard-consultant.html`, `dashboard-entreprise.html`
- **Design system** : Tailwind CSS (CDN) + config couleurs Stitch (`primary:#00288e`, `secondary:#0058be`, `background:#f7f9fb`)
- **Typographies** : Newsreader (titres serif), Manrope (corps)
- **Icônes** : Material Symbols Outlined
- **Backend** : Supabase REST API (fetch natif, pas de SDK)
  - URL : `https://aqvkcbeezzbmoiykzfyo.supabase.co`
  - Key : `sb_publishable_3ZOOWdx35IRT6UocT_s9PQ_hI0Yrbim`
- **Auth** : SHA-256 password hashing (`sha256Hex()`), rôles : consultant / entreprise / admin
- **Pages** : routing via `.page` / `.page.active` CSS + `showPage(id)`
- **i18n** : objet `translations` (fr/en), `t(key)`, `data-i18n`

## Architecture index.html

1. HEAD : Tailwind CDN + Tailwind config + Google Fonts + style block (CSS vars + animations + consultant-card CSS + modal CSS)
2. Script i18n (translations fr/en + setLanguage + toggleTheme)
3. NAV fixe (glassmorphisme, position:fixed, z-index:200, hauteur ~74px)
4. `#page-home` : hero Stitch + KPI strip + trust rail + sections
5. `#page-consultants` : sidebar filtres (w-80 sticky) + grid `id="consultants-grid"`
6. `#page-entreprises` : ent-hero + ent-sections + vs-table
7. `#page-comment` : how-it-works avec tabs
8. Modals : `#overlay-consultant` (4 étapes + gate invitation), `#overlay-entreprise` (3 étapes), `#overlay-portal`
9. Script principal JS (~2200 lignes) : sbInsert/sbSelect/sbUpdate, renderConsultants, loadConsultants, filterConsultants, submitConsultant, submitEntreprise, portal auth, etc.
10. `#error-overlay` + ERROR_MESSAGES + showError/closeError

## Règles critiques à respecter

- **Ne jamais casser** : `renderConsultants()`, `loadConsultants()`, `showPage()`, `bindStaticActionHandlers()`, `handleStaticAction()`, le système i18n, les IDs des filtres (`f-search`, `f-erp`, `f-role`, `f-mode`), les IDs des modals, la connexion Supabase
- **CSS consultant-cards** : toujours préserver `.consultant-card`, `.consultant-card-avatar`, `.consultant-card-btn.primary` etc. — renderConsultants() génère du HTML dynamique qui dépend de ces classes
- **Nav** : position:fixed — les pages entreprises et comment ont un padding-top compensatoire (`calc(Xrem + 78px)`)
- **Grid consultants** : `grid-template-columns:repeat(auto-fill,minmax(300px,1fr))` dans le layout sidebar
- **Modals** : `max-width:min(600px,calc(100vw - 2rem))` pour la compatibilité mobile

## Fonctionnalités récemment ajoutées

- **Photo de profil** : le formulaire consultant (cs-step-1) a un champ photo avec 2 onglets (upload Base64 ou URL). Fonctions JS : `switchPhotoTab()`, `handlePhotoFile()`, `previewPhotoUrl()`, `getConsultantPhotoValue()`, `resetPhotoField()`. La valeur est stockée dans `notes_admin.photo_url`. `renderConsultants()` affiche la photo si disponible, sinon les initiales colorées.

---

## Tâche demandée

[DÉCRIS ICI CE QUE TU VEUX FAIRE]

Exemples :
- "Corrige le bug [description du bug]"
- "Ajoute la fonctionnalité [description]"
- "Refactorise [section] pour [raison]"
- "Le composant [X] s'affiche mal sur mobile, voici la description du problème : [...]"
```

---

## Checklist de validation après chaque modification

Après toute modification, vérifie ces points :

| Test | Attendu |
|------|---------|
| `<style>` unique | `content.count('<style>') == 1` |
| Nav fixe | `nav{position:fixed;` présent |
| renderConsultants intact | `function renderConsultants` présent |
| Supabase URL | `aqvkcbeezzbmoiykzfyo` présent |
| 4 pages | `class="page"` compte >= 4 |
| 3 modals | `id="overlay-"` compte == 3 |
| IDs filtres | `f-search`, `f-erp`, `f-role`, `f-mode` présents |
| i18n | `const translations` présent |

---

## Problèmes connus & solutions appliquées

| Problème | Solution |
|----------|----------|
| `<style>` imbriqué (bug build) | Un seul bloc `<style>`, sans balise `<style>` interne |
| Nav fixe couvre le contenu | `.ent-hero{padding-top:calc(4rem + 78px)}` et `.page-header{padding-top:calc(3.5rem + 78px)}` |
| Cards consultants déformées dans layout sidebar | `grid-template-columns:repeat(auto-fill,minmax(300px,1fr))` |
| Modals hors écran sur mobile | `max-width:min(600px,calc(100vw - 2rem))` + `overflow-y:auto` sur `.overlay` |
| Photo non affichée dans les cards | `renderConsultants` vérifie `notes.photo_url` et affiche `<img>` si présent |
