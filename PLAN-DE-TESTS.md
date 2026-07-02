# Plan de Tests Fonctionnels — ExpertERPHub

> Version : 1.1 — 1er juillet 2026
> **Méthode : 100% via l'interface du site web (navigateur), comme un vrai client.**
> Aucun test sur le code ou la base directement — on clique, on tape, on observe, exactement comme un utilisateur réel.
> Environnement : staging (branche `dev`, preview Vercel) — jamais en prod
> Comptes de test : voir `ExpertERPHub_ComptesTest.xlsx`
> Légende : [ ] à tester · [x] PASS · [!] FAIL (créer un correctif)

---

## 1. Site public — index.html (SPA)

### 1.1 Navigation
- [ ] Navigation entre pages (Accueil, Consultants, Entreprises) sans rechargement
- [ ] Logo ramène à l'accueil
- [ ] Tous les CTA du hero pointent vers la bonne page
- [ ] Retour arrière navigateur / rafraîchissement de page ne casse pas l'état
- [ ] Liens footer (mentions, privacy, conditions) fonctionnent
- [ ] Aucune erreur console au chargement

### 1.2 Page Consultants — recherche et filtres
- [ ] Liste s'affiche avec pagination (8/page), compteur correct
- [ ] Filtre ERP (chaque valeur : SAP, Oracle, Dynamics, Workday…)
- [ ] Filtre Rôle, Mode travail, Ville, Disponibilité, Tarif max
- [ ] Combinaison de plusieurs filtres (ET logique)
- [ ] Recherche mot-clé : accents/diacritiques ignorés (normalizeToken), casse ignorée
- [ ] Filtre sans résultat → état vide propre (pas de page blanche)
- [ ] Réinitialisation des filtres
- [ ] Pagination : première/dernière page, changement de filtre remet à la page 1

### 1.3 Visibilité B2B (règle critique)
- [ ] Non connecté : les ressources `import_b2b` sont INVISIBLES (compter les cartes)
- [ ] Connecté visiteur pro : ressources B2B invisibles, freelances visibles
- [ ] Connecté entreprise : ressources B2B visibles avec badge « Ressource partenaire »
- [ ] Accès direct URL `consultant.html?id=<id_b2b>` sans session entreprise → bloqué ou anonymisé
- [ ] Ressource B2B avec `visibility: public` : reste cachée aux non-entreprises

### 1.4 Profil consultant (consultant.html)
- [ ] Toutes les sections s'affichent : avatar, badges, compétences, stats, résumé, certifications, expériences
- [ ] Profil avec champs manquants (pas de certif, pas de résumé) → pas de « undefined » affiché
- [ ] ID inexistant dans l'URL → message d'erreur propre
- [ ] Bouton Contacter : non connecté → gate overlay ; entreprise sans plan → gate ; entreprise avec plan → formulaire
- [ ] TJM affiché correctement (min-max, devise)

### 1.5 Page Entreprises — gate 2 chemins
- [ ] Option A « Entreprise partenaire » → modal inscription (modes 'chercher' et 'placer')
- [ ] Option B « Visiteur professionnel » → accès freelances sans inscription, session visiteur_pro créée
- [ ] Badge « Recommandé » visible sur l'option A

### 1.6 i18n FR/EN
- [ ] Toggle FR→EN traduit toute la page (vérifier chaque section)
- [ ] EN→FR retour complet, pas de textes mixtes
- [ ] Badges/compteurs messagerie survivent au changement de langue (bug corrigé — non-régression)
- [ ] Langue persiste entre navigation de pages

### 1.7 Divers public
- [ ] Bannière cookies : accepter/refuser, ne réapparaît pas après choix
- [ ] Dark mode : toggle, persistance, aucun texte illisible
- [ ] Favicon, titre d'onglet, sitemap.xml, robots.txt accessibles

---

## 2. Inscription & Authentification

