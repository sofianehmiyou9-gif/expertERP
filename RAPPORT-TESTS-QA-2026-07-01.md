# Rapport de tests QA + Plan de correction — ExpertERPHub

> Réalisé le 1er juillet 2026 · Tests via l'UI du site (navigateur), comme un vrai client
> Environnement : preview Vercel `dev` → https://project-ggx81-byhntpos9-sofianehmiyou9-gifs-projects.vercel.app/ (bandeau STAGING confirmé)
> Comptes/données de test créés : code invitation `QATEST2027` (exp. 2027-01-31) · mot de passe comptes `Test1234!`
> Compte consultant de test : `qa.consultant1@test-experterp.com` / `Test1234!` (statut « en attente »)

---

## 1. Synthèse pour la décision « go / no-go » production

**3 points à trancher/corriger AVANT de passer en prod et de présenter :**

1. **BLOQUANT business — Inscription consultant « gratuite » qui force un abonnement payant** (voir #6)
2. **BLOQUANT onboarding — Code d'invitation consommé avant la fin de l'inscription** (voir #5)
3. **À confirmer — Inscription entreprise possiblement cassée** (INSERT bloqué par RLS, voir #7)

Le reste (affichage placeholders, expérience « — », cohérences) est corrigeable rapidement et améliore nettement le rendu.

---

## 2. Anomalies détectées (par sévérité)

### 🔴 Bloquants

**#6 — Inscription consultant : paywall obligatoire malgré le badge « INSCRIPTION GRATUITE »**
L'étape 4 du formulaire (« ABONNEMENT PLATEFORME * », requis) impose de choisir un plan payant (99$/mois mensuel → 69$/mois annuel) pour soumettre la candidature. Sans plan sélectionné, le bouton « Envoyer ma candidature » ne fait rien. Le badge « INSCRIPTION GRATUITE » en haut du même modal est donc contradictoire.
→ **Décision business requise** : soit retirer le paywall (revenir au modèle « consultant gratuit »), soit assumer le modèle payant et corriger le wording « gratuit ». *Non corrigé de moi-même : c'est ton choix de modèle.*

**#5 — Le code d'invitation est consommé dès la validation du gate**
Le code est marqué utilisé (`used_by_email` + `used_at`) dès la saisie email+code, AVANT la fin des 4 étapes. Vérifié en base : après un essai non terminé, le même code était refusé (« Code invalide, expiré ou déjà utilisé »).
→ **Impact** : un consultant qui valide puis abandonne le formulaire ne peut plus jamais s'inscrire (code brûlé).
→ **Fix recommandé** : ne consommer le code (appel `consume_invitation_code`) qu'à la soumission finale réussie de l'étape 4, pas au gate.

### 🟠 Majeurs

**#7 — Inscription entreprise possiblement non fonctionnelle (RLS)**
Le code (`index.html` ~L5806) crée l'entreprise via `sbInsert('entreprises', …)` avec la clé anon. Or `CLAUDE.md` documente que l'INSERT entreprise via l'API anon est bloqué par RLS (erreur 42501). Test live : après remplissage de l'étape 1, la page a gelé et aucune entreprise `qa.entreprise1@test-experterp.com` n'a été créée en base.
→ **À confirmer** : tester la soumission complète ; si l'INSERT échoue, l'inscription entreprise doit passer par une Edge Function (service_role) ou une politique RLS INSERT correcte. C'est critique car l'entreprise est le côté payant du modèle.

**#2 — Champ « Expérience » affiche « — » sur les fiches consultant**
Sur plusieurs profils (Bilal S., Sofiane S.), la stat EXPÉRIENCE affiche « — » alors que le résumé liste des missions datées. Le nombre d'années n'est pas calculé/affiché.
→ **Fix** : remplir/afficher `experience_annees` (ou `notes_admin.annees_exp`) et fournir un fallback propre si vide (ex. masquer la tuile plutôt qu'afficher « — »).

**#1 (cause racine) — Texte placeholder visible sur les profils**
Confirmé dans `index.html` L4863-4890 : le résumé est auto-pré-rempli à l'étape 3 avec un template contenant des crochets non remplis : « avec **[X]** années d'expérience dans le secteur **[industrie / domaine]** », « **[logistique / finance / …]** », « **[Module 1]** », « **[date / délai]** ». S'il n'est pas édité, ce texte est sauvegardé et affiché tel quel (ex. carte « Bilal S. »).
→ **Fix** : réécrire le template avec une prose propre sans crochets (voir §3), + nettoyer les profils de démo existants qui contiennent déjà ces placeholders.

### 🟡 Mineurs / cohérence / sécurité

**#3 — Politique de mot de passe incohérente entre les formulaires**
Inscription consultant : exige 8 car. + 1 majuscule + 1 caractère spécial. Inscription entreprise : exige seulement « 8 caractères minimum ». → Uniformiser la règle sur les deux parcours.

**#4 — Formulaire d'inscription dupliqué (caché) dans le DOM**
La page contient plusieurs copies cachées du formulaire (7 champs mot de passe détectés dans le DOM). Invisible pour l'utilisateur mais alourdit la page et fiabilise mal les interactions. → Nettoyer les instances dupliquées.

**#8 — Disponibilité choisie à l'inscription non persistée**
À l'étape 4, j'ai choisi disponibilité « Immédiate » ; le dashboard consultant affiche ensuite « Disponibilité : Non définie ». La valeur n'a pas été sauvegardée. → Vérifier le mapping du champ disponibilité à la soumission.

**#9 — Email en clair dans l'URL du dashboard**
Après connexion : `dashboard-consultant.html?email=qa.consultant1%40test-experterp.com`. L'email (donnée perso) transite dans l'URL (historique, logs). → Utiliser la session (localStorage) au lieu du query string.

**#7bis — Validation d'étape possiblement laxiste (à confirmer)**
Lors d'un essai, le formulaire consultant a semblé avancer d'étape sans que « Ville / Pays » (marqué requis *) soit renseigné. À reconfirmer et durcir la validation par étape si besoin.

---

## 3. Correctifs recommandés (prêts à appliquer)

### A. Template de résumé propre — `index.html` L4872-4890
Remplacer les fragments à crochets par une prose générique présentable, par ex. :
- « Consultant en {ERP} disposant de plusieurs années d'expérience sur des projets ERP. J'accompagne les entreprises dans l'optimisation de leurs processus et la mise en place de solutions adaptées à leurs besoins opérationnels. »
- Supprimer les lignes « [Module 1] / [Module 2] », « [Projet + contribution + résultat] », « [date / délai] » ou les remplacer par des intitulés sans crochets.

### B. Consommation du code d'invitation (#5)
Déplacer l'appel `consume_invitation_code(...)` du gate vers la soumission finale réussie (étape 4). Au gate, se contenter de **vérifier** la validité du code (sans le marquer utilisé).

### C. Inscription entreprise (#7)
Confirmer le comportement de l'INSERT anon ; si bloqué RLS, router la création via une Edge Function `service_role` ou ajuster la policy INSERT.

### D. Affichage expérience (#2) + nettoyage données démo (#1)
Afficher `experience_annees` avec fallback propre ; nettoyer les profils de démo contenant encore les placeholders `[…]`.

### E. Uniformiser la politique mot de passe (#3) et retirer l'email de l'URL (#9).

> ⚠️ Je n'ai volontairement PAS modifié le code cette nuit : je ne peux pas vérifier visuellement mes changements (le navigateur teste la version déployée, pas mes fichiers locaux, et je ne pousse pas en prod). Faire une refonte à l'aveugle juste avant ta présentation risquerait d'introduire des erreurs. Ces correctifs sont prêts à être appliqués ensemble, avec vérification, dès que tu me donnes le feu vert « en ligne ».

---

## 4. Tests validés (PASS)

- Chargement du site + bandeau STAGING visible ✅
- Navigation Accueil / Consultants / Entreprises / Fonctionnement ✅
- Liste consultants + cartes + pagination ✅
- **Visibilité B2B** : ressources B2B bien cachées pour un visiteur non connecté ✅ (règle métier clé OK)
- Fiche consultant : sections affichées (avatar, badges, compétences, stats, résumé, certifs, expériences) ✅
- Gate code d'invitation : `QATEST2027` accepté ✅
- Inscription consultant 4 étapes de bout en bout → « Candidature envoyée ! » ✅
  (chips ERP + sous-modules SAP dynamiques ✅ ; politique mdp affichée ✅)
- Connexion consultant (`Test1234!`) → accès au dashboard « Mon Espace » même en statut « en attente » ✅
- Dashboard consultant : KPIs, messagerie (état vide), i18n FR/EN présent ✅

---

## 5. Couverture & limites (transparence)

**Couvert en live** : site public, visibilité B2B, parcours consultant complet (inscription + connexion + dashboard).
**Non couvert / partiel** (à finir) :
- Inscription + dashboard **entreprise** (page gelée + INSERT RLS à confirmer ; pas de compte entreprise dispo)
- **Messagerie payante** et ses gates (nécessite entreprise approuvée + abonnement actif)
- **Dashboard admin** (pas de mot de passe admin disponible ; je ne dois pas modifier le hash)
- Filtres détaillés, dark mode, responsive mobile, tests XSS via formulaires

**Frictions d'outillage rencontrées** (ralentissent l'automatisation, pas des bugs du site) : formulaire dupliqué dans le DOM, `<select>` stylisés non cliquables (contournés via référence DOM), onglet site gelé en fin de session, auto-fermeture des crochets dans l'éditeur SQL Supabase.

---

## 6. Prochaines étapes proposées
1. Tu tranches le point #6 (modèle consultant payant ou gratuit).
2. On applique ensemble les correctifs §3 avec vérification visuelle sur staging.
3. On finit les tests entreprise / messagerie / admin (fournis-moi un accès admin de test).
4. Refonte visuelle « waw » ciblée, écran par écran, avec validation à chaque étape.
