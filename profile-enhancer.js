/**
 * ExpertERPHub — Profile Enhancer Bot
 * Professionnalise automatiquement les profils consultants à l'inscription.
 *
 * Mode 1 (défaut) : Templates intelligents — gratuit, côté client
 * Mode 2 (optionnel) : Claude API via Supabase Edge Function — ~$0.005/profil
 *
 * Usage :
 *   const enhanced = await ExpertProfileEnhancer.enhance(profileData);
 *   // enhanced.titre, enhanced.resume, enhanced.experiences => textes pro
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     CONFIG
     ══════════════════════════════════════════════ */
  var EDGE_FUNCTION_URL = null; // Set to your Supabase Edge Function URL to enable AI mode
  // Example: 'https://aqvkcbeezzbmoiykzfyo.supabase.co/functions/v1/professionalize-profile'

  /* ══════════════════════════════════════════════
     ERP KNOWLEDGE BASE
     ══════════════════════════════════════════════ */
  var ERP_KEYWORDS = {
    'SAP': { full: 'SAP ERP', modules: ['FI/CO', 'MM', 'SD', 'PP', 'HR', 'ABAP', 'S/4HANA', 'BW', 'FICO', 'WM', 'EWM', 'APO', 'CRM', 'SRM', 'GTS', 'TM', 'SuccessFactors', 'Ariba', 'Concur'] },
    'Oracle': { full: 'Oracle ERP Cloud', modules: ['Financials', 'HCM', 'SCM', 'Procurement', 'NetSuite', 'JD Edwards', 'PeopleSoft', 'Fusion', 'OCI'] },
    'Dynamics': { full: 'Microsoft Dynamics 365', modules: ['Finance', 'Supply Chain', 'Business Central', 'Sales', 'Customer Service', 'F&O', 'AX', 'NAV', 'GP', 'Power Platform'] },
    'Workday': { full: 'Workday', modules: ['HCM', 'Financial Management', 'Payroll', 'Recruiting', 'Learning', 'Adaptive Planning', 'Prism Analytics'] },
    'Sage': { full: 'Sage', modules: ['X3', 'Intacct', '100', '300', 'People', 'HR'] },
    'Infor': { full: 'Infor', modules: ['M3', 'LN', 'CloudSuite', 'Birst', 'Mongoose'] },
    'Odoo': { full: 'Odoo ERP', modules: ['CRM', 'Comptabilité', 'Inventaire', 'MRP', 'eCommerce'] },
    'Salesforce': { full: 'Salesforce', modules: ['Sales Cloud', 'Service Cloud', 'Marketing Cloud', 'Revenue Cloud', 'Experience Cloud', 'MuleSoft', 'Tableau', 'CPQ'] },
    'ServiceNow': { full: 'ServiceNow', modules: ['ITSM', 'ITOM', 'CMDB', 'HRSD', 'CSM', 'SecOps', 'GRC', 'Service Portal'] },
    'NetSuite': { full: 'Oracle NetSuite', modules: ['Financial Management', 'Inventory', 'Order Management', 'SuiteCommerce', 'SuiteAnalytics', 'SuiteScript'] },
    'SuccessFactors': { full: 'SAP SuccessFactors', modules: ['Employee Central', 'Performance & Goals', 'Succession', 'Recruiting', 'Learning', 'Compensation', 'Workforce Analytics'] }
  };

  /* ══════════════════════════════════════════════
     REFERENCE PROFILES — 10 profils modèles haute qualité
     Le bot s'en inspire pour générer des résumés et descriptions variés et réalistes
     ══════════════════════════════════════════════ */
  var REFERENCE_PROFILES = {

    'SAP': {
      titre: 'Consultant Fonctionnel SAP S/4HANA | FI/CO',
      resume: [
        "Consultant SAP confirmé avec une solide expertise sur les modules Finance et Contrôle de gestion (FI/CO). Reconnu pour sa capacité à structurer des blueprints fonctionnels complexes et à piloter des migrations S/4HANA de bout en bout. Maîtrise approfondie des processus comptables, de la consolidation financière et du reporting réglementaire dans des environnements multi-sociétés.",
        "Expert SAP spécialisé dans la transformation digitale des processus financiers. Expérience significative en déploiement S/4HANA, paramétrage avancé des modules FI/CO/MM et accompagnement au changement. Habitué aux contextes internationaux avec gestion multi-devises et multi-normes (IFRS, US GAAP).",
        "Professionnel SAP orienté résultats, intervenant sur l'ensemble du cycle projet : cadrage, conception, paramétrage, recette et hypercare. Forte appétence pour l'optimisation des flux logistiques et financiers. Certifié SAP S/4HANA Finance."
      ],
      experiences: [
        { titre: 'Consultant SAP FI/CO Senior', tasks: "Pilotage de la migration SAP ECC vers S/4HANA pour un groupe industriel (12 entités, 8 pays). Configuration des modules FI/CO/AA, refonte du plan comptable groupe et mise en place du reporting IFRS 16." },
        { titre: 'Consultant Fonctionnel SAP MM/SD', tasks: "Paramétrage des flux Procure-to-Pay et Order-to-Cash. Optimisation des processus d'approvisionnement avec intégration Ariba. Formation de 120 utilisateurs clés sur 3 sites." },
        { titre: 'Chef de Projet SAP S/4HANA', tasks: "Direction du programme de transformation S/4HANA (budget 2.5M€, équipe de 15). Coordination des workstreams Finance, Logistique et RH. Livraison dans les délais avec 98% de couverture fonctionnelle." }
      ],
      modules_context: {
        'FI/CO': 'comptabilité générale, analytique et contrôle de gestion',
        'MM': 'gestion des achats et des stocks',
        'SD': 'administration des ventes et facturation',
        'PP': 'planification et pilotage de la production',
        'WM': 'gestion des emplacements et mouvements en entrepôt',
        'EWM': 'gestion avancée des entrepôts avec optimisation des flux',
        'ABAP': 'développement custom, exits utilisateur et rapports ALV',
        'BW': 'modélisation de données, extraction et reporting décisionnel',
        'TM': 'gestion du transport et optimisation logistique',
        'S/4HANA': 'migration et déploiement de la suite S/4HANA'
      }
    },

    'Oracle': {
      titre: 'Consultant Oracle Cloud ERP | Financials & SCM',
      resume: [
        "Consultant Oracle Cloud certifié, spécialisé dans l'implémentation des modules Financials et Supply Chain Management. Expert en conception d'architectures Cloud hybrides et en migration depuis Oracle E-Business Suite. Capacité démontrée à réduire les délais de clôture comptable de 40% grâce à l'automatisation des processus.",
        "Professionnel Oracle avec plus de 8 ans d'expérience sur les solutions Cloud et On-Premise. Maîtrise complète du cycle d'implémentation : Fit-Gap analysis, configuration, data migration (FBDI/HDL), testing et go-live. Expertise reconnue en intégration Oracle Integration Cloud (OIC).",
        "Expert Oracle Fusion, reconnu pour sa double compétence fonctionnelle et technique. Intervient sur des projets de transformation à grande échelle incluant la convergence des ERP, l'harmonisation des processus et le déploiement de solutions Analytics (OTBI, BI Publisher)."
      ],
      experiences: [
        { titre: 'Consultant Oracle Cloud Financials', tasks: "Déploiement d'Oracle Cloud Financials pour un groupe bancaire (GL, AP, AR, FA, Cash Management). Migration de 5 ans de données historiques via FBDI. Conception de 35 rapports personnalisés avec OTBI." },
        { titre: 'Lead Fonctionnel Oracle SCM', tasks: "Refonte des processus Supply Chain sur Oracle Cloud : Procurement, Inventory, Order Management. Intégration avec les systèmes WMS tiers via Oracle Integration Cloud. Réduction de 25% des délais d'approvisionnement." },
        { titre: 'Architecte Solution Oracle', tasks: "Conception de l'architecture cible Oracle Cloud pour un retailer international (15 pays). Définition de la stratégie de coexistence EBS/Cloud pendant la phase de transition. Governance et standards de développement." }
      ],
      modules_context: {
        'Financials': 'comptabilité, comptes fournisseurs/clients et immobilisations',
        'HCM': 'gestion des talents, paie et workforce management',
        'SCM': 'chaîne d\'approvisionnement, achats et gestion des stocks',
        'Procurement': 'processus d\'achat, sourcing et contrats fournisseurs',
        'Fusion': 'suite intégrée Oracle Cloud Applications',
        'OCI': 'infrastructure cloud Oracle et services managés',
        'NetSuite': 'ERP cloud pour PME/ETI, multi-filiales',
        'PeopleSoft': 'gestion RH, paie et finance on-premise'
      }
    },

    'Dynamics': {
      titre: 'Consultant Microsoft Dynamics 365 | Finance & Operations',
      resume: [
        "Consultant Dynamics 365 Finance & Operations avec une expertise approfondie en transformation des processus financiers et logistiques. Certifié Microsoft, intervient sur des projets de déploiement, migration et optimisation D365 F&O dans des environnements multi-entités. Maîtrise de Power Platform pour l'extension des fonctionnalités standard.",
        "Expert Microsoft Dynamics avec une double compétence fonctionnelle et technique. Spécialisé dans l'intégration D365 avec l'écosystème Microsoft (Azure, Power BI, Power Automate). Expérience significative en reprise de données depuis AX/NAV et en conduite du changement.",
        "Professionnel Dynamics 365 Business Central orienté PME/ETI. Expertise en paramétrage, personnalisation AL et déploiement de solutions verticales (manufacturing, distribution). Reconnu pour sa pédagogie et sa capacité à vulgariser les enjeux techniques."
      ],
      experiences: [
        { titre: 'Consultant D365 Finance & Operations', tasks: "Implémentation de D365 F&O pour un groupe agroalimentaire (8 sites de production). Paramétrage des modules Finance, Supply Chain et Manufacturing. Développement de 15 extensions via Power Platform." },
        { titre: 'Lead Technique Dynamics AX/D365', tasks: "Migration de Dynamics AX 2012 vers D365 F&O : analyse des gaps, redesign des customisations X++ en extensions standard, migration de 3 bases de données. Réduction de 60% du code custom." },
        { titre: 'Consultant Dynamics 365 Business Central', tasks: "Déploiement de Business Central pour une chaîne de distribution (25 magasins). Configuration des modules vente, achat, stock et comptabilité. Intégration avec la caisse enregistreuse et le e-commerce via API." }
      ],
      modules_context: {
        'Finance': 'comptabilité, budgétisation et gestion de trésorerie',
        'Supply Chain': 'approvisionnement, production et gestion d\'entrepôt',
        'Business Central': 'ERP cloud tout-en-un pour PME',
        'Sales': 'CRM, pipeline commercial et prévisions',
        'F&O': 'Finance & Operations, ERP pour grandes entreprises',
        'Power Platform': 'Power BI, Power Automate et Power Apps',
        'AX': 'Dynamics AX (legacy), planification des ressources',
        'NAV': 'Dynamics NAV (Navision), gestion commerciale et comptable'
      }
    },

    'Workday': {
      titre: 'Consultant Workday HCM | Talents & Compensation',
      resume: [
        "Consultant Workday HCM certifié Pro, spécialisé dans la transformation des processus RH à l'échelle internationale. Expertise approfondie en Core HCM, Compensation, Talent Management et Absence Management. Capacité à configurer des structures organisationnelles complexes (matricielles, multi-pays) et à déployer des workflows d'approbation sophistiqués.",
        "Expert Workday avec une vision globale de la suite HCM. Intervient de la phase de design à l'hypercare sur des déploiements multi-pays. Maîtrise avancée de Workday Studio, EIBs, et des intégrations Cloud Connect. Reconnu pour sa capacité à traduire les besoins RH en configurations optimales.",
        "Professionnel Workday Financial Management, combinant expertise Finance et maîtrise de la plateforme. Spécialisé dans le déploiement des modules Accounting, Banking & Settlement et Business Assets pour des organisations en forte croissance."
      ],
      experiences: [
        { titre: 'Consultant Workday HCM Senior', tasks: "Déploiement Workday HCM pour un groupe pharmaceutique (45 000 collaborateurs, 30 pays). Configuration de Core HCM, Compensation, Benefits et Absence. Création de 80 rapports custom et 25 intégrations EIB." },
        { titre: 'Lead Workday Talent & Recruiting', tasks: "Mise en place de Workday Recruiting et Talent Management pour une ESN. Design des processus de recrutement, évaluation de la performance et plans de succession. Intégration avec LinkedIn Recruiter et les job boards." },
        { titre: 'Consultant Workday Payroll', tasks: "Implémentation de Workday Payroll pour la France et le Canada. Paramétrage des règles de calcul, gestion des organismes sociaux et conformité réglementaire. Parallèle de paie sur 3 mois avec 99.8% de concordance." }
      ],
      modules_context: {
        'HCM': 'gestion du capital humain, structures organisationnelles',
        'Financial Management': 'comptabilité, reporting financier et audit',
        'Payroll': 'paie, déclarations sociales et conformité',
        'Recruiting': 'recrutement, sourcing et onboarding',
        'Learning': 'formation, certifications et développement',
        'Adaptive Planning': 'planification budgétaire et prévisionnelle',
        'Prism Analytics': 'analytique avancée et data discovery'
      }
    },

    'Salesforce': {
      titre: 'Consultant Salesforce | CRM & Revenue Cloud',
      resume: [
        "Consultant Salesforce certifié (Administrator, Platform Developer I), expert en conception et déploiement de solutions CRM sur mesure. Maîtrise complète de Sales Cloud, Service Cloud et Revenue Cloud. Reconnu pour sa capacité à optimiser les parcours client et à augmenter les taux de conversion grâce à l'automatisation des processus commerciaux.",
        "Architecte Salesforce avec une vision 360° de l'écosystème : Sales, Service, Marketing Cloud, CPQ et intégrations via MuleSoft. Expérience significative en migration depuis des CRM legacy (Siebel, Dynamics CRM) et en design de modèles de données complexes. Approche orientée adoption utilisateur.",
        "Expert Salesforce spécialisé dans les implémentations B2B à haute volumétrie. Maîtrise approfondie de Apex, Lightning Web Components, Flows et Platform Events. Certifié Salesforce Application Architect."
      ],
      experiences: [
        { titre: 'Consultant Salesforce CRM Senior', tasks: "Refonte complète du CRM pour un éditeur SaaS (2000 utilisateurs). Déploiement de Sales Cloud avec CPQ, design de 45 Flows d'automatisation et intégration bidirectionnelle avec l'ERP via MuleSoft. Augmentation de 35% du pipeline commercial." },
        { titre: 'Lead Salesforce Service Cloud', tasks: "Implémentation de Service Cloud pour un opérateur télécom : gestion des cas, Knowledge Base, portail client communautaire et chatbot Einstein. Réduction de 40% du temps moyen de résolution des tickets." },
        { titre: 'Développeur Salesforce / Tech Lead', tasks: "Développement d'une application custom sur Salesforce Platform pour la gestion de contrats. 15 classes Apex, 8 Lightning Web Components, intégration DocuSign. Code review et mentoring de 3 développeurs juniors." }
      ],
      modules_context: {
        'Sales Cloud': 'gestion des opportunités, pipeline et prévisions',
        'Service Cloud': 'support client, gestion des cas et Knowledge',
        'Marketing Cloud': 'automatisation marketing, parcours client et analytics',
        'Revenue Cloud': 'CPQ, facturation et gestion des revenus',
        'Experience Cloud': 'portails partenaires et communautés client',
        'MuleSoft': 'intégration API et connectivité inter-systèmes',
        'Tableau': 'visualisation de données et analytics avancé'
      }
    },

    'ServiceNow': {
      titre: 'Consultant ServiceNow | ITSM & ITOM',
      resume: [
        "Consultant ServiceNow certifié CSA et CIS-ITSM, spécialisé dans la digitalisation des processus IT et métier. Expertise approfondie en ITSM, ITOM et Service Portal. Capacité à concevoir des architectures ServiceNow scalables alignées sur les bonnes pratiques ITIL 4. Plus de 15 implémentations réussies dans des secteurs variés.",
        "Expert ServiceNow avec une vision end-to-end de la plateforme Now. Intervient sur des projets de transformation IT à grande échelle : consolidation d'outils ITSM, mise en place de CMDB fédérée et automatisation des opérations via Flow Designer et IntegrationHub.",
        "Professionnel ServiceNow orienté HR Service Delivery et Customer Service Management. Spécialisé dans l'extension de la plateforme au-delà de l'IT pour digitaliser les processus RH, Juridique et Facilities Management."
      ],
      experiences: [
        { titre: 'Consultant ServiceNow ITSM', tasks: "Déploiement d'ITSM Pro pour un groupe bancaire (8 000 utilisateurs). Configuration d'Incident, Problem, Change et Service Catalog. Mise en place de Predictive Intelligence pour le routage automatique des incidents. Réduction de 30% du MTTR." },
        { titre: 'Architecte ServiceNow ITOM', tasks: "Conception et déploiement d'ITOM (Discovery, Service Mapping, Event Management) pour un hébergeur cloud. Mapping de 15 000 CIs, intégration avec Datadog et PagerDuty. Automatisation de la détection d'impact." },
        { titre: 'Lead ServiceNow CSM', tasks: "Implémentation de Customer Service Management pour une ESN : portail client, gestion des SLA, case management et asset management. Intégration avec Jira et Confluence via IntegrationHub." }
      ],
      modules_context: {
        'ITSM': 'gestion des services IT (incidents, problèmes, changements)',
        'ITOM': 'opérations IT, discovery et event management',
        'CMDB': 'base de données de configuration et cartographie',
        'HRSD': 'digitalisation des services RH et portail employé',
        'CSM': 'gestion du service client et portail externe',
        'SecOps': 'opérations de sécurité et réponse aux incidents',
        'GRC': 'gouvernance, risque et conformité'
      }
    },

    'NetSuite': {
      titre: 'Consultant Oracle NetSuite | ERP Cloud PME/ETI',
      resume: [
        "Consultant NetSuite certifié (SuiteFoundation, ERP Consultant), spécialisé dans le déploiement d'ERP cloud pour les PME et ETI en croissance. Expertise en configuration des modules Financial Management, Inventory et Order Management. Reconnu pour sa capacité à réduire les délais de déploiement grâce à une méthodologie agile éprouvée.",
        "Expert NetSuite avec une forte orientation e-commerce et multi-filiales. Maîtrise de SuiteScript 2.0, SuiteFlow et SuiteAnalytics pour l'extension et la personnalisation de la plateforme. Expérience significative en intégration avec Shopify, Amazon et les marketplaces B2B.",
        "Professionnel NetSuite accompagnant les scale-ups dans leur structuration ERP. De la mise en place comptable initiale à la consolidation multi-entités, en passant par l'automatisation des revenus (ASC 606) et le reporting investisseurs."
      ],
      experiences: [
        { titre: 'Consultant NetSuite ERP', tasks: "Implémentation de NetSuite pour une scale-up SaaS (série B, 150 employés). Configuration de la comptabilité multi-devises, revenue recognition (ASC 606), et gestion des abonnements. Go-live en 10 semaines." },
        { titre: 'Développeur NetSuite / SuiteScript', tasks: "Développement d'une solution de gestion d'entrepôt custom via SuiteScript 2.0 et SuiteCommerce Advanced. 12 scripts serveur, 8 restlets pour intégration WMS tiers. Optimisation des performances de 45%." },
        { titre: 'Lead NetSuite Multi-Subsidiary', tasks: "Déploiement multi-filiales pour un groupe de distribution (8 entités, 4 pays). Configuration de la consolidation intercompany, éliminations automatiques et reporting par segment. Formation de 45 utilisateurs." }
      ],
      modules_context: {
        'Financial Management': 'comptabilité, consolidation et clôture',
        'Inventory': 'gestion des stocks, lots et emplacements',
        'Order Management': 'commandes, facturation et fulfillment',
        'SuiteCommerce': 'e-commerce B2B/B2C intégré à l\'ERP',
        'SuiteAnalytics': 'reporting, tableaux de bord et KPIs',
        'SuiteScript': 'personnalisation et automatisation JavaScript'
      }
    },

    'SuccessFactors': {
      titre: 'Consultant SAP SuccessFactors | Employee Central & Talent',
      resume: [
        "Consultant SAP SuccessFactors certifié, spécialisé dans la transformation digitale RH. Expertise approfondie en Employee Central, Performance & Goals et Succession Planning. Capacité à concevoir des solutions RH cloud alignées sur la stratégie talent de l'entreprise, dans des contextes internationaux (multi-pays, multi-langues, multi-conventions).",
        "Expert SuccessFactors avec une vision intégrée de la suite HXM. Intervient sur des projets de déploiement et de migration depuis SAP HCM on-premise. Maîtrise des intégrations CPI (Cloud Platform Integration) et de la coexistence hybride SAP HCM / SuccessFactors.",
        "Professionnel SuccessFactors orienté Workforce Analytics et People Insights. Combine expertise RH et data pour aider les organisations à prendre des décisions basées sur les données : turnover prédictif, diversité et engagement."
      ],
      experiences: [
        { titre: 'Consultant SuccessFactors EC', tasks: "Déploiement d'Employee Central pour un groupe cosmétique (20 000 collaborateurs, 25 pays). Configuration des structures organisationnelles, workflows d'approbation et gestion des temps. Intégration avec SAP Payroll via CPI." },
        { titre: 'Lead SuccessFactors Talent', tasks: "Mise en place de Performance & Goals, Succession et Development pour une banque. Design des formulaires d'évaluation, calibration sessions et talent pools. Formation de 200 managers aux nouveaux processus." },
        { titre: 'Consultant SuccessFactors Recruiting', tasks: "Implémentation de Recruiting Management et Onboarding 2.0 pour un cabinet de conseil. Configuration du career site, workflows de validation et intégration avec les job boards (Indeed, LinkedIn). Réduction de 25% du time-to-hire." }
      ],
      modules_context: {
        'Employee Central': 'gestion administrative RH et données collaborateurs',
        'Performance & Goals': 'évaluation de la performance et objectifs',
        'Succession': 'planification de la relève et viviers de talents',
        'Recruiting': 'recrutement, career site et onboarding',
        'Learning': 'gestion de la formation et certifications',
        'Compensation': 'politique de rémunération et bonus',
        'Workforce Analytics': 'analytique RH et tableaux de bord'
      }
    },

    'Infor': {
      titre: 'Consultant Infor M3/LN | Manufacturing & Supply Chain',
      resume: [
        "Consultant Infor certifié, spécialisé dans les solutions ERP pour l'industrie manufacturière et la distribution. Expertise approfondie sur Infor M3 et CloudSuite Industrial. Capacité à optimiser les processus de production, planification et gestion de la chaîne d'approvisionnement dans des environnements complexes (make-to-order, configure-to-order).",
        "Expert Infor LN avec une solide expérience en déploiement pour les secteurs aéronautique, défense et équipementiers industriels. Maîtrise des processus de Project Manufacturing, Service Management et Quality Management. Approche orientée best practices et lean manufacturing.",
        "Professionnel Infor CloudSuite accompagnant les industriels dans leur migration vers le cloud. De l'assessment technique à la configuration des modules Finance, Supply Chain et HCM, en passant par l'intégration avec Infor OS (ION, Ming.le, Birst)."
      ],
      experiences: [
        { titre: 'Consultant Infor M3 Supply Chain', tasks: "Déploiement d'Infor M3 pour un fabricant agroalimentaire (6 usines). Configuration des modules Procurement, Inventory, Production Planning et Quality. Intégration avec les automates de production via ION API. Réduction de 20% des ruptures de stock." },
        { titre: 'Lead Infor LN Manufacturing', tasks: "Implémentation d'Infor LN pour un équipementier aéronautique. Configuration du Project Manufacturing, gestion des configurations produit et traçabilité sérielle. Conformité aux exigences AS9100." },
        { titre: 'Consultant Infor CloudSuite Migration', tasks: "Migration depuis Infor M3 on-premise vers CloudSuite Industrial pour un groupe chimique. Assessment technique, remédiation des personnalisations, data migration et parallèle de 2 mois. 450 utilisateurs migrés." }
      ],
      modules_context: {
        'M3': 'ERP pour industries de process et manufacturing',
        'LN': 'ERP pour manufacturing discret et projets complexes',
        'CloudSuite': 'suite cloud intégrée par industrie',
        'Birst': 'analytique et business intelligence embarquée',
        'ION': 'middleware d\'intégration et orchestration',
        'Mongoose': 'framework de développement low-code Infor'
      }
    },

    'Odoo': {
      titre: 'Consultant Odoo ERP | Intégrateur Full Stack',
      resume: [
        "Consultant Odoo certifié, expert en déploiement de solutions ERP open-source pour les PME. Maîtrise complète de l'écosystème Odoo : CRM, Ventes, Achats, Inventaire, Comptabilité et Manufacturing. Capacité à livrer des projets clé en main avec personnalisation Python/OWL et intégrations API REST.",
        "Développeur-intégrateur Odoo avec une approche full-stack. Combine expertise fonctionnelle et compétences techniques (Python, PostgreSQL, JavaScript/OWL) pour délivrer des solutions sur mesure. Plus de 30 déploiements réussis, du commerce de détail à l'industrie.",
        "Expert Odoo orienté e-commerce et multi-canaux. Spécialisé dans le déploiement de solutions intégrées boutique en ligne + ERP + POS (Point of Sale) pour les retailers. Maîtrise des thèmes Odoo, du module Website Builder et des connecteurs marketplace."
      ],
      experiences: [
        { titre: 'Consultant Odoo ERP Senior', tasks: "Déploiement d'Odoo 17 pour une PME industrielle (80 employés). Configuration de l'ensemble des modules : CRM, Ventes, Achats, Stock, MRP et Comptabilité. Développement de 5 modules custom en Python. Go-live en 8 semaines." },
        { titre: 'Développeur Odoo Full Stack', tasks: "Développement d'un module de gestion des abonnements et facturation récurrente pour un éditeur SaaS. Backend Python, frontend OWL, API REST pour intégration Stripe. Tests unitaires et documentation technique complète." },
        { titre: 'Intégrateur Odoo E-commerce', tasks: "Mise en place d'Odoo Website + E-commerce + POS pour une chaîne de prêt-à-porter (12 boutiques). Synchronisation stock temps réel, programme fidélité custom et intégration transporteurs (Colissimo, Chronopost)." }
      ],
      modules_context: {
        'CRM': 'gestion de la relation client et pipeline commercial',
        'Comptabilité': 'comptabilité générale, analytique et fiscalité',
        'Inventaire': 'gestion des stocks, routes et traçabilité',
        'MRP': 'planification de production et ordres de fabrication',
        'eCommerce': 'boutique en ligne intégrée avec gestion des paiements',
        'POS': 'point de vente pour le commerce de détail'
      }
    }
  };

  var ROLE_TEMPLATES = {
    'Consultant fonctionnel': 'Consultant Fonctionnel {erp}',
    'Consultant technique': 'Consultant Technique {erp}',
    'Chef de projet': 'Chef de Projet ERP {erp}',
    'Développeur': 'Développeur {erp}',
    'Architecte': 'Architecte Solution {erp}',
    'Business analyst': 'Business Analyst {erp}',
    'Data analyst': 'Data Analyst {erp}',
    'Formateur': 'Formateur {erp}',
    'Support': 'Consultant Support {erp}',
    'AMOA': 'Consultant AMOA {erp}',
    'MOA': 'Consultant MOA {erp}',
    'MOE': 'Consultant MOE {erp}'
  };

  /* ══════════════════════════════════════════════
     TEMPLATE ENGINE (Mode 1 — Gratuit)
     ══════════════════════════════════════════════ */

  /**
   * Capitalise proprement un texte (première lettre majuscule par mot)
   */
  function capitalizeWords(text) {
    if (!text) return '';
    var small = ['de', 'du', 'des', 'le', 'la', 'les', 'et', 'en', 'au', 'aux', 'à', 'par', 'pour', 'sur', 'un', 'une', 'of', 'the', 'and', 'in', 'on', 'for'];
    return text.trim().split(/\s+/).map(function (word, i) {
      var lower = word.toLowerCase();
      if (i > 0 && small.indexOf(lower) !== -1) return lower;
      // Keep acronyms uppercase (SAP, ERP, etc.)
      if (word === word.toUpperCase() && word.length <= 5) return word;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join(' ');
  }

  /**
   * Détecte le(s) ERP principal(aux) à partir des compétences
   */
  function detectPrimaryErp(competences) {
    if (!competences || !competences.length) return '';
    for (var i = 0; i < competences.length; i++) {
      var comp = String(competences[i]).trim();
      for (var erp in ERP_KEYWORDS) {
        if (comp.toLowerCase().indexOf(erp.toLowerCase()) !== -1) {
          return erp;
        }
      }
    }
    return competences[0] || '';
  }

  /**
   * Améliore le titre du consultant
   */
  function enhanceTitre(titre, competences) {
    if (!titre) return '';
    var raw = titre.trim();
    var erp = detectPrimaryErp(competences);

    // Chercher un template correspondant
    for (var pattern in ROLE_TEMPLATES) {
      if (raw.toLowerCase().indexOf(pattern.toLowerCase()) !== -1) {
        return ROLE_TEMPLATES[pattern].replace('{erp}', erp ? '| ' + erp : '').trim();
      }
    }

    // Pas de template trouvé — capitaliser et ajouter l'ERP si absent
    var enhanced = capitalizeWords(raw);
    if (erp && enhanced.toLowerCase().indexOf(erp.toLowerCase()) === -1) {
      enhanced += ' | ' + erp;
    }
    return enhanced;
  }

  /**
   * Formate les années d'expérience en texte lisible
   */
  function formatAnneesExp(val) {
    if (!val) return '';
    var map = {
      '0-2': 'plus de 2 ans', '1-3': 'plus de 3 ans', '3-5': '3 à 5 ans',
      '5-10': '5 à 10 ans', '5-8': '5 à 8 ans', '8-12': '8 à 12 ans',
      '10-15': '10 à 15 ans', '10+': 'plus de 10 ans', '15+': 'plus de 15 ans',
      '12+': 'plus de 12 ans', '20+': 'plus de 20 ans'
    };
    return map[val] || val + " ans";
  }

  /**
   * Formate le mode de travail
   */
  function formatMode(mode) {
    if (!mode) return '';
    var map = {
      'remote': 'télétravail', 'onsite': 'sur site', 'hybrid': 'hybride',
      'teletravail': 'télétravail', 'sur_site': 'sur site'
    };
    return map[mode.toLowerCase()] || mode;
  }

  /**
   * Retourne les phrases de spécialité modules
   */
  function buildModulesPhrase(modules, erp) {
    if (!modules || !modules.length) return '';
    var list = modules.slice(0, 5);
    if (list.length === 1) return 'spécialisé sur le module ' + list[0];
    var last = list.pop();
    return 'spécialisé sur les modules ' + list.join(', ') + ' et ' + last;
  }

  /**
   * Construit une phrase secteurs à partir des expériences
   */
  function buildSecteursPhrase(experiences) {
    if (!experiences || !experiences.length) return '';
    var secteurs = [];
    experiences.forEach(function (exp) {
      if (exp.secteur && exp.secteur.trim() && secteurs.indexOf(exp.secteur.trim()) === -1) {
        secteurs.push(capitalizeWords(exp.secteur.trim()));
      }
    });
    if (!secteurs.length) return '';
    if (secteurs.length === 1) return 'dans le secteur ' + secteurs[0];
    var last = secteurs.pop();
    return 'dans les secteurs ' + secteurs.join(', ') + ' et ' + last;
  }

  /**
   * Cherche le profil de référence le plus proche de l'ERP détecté
   */
  function findReferenceProfile(erp) {
    if (!erp) return null;
    var key = erp.trim();
    // Exact match
    if (REFERENCE_PROFILES[key]) return REFERENCE_PROFILES[key];
    // Partial match (ex: "SAP S/4HANA" → "SAP", "Dynamics 365" → "Dynamics")
    for (var refKey in REFERENCE_PROFILES) {
      if (key.toLowerCase().indexOf(refKey.toLowerCase()) !== -1 ||
          refKey.toLowerCase().indexOf(key.toLowerCase()) !== -1) {
        return REFERENCE_PROFILES[refKey];
      }
    }
    return null;
  }

  /**
   * Retourne le contexte métier d'un module à partir du profil de référence
   */
  function getModuleContext(module, refProfile) {
    if (!refProfile || !refProfile.modules_context) return '';
    // Exact match
    if (refProfile.modules_context[module]) return refProfile.modules_context[module];
    // Partial match
    for (var modKey in refProfile.modules_context) {
      if (module.toLowerCase().indexOf(modKey.toLowerCase()) !== -1 ||
          modKey.toLowerCase().indexOf(module.toLowerCase()) !== -1) {
        return refProfile.modules_context[modKey];
      }
    }
    return '';
  }

  /**
   * Construit une phrase de modules enrichie avec contexte métier (si profil de référence disponible)
   */
  function buildModulesPhraseRich(modules, erp, refProfile) {
    if (!modules || !modules.length) return '';
    var list = modules.slice(0, 4);

    // Si on a un profil de référence, enrichir avec le contexte
    if (refProfile && list.length <= 3) {
      var parts = list.map(function (mod) {
        var ctx = getModuleContext(mod, refProfile);
        return ctx ? mod + ' (' + ctx + ')' : mod;
      });
      if (parts.length === 1) return 'spécialisé sur le module ' + parts[0];
      var last = parts.pop();
      return 'spécialisé sur les modules ' + parts.join(', ') + ' et ' + last;
    }

    // Fallback sans contexte
    return buildModulesPhrase(modules, erp);
  }

  /**
   * Sélectionne un résumé de référence aléatoire parmi les exemples du profil
   */
  function pickResumeStyle(refProfile) {
    if (!refProfile || !refProfile.resume || !refProfile.resume.length) return 0;
    return Math.floor(Math.random() * refProfile.resume.length);
  }

  /**
   * Génère un résumé complet et personnalisé quand le consultant n'en fournit pas.
   * Utilise les profils de référence pour varier le style et enrichir le vocabulaire.
   */
  function generateFullResume(data) {
    var erp = detectPrimaryErp(data.competences);
    var erpInfo = erp ? ERP_KEYWORDS[erp] : null;
    var refProfile = findReferenceProfile(erp);
    var notes = data._notes || {};
    var annees = formatAnneesExp(notes.annees_exp);
    var modules = notes.erp_modules || [];
    var ville = notes.ville || '';
    var mode = formatMode(notes.mode_travail);
    var langues = notes.langues || '';
    var exps = notes.experiences || [];
    var titre = data.titre || '';

    var phrases = [];
    var style = pickResumeStyle(refProfile);

    // ── Phrase 1 : Accroche principale — style varié selon le profil de référence
    var accroche = '';
    var erpLabel = erpInfo ? erpInfo.full : erp;

    if (style === 0) {
      // Style descriptif : "Consultant X confirmé avec une solide expertise sur..."
      if (titre && erp && annees) {
        accroche = capitalizeWords(titre) + ' ' + erpLabel + ' confirmé avec ' + annees + " d'expérience";
      } else if (titre && erp) {
        accroche = capitalizeWords(titre) + ' ' + erpLabel + ' confirmé';
      } else if (erp && annees) {
        accroche = 'Consultant ' + erpLabel + ' confirmé avec ' + annees + " d'expérience";
      } else {
        accroche = capitalizeWords(titre) || 'Consultant ERP confirmé';
      }
    } else if (style === 1) {
      // Style expert : "Expert X avec une vision globale..."
      if (titre && erp && annees) {
        accroche = 'Expert ' + erpLabel + ' disposant de ' + annees + " d'expérience en tant que " + capitalizeWords(titre).toLowerCase();
      } else if (erp && annees) {
        accroche = 'Expert ' + erpLabel + ' disposant de ' + annees + " d'expérience";
      } else if (titre && erp) {
        accroche = 'Expert ' + erpLabel + ', ' + capitalizeWords(titre).toLowerCase();
      } else {
        accroche = capitalizeWords(titre) || 'Expert ERP';
      }
    } else {
      // Style professionnel : "Professionnel X orienté résultats..."
      if (titre && erp && annees) {
        accroche = 'Professionnel ' + erpLabel + ' avec ' + annees + " d'expérience, intervenant en tant que " + capitalizeWords(titre).toLowerCase();
      } else if (erp && annees) {
        accroche = 'Professionnel ' + erpLabel + ' avec ' + annees + " d'expérience";
      } else if (titre && erp) {
        accroche = 'Professionnel ' + erpLabel + ', ' + capitalizeWords(titre).toLowerCase();
      } else {
        accroche = capitalizeWords(titre) || 'Professionnel ERP';
      }
    }

    // ── Phrase 2 : Modules — enrichi avec contexte métier si profil de référence
    if (modules.length) {
      var modPhrase = buildModulesPhraseRich(modules, erp, refProfile);
      if (modPhrase) {
        accroche += ', ' + modPhrase;
      }
    }
    phrases.push(accroche + '.');

    // ── Phrase 3 : Capacité clé (inspirée du profil de référence)
    if (refProfile && refProfile.resume && refProfile.resume[style]) {
      // Extraire une phrase de capacité du profil de référence (2e phrase typiquement)
      var refSentences = refProfile.resume[style].split('. ');
      if (refSentences.length > 1) {
        // Adapter la capacité au profil réel — ex: "Reconnu pour sa capacité à..."
        var capPhrase = refSentences[1];
        if (capPhrase && capPhrase.indexOf('apacit') !== -1 || capPhrase && capPhrase.indexOf('econnu') !== -1 ||
            capPhrase && capPhrase.indexOf('aîtrise') !== -1 || capPhrase && capPhrase.indexOf('xpertise') !== -1) {
          phrases.push(capPhrase.trim().replace(/\.$/, '') + '.');
        }
      }
    }

    // ── Phrase 4 : Secteurs d'activité
    var secteursPhrase = buildSecteursPhrase(exps);
    if (secteursPhrase) {
      phrases.push('Intervient ' + secteursPhrase + '.');
    }

    // ── Phrase 5 : Localisation et mode
    var locParts = [];
    if (ville) locParts.push('basé à ' + capitalizeWords(ville));
    if (mode) locParts.push('disponible en ' + mode);
    if (locParts.length) {
      phrases.push(capitalizeWords(locParts[0].charAt(0).toUpperCase() + locParts[0].slice(1)) +
        (locParts.length > 1 ? ', ' + locParts[1] : '') + '.');
    }

    // ── Phrase 6 : Langues
    if (langues && langues.trim()) {
      phrases.push('Langues : ' + langues.trim() + '.');
    }

    // ── Phrase 7 : Entreprises de référence
    if (exps.length) {
      var entreprises = [];
      exps.forEach(function (e) {
        if (e.entreprise && e.entreprise.trim() && entreprises.indexOf(e.entreprise.trim()) === -1) {
          entreprises.push(capitalizeWords(e.entreprise.trim()));
        }
      });
      if (entreprises.length >= 2) {
        phrases.push('A accompagné des entreprises telles que ' + entreprises.slice(0, 3).join(', ') + '.');
      } else if (entreprises.length === 1) {
        phrases.push('A notamment accompagné ' + entreprises[0] + '.');
      }
    }

    return phrases.join(' ');
  }

  /**
   * Professionnalise le résumé du consultant — utilise les vraies données du formulaire
   */
  function enhanceResume(resume, data) {
    var erp = detectPrimaryErp(data.competences);
    var notes = data._notes || {};
    var annees = formatAnneesExp(notes.annees_exp);
    var modules = notes.erp_modules || [];

    // NE JAMAIS inventer de résumé — retourner tel quel ce que le consultant a saisi.
    // Seul nettoyage autorisé : capitalisation + ponctuation finale.
    if (!resume || !resume.trim()) return '';

    var text = resume.trim();
    text = text.charAt(0).toUpperCase() + text.slice(1);
    text = text.replace(/\n{3,}/g, '\n\n');
    if (!/[.!?]$/.test(text.trim())) {
      text = text.trim() + '.';
    }
    return text;
  }

  /**
   * Génère une description d'expérience basée sur le rôle, ERP, secteur
   * et les profils de référence pour un résultat plus réaliste et varié
   */
  function generateExpDescription(exp, profileTitre, competences) {
    var erp = detectPrimaryErp(competences);
    var refProfile = findReferenceProfile(erp);
    var titre = (exp.titre || '').toLowerCase();
    var secteur = exp.secteur || '';

    // ── Essayer de matcher avec une expérience de référence similaire
    if (refProfile && refProfile.experiences) {
      var bestMatch = null;
      var bestScore = 0;
      refProfile.experiences.forEach(function (refExp) {
        var refTitre = (refExp.titre || '').toLowerCase();
        var score = 0;
        // Matcher par type de rôle
        if (titre.indexOf('chef de projet') !== -1 && refTitre.indexOf('chef de projet') !== -1) score += 3;
        if (titre.indexOf('lead') !== -1 && refTitre.indexOf('lead') !== -1) score += 3;
        if (titre.indexOf('fonctionnel') !== -1 && refTitre.indexOf('fonctionnel') !== -1) score += 3;
        if (titre.indexOf('technique') !== -1 && (refTitre.indexOf('technique') !== -1 || refTitre.indexOf('développeur') !== -1)) score += 3;
        if (titre.indexOf('développeur') !== -1 && (refTitre.indexOf('développeur') !== -1 || refTitre.indexOf('dev') !== -1)) score += 3;
        if (titre.indexOf('architecte') !== -1 && refTitre.indexOf('architecte') !== -1) score += 3;
        if (titre.indexOf('senior') !== -1 && refTitre.indexOf('senior') !== -1) score += 1;
        if (titre.indexOf('consultant') !== -1 && refTitre.indexOf('consultant') !== -1) score += 1;
        // Bonus si même ERP mentionné
        if (erp && refTitre.indexOf(erp.toLowerCase()) !== -1) score += 2;
        if (score > bestScore) { bestScore = score; bestMatch = refExp; }
      });

      // Si on a un bon match (score >= 2), adapter la description de référence
      if (bestMatch && bestScore >= 2 && bestMatch.tasks) {
        var adaptedTasks = bestMatch.tasks;
        // Remplacer les détails spécifiques par des termes plus génériques
        adaptedTasks = adaptedTasks
          .replace(/pour un groupe [^.(]+/g, secteur ? 'pour une entreprise du secteur ' + secteur : "pour un client de référence")
          .replace(/pour un [^.(]+\(/g, secteur ? 'pour une organisation du secteur ' + secteur + ' (' : 'pour un client (')
          .replace(/\d+ entités/g, 'plusieurs entités')
          .replace(/\d+ pays/g, 'plusieurs pays')
          .replace(/\d+ utilisateurs/g, "l'ensemble des utilisateurs")
          .replace(/Réduction de \d+%/g, 'Amélioration significative');
        return adaptedTasks;
      }
    }

    // ── Fallback : génération par type de rôle (enrichi)
    var tasks = [];

    if (titre.indexOf('chef de projet') !== -1 || titre.indexOf('project manager') !== -1) {
      tasks.push('Pilotage du projet de déploiement' + (erp ? ' ' + erp : '') + ', de la phase de cadrage au go-live');
      tasks.push('Coordination des équipes fonctionnelles et techniques, gestion du planning et des risques');
      if (secteur) tasks.push('Gestion des spécificités métier du secteur ' + secteur);
      tasks.push('Suivi budgétaire, reporting auprès du comité de pilotage et gestion des parties prenantes');
    } else if (titre.indexOf('fonctionnel') !== -1 || titre.indexOf('functional') !== -1) {
      tasks.push('Recueil et analyse des besoins métier, animation des ateliers de conception');
      tasks.push('Paramétrage et configuration' + (erp ? ' ' + erp : '') + ' selon les spécifications validées');
      tasks.push('Rédaction des spécifications fonctionnelles et des cahiers de recette');
      if (secteur) tasks.push('Adaptation des processus aux contraintes du secteur ' + secteur);
    } else if (titre.indexOf('technique') !== -1 || titre.indexOf('développeur') !== -1 || titre.indexOf('dev') !== -1) {
      tasks.push('Développement et personnalisation' + (erp ? ' ' + erp : '') + ' selon les spécifications techniques');
      tasks.push('Conception des interfaces et intégrations avec les systèmes tiers');
      tasks.push('Tests unitaires, recette technique et optimisation des performances');
    } else if (titre.indexOf('amoa') !== -1 || titre.indexOf('moa') !== -1 || titre.indexOf('analyst') !== -1) {
      tasks.push("Analyse des processus métier existants et identification des axes d'amélioration");
      tasks.push('Rédaction des cahiers des charges, spécifications fonctionnelles et user stories');
      tasks.push('Accompagnement au changement et formation des utilisateurs clés');
    } else if (titre.indexOf('formateur') !== -1 || titre.indexOf('support') !== -1) {
      tasks.push("Animation des sessions de formation utilisateurs" + (erp ? ' ' + erp : '') + ' (présentiel et distanciel)');
      tasks.push('Création des supports de formation, guides utilisateur et documentation fonctionnelle');
      tasks.push('Support post-déploiement, résolution des incidents et accompagnement de premier niveau');
    } else {
      // Rôle générique — enrichi
      tasks.push('Contribution active au projet de transformation' + (erp ? ' ' + erp : '') + " dans un contexte d'évolution des SI");
      if (secteur) tasks.push('Adaptation des solutions aux enjeux spécifiques du secteur ' + secteur);
      tasks.push('Collaboration étroite avec les équipes métier, IT et les partenaires intégrateurs');
    }

    return tasks.slice(0, 3).join('. ') + '.';
  }

  /**
   * Professionnalise les expériences — capitalise + ajoute description si manquante
   */
  function enhanceExperiences(experiences, profileTitre, competences) {
    if (!experiences || !experiences.length) return [];
    return experiences.map(function (exp) {
      var enhanced = {};
      for (var k in exp) { if (exp.hasOwnProperty(k)) enhanced[k] = exp[k]; }

      // Capitaliser le titre
      if (enhanced.titre) {
        enhanced.titre = capitalizeWords(enhanced.titre);
      }
      // Capitaliser l'entreprise
      if (enhanced.entreprise) {
        enhanced.entreprise = capitalizeWords(enhanced.entreprise);
      }
      // Capitaliser le secteur
      if (enhanced.secteur) {
        enhanced.secteur = capitalizeWords(enhanced.secteur);
      }
      // NE JAMAIS inventer de description — on garde ce que le consultant a saisi
      // Si pas de description, on laisse vide. Le consultant pourra la remplir plus tard.
      return enhanced;
    });
  }

  /**
   * Standardise les compétences ERP
   */
  function enhanceCompetences(competences) {
    if (!competences || !competences.length) return competences || [];
    return competences.map(function (comp) {
      var trimmed = String(comp).trim();
      // Standardiser les noms ERP connus
      for (var erp in ERP_KEYWORDS) {
        if (trimmed.toLowerCase() === erp.toLowerCase()) {
          return erp; // Forme canonique
        }
      }
      return trimmed;
    });
  }

  /**
   * Professionnalise le profil complet via templates (gratuit)
   * Utilise TOUTES les données du formulaire pour un résultat personnalisé
   */
  function enhanceWithTemplates(profileData) {
    var notes = {};
    if (profileData.notes_admin) {
      try {
        notes = typeof profileData.notes_admin === 'string'
          ? JSON.parse(profileData.notes_admin)
          : profileData.notes_admin;
      } catch (e) { notes = {}; }
    }

    // Passer les notes parsées pour que enhanceResume ait accès à tout
    var dataForResume = {
      competences: profileData.competences,
      titre: profileData.titre,
      _notes: notes
    };

    var result = {
      titre: enhanceTitre(profileData.titre, profileData.competences),
      resume: enhanceResume(notes.resume || '', dataForResume),
      competences: enhanceCompetences(profileData.competences),
      experiences: enhanceExperiences(notes.experiences || [], profileData.titre, profileData.competences),
      prenom: capitalizeWords(profileData.prenom || ''),
      nom: (profileData.nom || '').toUpperCase()
    };

    return result;
  }

  /* ══════════════════════════════════════════════
     AI ENGINE (Mode 2 — Claude API via Edge Function)
     ══════════════════════════════════════════════ */

  /**
   * Professionnalise via Claude API (Supabase Edge Function)
   * Retourne null si non configuré ou en erreur → fallback templates
   */
  function enhanceWithAI(profileData) {
    if (!EDGE_FUNCTION_URL) return Promise.resolve(null);

    var sbKey = (window.ExpertConfig && ExpertConfig.SB_KEY) || '';

    return fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sbKey
      },
      body: JSON.stringify(profileData)
    })
    .then(function (r) {
      if (!r.ok) throw new Error('Edge Function error: ' + r.status);
      return r.json();
    })
    .then(function (data) {
      if (data && data.enhanced) return data.enhanced;
      return null;
    })
    .catch(function (err) {
      console.warn('[ProfileEnhancer] AI mode failed, falling back to templates:', err.message);
      return null;
    });
  }

  /* ══════════════════════════════════════════════
     PUBLIC API
     ══════════════════════════════════════════════ */

  /**
   * Point d'entrée principal — professionnalise un profil consultant.
   *
   * @param {object} profileData  Données du formulaire d'inscription :
   *   { titre, competences[], prenom, nom, notes_admin: { resume, experiences[], annees_exp, ... } }
   * @returns {Promise<object>}  Champs améliorés : { titre, resume, competences, experiences, prenom, nom }
   */
  function enhance(profileData) {
    // Essayer le mode AI d'abord (si configuré)
    return enhanceWithAI(profileData).then(function (aiResult) {
      if (aiResult) {
        console.log('[ProfileEnhancer] Mode AI — profil amélioré par Claude');
        return aiResult;
      }
      // Fallback : templates gratuits
      console.log('[ProfileEnhancer] Mode Templates — profil formaté localement');
      return enhanceWithTemplates(profileData);
    });
  }

  /**
   * Vérifie si le mode AI est activé
   */
  function isAIEnabled() {
    return !!EDGE_FUNCTION_URL;
  }

  /**
   * Configure l'URL de la Edge Function (active le mode AI)
   */
  function setEdgeFunctionUrl(url) {
    EDGE_FUNCTION_URL = url;
  }

  /* ── Export ── */
  window.ExpertProfileEnhancer = {
    enhance: enhance,
    isAIEnabled: isAIEnabled,
    setEdgeFunctionUrl: setEdgeFunctionUrl,
    // Expose internals for testing
    _enhanceTitre: enhanceTitre,
    _enhanceResume: enhanceResume,
    _enhanceCompetences: enhanceCompetences,
    _capitalizeWords: capitalizeWords,
    _detectPrimaryErp: detectPrimaryErp,
    _findReferenceProfile: findReferenceProfile,
    _REFERENCE_PROFILES: REFERENCE_PROFILES
  };

})();