### 2.1 Inscription consultant (inscription-consultant.html) — NOUVEAU flux Supabase Auth
- [ ] Parcours nominal complet : infos + mot de passe → compte créé (vérifier Supabase Auth ET table consultants, statut `en_attente`)
- [ ] Mot de passe : trop court, sans chiffre/majuscule (selon règles) → rejeté avec message clair
- [ ] Confirmation de mot de passe différente → erreur
- [ ] Email déjà utilisé → message d'erreur (pas de doublon en base)
- [ ] Email invalide (sans @, espaces) → rejeté
- [ ] Champs obligatoires vides → soumission bloquée, champs signalés
- [ ] Code d'invitation : valide → consommé (used_by_email, used_at renseignés)
- [ ] Code invalide / expiré / déjà utilisé / désactivé → rejeté avec message distinct
- [ ] Caractères spéciaux dans nom/prénom (O'Brien, é, 中文) → enregistrés sans casse
- [ ] Injection XSS dans les champs texte (`<script>`, `<img onerror>`) → neutralisée à l'affichage
- [ ] Double-clic sur Soumettre → une seule insertion

### 2.2 Inscription entreprise
- [ ] Modal mode 'chercher' et mode 'placer' : contenus différents corrects
- [ ] Soumission → statut `en_attente`, invisible tant que non approuvée
- [ ] Vérifier le comportement INSERT via API anon (RLS connu comme bloquant — documenter le résultat réel)
- [ ] Email entreprise déjà existant → refusé

### 2.3 Connexion / Session
- [ ] Login consultant, entreprise, admin : chacun redirige vers SON dashboard
- [ ] Mauvais mot de passe → erreur générique (ne révèle pas si l'email existe)
- [ ] Compte `en_attente` ou `refuse` → connexion bloquée avec message
- [ ] Session expire après 8h (modifier expiresAt en localStorage pour simuler)
- [ ] Déconnexion : session effacée, retour accueil, back navigateur ne ré-ouvre pas le dashboard
- [ ] Accès direct URL dashboard sans session → redirection login (tester les 3 dashboards)
- [ ] Accès dashboard-admin avec session consultant/entreprise → refusé
- [ ] Session falsifiée (modifier role en 'admin' dans localStorage) → rejetée par la signature SHA-256
- [ ] Reset password (reset-password.html) : email envoyé, lien fonctionne, nouveau mdp accepté
- [ ] Recovery (recovery.html) : parcours complet
- [ ] Connexion simultanée 2 onglets / 2 rôles différents

---

## 3. Dashboard Entreprise

### 3.1 Mes Ressources
- [ ] Liste des ressources avec stats strip (total, publiées, taux moyen)
- [ ] Toggle vue cartes / vue tableau, colonnes masquées correctes, pas d'overflow horizontal
- [ ] Filtres statut et visibilité
- [ ] Badges visibilité : B2B UNIQUEMENT (bleu) / TOUT PUBLIC (vert)
- [ ] Modifier une ressource → changements persistés et visibles côté public selon visibilité
- [ ] Supprimer/désactiver une ressource → disparaît de la recherche publique
- [ ] Voir fiche → ouvre consultant.html avec le bon profil
- [ ] Export CSV : télécharger et OUVRIR le fichier (encodage accents, toutes colonnes)
- [ ] Entreprise sans aucune ressource → état vide correct

### 3.2 Ajouter — import Excel (scénarios critiques)
- [ ] Télécharger le modèle Excel → fichier valide qui s'ouvre
- [ ] Import du modèle rempli (5 lignes) → 5 ressources créées avec tous les champs mappés (parseXlsxRows)
- [ ] Import drag & drop ET via bouton parcourir
- [ ] Fichier avec colonnes manquantes / en désordre → erreur claire ou mapping correct
- [ ] Lignes partiellement vides → ignorées ou signalées (pas de ressource fantôme)
- [ ] Fichier .csv legacy → toujours supporté
- [ ] Fichier non-Excel (.pdf, .txt renommé .xlsx) → rejeté proprement
- [ ] Gros fichier (500+ lignes) → performance, pas de gel navigateur
- [ ] Valeurs malveillantes dans les cellules (formules `=cmd`, HTML) → neutralisées
- [ ] Doublons (même email 2x dans le fichier, ou déjà en base) → comportement défini
- [ ] Ajout manuel via formulaire : tous champs, validation, ressource créée en `import_b2b` avec entreprise_nom/email corrects

### 3.3 Rechercher
- [ ] Résultats incluent freelances + ressources B2B des AUTRES entreprises
- [ ] Ses propres ressources : exclues ou marquées (définir le comportement attendu)
- [ ] Filtres (mot-clé, ERP, rôle, dispo, tarif max, ville) fonctionnels
- [ ] Boutons Contacter / Profil sur chaque carte

### 3.4 Messages / Favoris / Historique / Équipe / Mon Profil
- [ ] Messages : voir section 5 (Messagerie)
- [ ] Favoris : ajouter depuis Rechercher, retirer, persistance après reconnexion
- [ ] Historique des contacts : entrées créées après un contact
- [ ] Équipe : inviter un membre (email + rôle), table des membres à jour ; email invalide rejeté
- [ ] Mon Profil : modifier chaque champ + logo → sauvegardé ; barre de complétion évolue
- [ ] Infos plan affichées (plan, slots) cohérentes avec la base

---

## 4. Dashboard Consultant

- [ ] KPIs affichés cohérents avec les données réelles
- [ ] Modifier profil : titre, résumé, TJM min/max, langues (multi-select), mode travail, dispo, compétences, certifications, expériences → persistance et reflet sur la carte publique
- [ ] TJM min > max → validation
- [ ] Statut Disponible / En mission : badge mis à jour côté public
- [ ] Statut « inactif » via notes_admin → profil retiré du public (non-régression fix f0e6238)
- [ ] Messagerie unifiée : conversations, réponses, badges (voir section 5)
- [ ] Voir ma carte publique → ouvre le bon profil
- [ ] Consultant `en_attente` : que voit-il ? (comportement défini)

---

## 5. Messagerie (fonctionnalité PAYANTE — cœur du business)

### 5.1 Gates d'accès
- [ ] Visiteur non connecté clique Contacter → overlay gate (showContactGateOverlay)
- [ ] Entreprise SANS plan actif → gate / invitation à payer
- [ ] Entreprise avec plan actif (is_subscription_active) → messagerie ouverte
- [ ] Manipulation localStorage pour simuler un plan → l'accès réel doit dépendre de la base, pas du client

### 5.2 Échanges
- [ ] Entreprise → freelance : message reçu dans le dashboard consultant
- [ ] Entreprise → ressource B2B : routage vers l'ENTREPRISE propriétaire (pas la ressource) — non-régression b702d0f
- [ ] Réponse consultant → reçue côté entreprise
- [ ] Fil de conversation : ordre chronologique, horodatage, tags B2B/freelance
- [ ] Badges non-lus : apparaissent à la réception, disparaissent après lecture (markThreadRead RPC), compteur dashboard principal à jour
- [ ] Badges survivent au changement de langue FR/EN (non-régression i18n)
- [ ] Polling : nouveau message apparaît sans rafraîchir (2 navigateurs côte à côte)
- [ ] Accusés de lecture
- [ ] Message vide ou espaces seuls → envoi bloqué
- [ ] Message très long (5000+ car.) → limite ou affichage correct
- [ ] XSS dans le corps du message et le nom d'expéditeur → échappé (non-régression C1)
- [ ] Conversation avec soi-même / avec un profil supprimé → géré

---

## 6. Dashboard Admin

- [ ] Login admin uniquement via email dont le hash ∈ ADMIN_EMAIL_HASHES
- [ ] File d'attente : approuver un consultant → visible publiquement ; refuser → jamais visible
- [ ] Approuver/refuser une entreprise → accès dashboard conditionné
- [ ] Changer statut en_mission / inactif → reflet immédiat côté public
- [ ] Codes d'invitation : créer (avec label, expiration), désactiver, lister utilisés/libres
- [ ] Édition d'un profil consultant par l'admin (notes_admin JSON valide après édition)
- [ ] Stats du dashboard cohérentes avec la base
- [ ] Actions sur les entreprises : rappel — INSERT/DELETE passent par SQL Editor (vérifier que l'UI ne promet pas l'inverse)

---

## 7. Emails & Notifications

- [ ] api/send-email : email reçu lors d'un contact / inscription (vérifier spam)
- [ ] Contenu email : pas de HTML cassé, liens corrects vers le site
- [ ] Rate limiting / anti-abus sur l'endpoint (appels répétés → bloqués) — non-régression C3
- [ ] Notifications in-app : création, marquage lu, markAllRead (race condition connue — vérifier)
- [ ] Email avec caractères spéciaux dans le nom → en-têtes non cassés (injection en-tête)

---

## 8. Sécurité — testable via l'UI comme un client malveillant

- [ ] XSS stocké : s'inscrire avec le nom `<img src=x onerror=alert(1)>` via le formulaire → aucune alerte nulle part (liste, profil, messagerie, admin, export CSV)
- [ ] XSS dans un message envoyé via la messagerie → affiché comme texte, pas exécuté
- [ ] Accès direct URL des dashboards sans être connecté → redirigé
- [ ] Un consultant connecté tape l'URL du dashboard admin/entreprise → refusé
- [ ] Formulaires : soumissions répétées rapides (spam clic) → pas de doublons ni d'emails en rafale
- [ ] Import Excel avec contenu piégé (formules, HTML dans les cellules) → neutralisé

*(Les vérifications API/RLS profondes — UPDATE d'autrui via clé anon, fuite notes_admin — feront l'objet d'un audit technique séparé, hors parcours client.)*

---

## 9. Transverse

### 9.1 Responsive
- [ ] Mobile 375px : accueil, consultants, profil, dashboards (bottom nav), messagerie utilisable
- [ ] Tablette 768px et desktop 1440px : pas d'overflow, grilles adaptées
- [ ] Sidebar dashboards : collapse/expand, état actif

### 9.2 Navigateurs
- [ ] Chrome, Firefox, Safari, Edge : parcours critique complet (inscription → login → recherche → contact)

### 9.3 Robustesse
- [ ] Supabase indisponible (couper le réseau) → messages d'erreur, pas de page figée
- [ ] Lenteur réseau (throttling 3G) → skeleton/spinners, pas de double-soumission
- [ ] Données corrompues : notes_admin JSON invalide sur un profil → parseNotes ne crash pas la page

### 9.4 Environnements
- [ ] Preview Vercel (dev) : bandeau jaune STAGING visible, ENV='staging'
- [ ] Prod : PAS de bandeau, ENV='production'
- [ ] localhost : ENV='local'

---

## 10. Parcours E2E prioritaires (à exécuter en premier)

1. **Freelance** : inscription (avec code invit.) → approbation admin → visible public → contacté par entreprise → répond
2. **Entreprise qui place** : inscription → approbation → import Excel 5 ressources → visibles pour une AUTRE entreprise seulement
3. **Entreprise qui cherche** : inscription → recherche → favori → contact ressource B2B → routage vers l'entreprise propriétaire
4. **Visiteur pro** : gate option B → voit uniquement les freelances → clic Contacter → gate messagerie
5. **Admin** : login → approuve/refuse → gère codes invitation → modifie un statut

---

## Suivi des anomalies

| # | Scénario | Sévérité (bloquant/majeur/mineur) | Description | Statut |
|---|----------|-----------------------------------|-------------|--------|
| 1 | | | | |
