/**
 * ExpertERPHub — Seed 10 profils consultants professionnels
 *
 * Usage : Ouvrir https://expert-erp.vercel.app/ dans le navigateur,
 *         ouvrir la console (F12 > Console), et coller ce script.
 *         OU ajouter temporairement <script src="seed-consultants.js"></script> dans index.html
 */
(async function () {
  'use strict';

  var SB_URL = (window.ExpertConfig && ExpertConfig.SB_URL) || 'https://aqvkcbeezzbmoiykzfyo.supabase.co';
  var SB_KEY = (window.ExpertConfig && ExpertConfig.SB_KEY) || 'sb_publishable_3ZOOWdx35IRT6UocT_s9PQ_hI0Yrbim';

  async function insertConsultant(data) {
    var resp = await fetch(SB_URL + '/rest/v1/consultants', {
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });
    return resp;
  }

  var PROFILES = [
    // ─── 1. SAP S/4HANA — Consultant Senior FI/CO & MM ───
    {
      prenom: 'Karim',
      nom: 'BENALI',
      email: 'k.benali.demo@experterphub.com',
      telephone: '+33 6 12 34 56 78',
      titre: 'Consultant Fonctionnel SAP S/4HANA | FI/CO & MM',
      competences: ['SAP', 'S/4HANA', 'FI/CO', 'MM', 'SD'],
      tjm_min: 750,
      tjm_max: 950,
      disponibilite: 'immediat',
      statut: 'approuve',
      notes_admin: JSON.stringify({
        resume: "Consultant SAP confirmé avec 12 ans d'expérience dans la transformation digitale des processus financiers et logistiques. Expert certifié S/4HANA Finance, reconnu pour sa capacité à piloter des projets de migration complexes dans des environnements multi-sociétés internationaux. Maîtrise approfondie des modules FI/CO, MM et SD avec une forte appétence pour l'optimisation des flux de bout en bout. Intervenu auprès de grands groupes du CAC 40 dans les secteurs industriel, pharmaceutique et retail.",
        annees_exp: '12',
        ville: 'Paris',
        mode_travail: 'hybride',
        langues: 'Français, Anglais, Arabe',
        secteurs: ['Industrie', 'Pharma', 'Retail'],
        certifications: ['SAP Certified Application Associate - S/4HANA Finance', 'SAP Certified Application Associate - MM', 'PRINCE2 Practitioner'],
        erp_modules: ['FI/CO', 'MM', 'SD', 'S/4HANA'],
        photo_url: '',
        linkedin: '',
        experiences: [
          {
            titre: 'Consultant Senior SAP FI/CO',
            entreprise: 'Capgemini',
            periode: '2020 - 2024',
            secteur: 'Industrie & Pharma',
            description: "Pilotage de la migration S/4HANA pour un groupe pharmaceutique international (45 000 collaborateurs, 12 entités). Refonte complète des processus comptables FI/CO, paramétrage de la comptabilité analytique multi-axes, déploiement du reporting IFRS temps réel. Coordination d'une équipe de 8 consultants. Réduction de 40% du délai de clôture mensuelle."
          },
          {
            titre: 'Consultant SAP MM/SD',
            entreprise: 'Accenture',
            periode: '2016 - 2020',
            secteur: 'Retail & Grande Distribution',
            description: "Déploiement SAP MM/SD pour une enseigne de grande distribution (200+ points de vente). Conception et paramétrage des flux achats-approvisionnement, gestion des contrats fournisseurs, intégration EDI. Mise en place du processus Order-to-Cash et optimisation de la chaîne logistique. Go-live réussi en 14 mois avec zéro incident critique."
          },
          {
            titre: 'Consultant Junior SAP FI',
            entreprise: 'Atos',
            periode: '2012 - 2016',
            secteur: 'Énergie',
            description: "Paramétrage et support des modules FI pour un acteur majeur de l'énergie. Gestion de la comptabilité générale, auxiliaire (clients/fournisseurs), et des immobilisations. Rédaction des spécifications fonctionnelles, cahiers de recette et documentation utilisateur. Formation de 120 key users sur 3 sites."
          }
        ]
      })
    },

    // ─── 2. Oracle ERP Cloud — Chef de Projet ───
    {
      prenom: 'Sophie',
      nom: 'MARTIN',
      email: 's.martin.demo@experterphub.com',
      telephone: '+33 6 23 45 67 89',
      titre: 'Chef de Projet Oracle ERP Cloud | Financials & HCM',
      competences: ['Oracle', 'ERP Cloud', 'Financials', 'HCM', 'Fusion'],
      tjm_min: 850,
      tjm_max: 1100,
      disponibilite: 'sous_30j',
      statut: 'approuve',
      notes_admin: JSON.stringify({
        resume: "Chef de projet ERP Senior avec 15 ans d'expérience dont 8 ans sur l'écosystème Oracle Cloud. Spécialisée dans le pilotage de programmes de transformation digitale impliquant Oracle ERP Cloud (Financials, Procurement, HCM). Track record de 6 déploiements réussis dans des contextes internationaux complexes. Certifiée Oracle Cloud, PMP et SAFe, elle allie expertise technique et leadership pour garantir des go-live dans les délais et budgets impartis.",
        annees_exp: '15',
        ville: 'Lyon',
        mode_travail: 'hybride',
        langues: 'Français, Anglais, Espagnol',
        secteurs: ['Services Financiers', 'Assurance', 'Télécoms'],
        certifications: ['Oracle Cloud ERP Certified Implementation Specialist', 'PMP - Project Management Professional', 'SAFe 5.0 Agilist'],
        erp_modules: ['Financials', 'HCM', 'Procurement', 'Fusion'],
        photo_url: '',
        linkedin: '',
        experiences: [
          {
            titre: 'Directrice de Programme Oracle Cloud',
            entreprise: 'Deloitte',
            periode: '2021 - 2024',
            secteur: 'Services Financiers',
            description: "Direction d'un programme de transformation Oracle ERP Cloud pour une banque européenne (8 000 collaborateurs, 5 pays). Périmètre : Financials, Procurement et HCM. Gestion d'un budget de 4.2M€ et coordination de 25 consultants répartis sur 3 fuseaux horaires. Livraison en 18 mois avec adoption utilisateur de 94%."
          },
          {
            titre: 'Chef de Projet Oracle Fusion',
            entreprise: 'EY',
            periode: '2017 - 2021',
            secteur: 'Assurance',
            description: "Pilotage du déploiement Oracle Fusion Financials & Procurement pour un groupe d'assurance (3 entités, 2 500 collaborateurs). Cadrage, conception, paramétrage, recette et accompagnement au changement. Migration de 5 ans de données historiques depuis Oracle E-Business Suite. Réduction de 60% des processus manuels de réconciliation comptable."
          },
          {
            titre: 'Consultante Senior Oracle EBS',
            entreprise: 'CGI',
            periode: '2012 - 2017',
            secteur: 'Télécoms',
            description: "Expertise fonctionnelle sur Oracle E-Business Suite pour un opérateur télécom national. Paramétrage des modules GL, AP, AR, FA et Cash Management. Support N3 et évolutions fonctionnelles. Animation de comités de suivi et rédaction de la roadmap applicative annuelle."
          }
        ]
      })
    },

    // ─── 3. Microsoft Dynamics 365 — Consultant Technique ───
    {
      prenom: 'Thomas',
      nom: 'DURAND',
      email: 't.durand.demo@experterphub.com',
      telephone: '+33 6 34 56 78 90',
      titre: 'Consultant Technique Dynamics 365 F&O | Azure & Power Platform',
      competences: ['Dynamics 365', 'F&O', 'Business Central', 'Power Platform', 'Azure'],
      tjm_min: 700,
      tjm_max: 900,
      disponibilite: 'immediat',
      statut: 'approuve',
      notes_admin: JSON.stringify({
        resume: "Consultant technique Microsoft Dynamics 365 avec 9 ans d'expérience spécialisé dans les environnements Finance & Operations et Business Central. Expert en développement X++, intégrations Azure (Logic Apps, Data Factory, Service Bus) et automatisation Power Platform. Reconnu pour sa capacité à concevoir des architectures robustes et scalables, et à résoudre des problématiques techniques complexes dans des délais serrés.",
        annees_exp: '9',
        ville: 'Nantes',
        mode_travail: 'remote',
        langues: 'Français, Anglais',
        secteurs: ['Industrie Manufacturière', 'Distribution', 'Logistique'],
        certifications: ['Microsoft Certified: Dynamics 365 Finance Functional Consultant', 'Microsoft Certified: Azure Developer Associate', 'Microsoft Certified: Power Platform Developer'],
        erp_modules: ['Finance', 'Supply Chain', 'Business Central', 'Power Platform'],
        photo_url: '',
        linkedin: '',
        experiences: [
          {
            titre: 'Consultant Technique D365 F&O Senior',
            entreprise: 'Avanade',
            periode: '2021 - 2024',
            secteur: 'Industrie Manufacturière',
            description: "Architecture et développement de solutions sur Dynamics 365 Finance & Operations pour un groupe industriel (15 usines, 6 pays). Développement de modules X++ custom pour la gestion de production, intégration MES via Azure Service Bus, et mise en place de pipelines CI/CD avec Azure DevOps."
          },
          {
            titre: 'Développeur Dynamics 365 Business Central',
            entreprise: 'Prodware',
            periode: '2018 - 2021',
            secteur: 'Distribution',
            description: "Développement d'extensions AL pour Dynamics 365 Business Central dans le secteur de la distribution. Création d'un module de gestion des entrepôts multi-sites, intégration avec les plateformes e-commerce (Shopify, PrestaShop) via API REST, et automatisation des flux avec Power Automate."
          },
          {
            titre: 'Consultant Dynamics AX',
            entreprise: 'Hitachi Solutions',
            periode: '2015 - 2018',
            secteur: 'Logistique',
            description: "Paramétrage et développement sur Dynamics AX 2012 R3 pour des entreprises de logistique et transport. Modules Gestion des stocks, Transport Management et Production. Développement d'interfaces EDI pour l'échange automatisé de documents avec les partenaires commerciaux."
          }
        ]
      })
    },

    // ─── 4. Workday — Consultante HCM & Payroll ───
    {
      prenom: 'Amira',
      nom: 'CHAKROUN',
      email: 'a.chakroun.demo@experterphub.com',
      telephone: '+33 6 45 67 89 01',
      titre: 'Consultante Workday HCM & Payroll | Transformation RH',
      competences: ['Workday', 'HCM', 'Payroll', 'Recruiting', 'Prism Analytics'],
      tjm_min: 800,
      tjm_max: 1000,
      disponibilite: 'immediat',
      statut: 'approuve',
      notes_admin: JSON.stringify({
        resume: "Consultante Workday Senior avec 10 ans d'expérience en transformation des processus RH. Expertise approfondie sur les modules HCM, Payroll, Recruiting et Prism Analytics. Spécialiste reconnue du déploiement Workday en France avec une maîtrise parfaite des spécificités réglementaires françaises (DSN, convention collective, médecine du travail). A accompagné plus de 20 entreprises dans leur transition vers Workday.",
        annees_exp: '10',
        ville: 'Paris',
        mode_travail: 'hybride',
        langues: 'Français, Anglais, Arabe',
        secteurs: ['Luxe', 'Services Professionnels', 'Tech'],
        certifications: ['Workday Pro Certified - HCM', 'Workday Pro Certified - Payroll', 'Workday Pro Certified - Recruiting'],
        erp_modules: ['HCM', 'Payroll', 'Recruiting', 'Prism Analytics'],
        photo_url: '',
        linkedin: '',
        experiences: [
          {
            titre: 'Lead Consultante Workday HCM',
            entreprise: 'Mercer',
            periode: '2020 - 2024',
            secteur: 'Luxe',
            description: "Pilotage fonctionnel du déploiement Workday HCM & Payroll pour une maison de luxe française (12 000 collaborateurs, 30 pays). Cadrage des processus Core HR, Compensation, Absence Management et Payroll France. Configuration de 45 business processes, 200+ rapports custom et intégration avec les systèmes de paie locaux."
          },
          {
            titre: 'Consultante Workday Recruiting & Talent',
            entreprise: 'Accenture',
            periode: '2017 - 2020',
            secteur: 'Services Professionnels',
            description: "Déploiement des modules Workday Recruiting, Talent Management et Learning pour un cabinet de conseil international (5 000 consultants). Conception des workflows de recrutement, paramétrage des évaluations de performance 360° et mise en place des plans de succession."
          },
          {
            titre: 'Analyste SIRH / Workday Junior',
            entreprise: 'PwC',
            periode: '2014 - 2017',
            secteur: 'Tech',
            description: "Support fonctionnel Workday HCM pour un éditeur logiciel en hyper-croissance. Gestion des évolutions fonctionnelles, mises à jour semestrielles Workday, et support utilisateur N2/N3. Administration des security groups, des custom reports et des calculated fields."
          }
        ]
      })
    },

    // ─── 5. Salesforce — Architecte Solution ───
    {
      prenom: 'Nicolas',
      nom: 'LEROUX',
      email: 'n.leroux.demo@experterphub.com',
      telephone: '+33 6 56 78 90 12',
      titre: 'Architecte Solution Salesforce | CRM & Revenue Cloud',
      competences: ['Salesforce', 'Sales Cloud', 'Service Cloud', 'Revenue Cloud', 'MuleSoft'],
      tjm_min: 900,
      tjm_max: 1200,
      disponibilite: 'sous_30j',
      statut: 'approuve',
      notes_admin: JSON.stringify({
        resume: "Architecte Solution Salesforce avec 13 ans d'expérience, dont 9 ans dédiés à l'écosystème Salesforce. Triple certifié (Application Architect, System Architect, MuleSoft Integration Architect), il intervient sur les projets de transformation CRM les plus ambitieux. Expert en conception d'architectures multi-cloud Salesforce, intégrations complexes via MuleSoft et déploiement de Revenue Cloud pour l'optimisation des cycles de vente.",
        annees_exp: '13',
        ville: 'Paris',
        mode_travail: 'hybride',
        langues: 'Français, Anglais',
        secteurs: ['Tech', 'Média', 'Services B2B'],
        certifications: ['Salesforce Certified Application Architect', 'Salesforce Certified System Architect', 'MuleSoft Certified Integration Architect'],
        erp_modules: ['Sales Cloud', 'Service Cloud', 'Revenue Cloud', 'MuleSoft', 'CPQ'],
        photo_url: '',
        linkedin: '',
        experiences: [
          {
            titre: 'Architecte Solution Salesforce',
            entreprise: 'Salesforce (Professional Services)',
            periode: '2021 - 2024',
            secteur: 'Tech & Média',
            description: "Architecture et supervision technique pour les clients stratégiques Salesforce en France. Conception d'une plateforme CRM unifiée pour un groupe média (Sales Cloud, Service Cloud, Marketing Cloud, 4 000 utilisateurs). Intégration MuleSoft avec 12 systèmes legacy. Réduction de 35% du cycle de vente moyen."
          },
          {
            titre: 'Lead Technique Salesforce / CPQ',
            entreprise: 'Capgemini',
            periode: '2017 - 2021',
            secteur: 'Services B2B',
            description: "Direction technique du déploiement Salesforce CPQ & Revenue Cloud pour un éditeur logiciel SaaS (ARR 200M€). Modélisation de 500+ produits et bundles, configuration des règles de pricing dynamique et des workflows d'approbation. Développement Apex/LWC pour les composants custom."
          },
          {
            titre: 'Consultant Salesforce Senior',
            entreprise: 'Accenture',
            periode: '2014 - 2017',
            secteur: 'Banque & Assurance',
            description: "Déploiement Sales Cloud et Service Cloud pour des acteurs bancaires et assurantiels. Paramétrage des processus de vente, automatisation des workflows avec Process Builder/Flow, et mise en place de Salesforce Knowledge pour le support client."
          }
        ]
      })
    },

    // ─── 6. ServiceNow — Consultant ITSM & ITOM ───
    {
      prenom: 'Youssef',
      nom: 'EL AMRANI',
      email: 'y.elamrani.demo@experterphub.com',
      telephone: '+33 6 67 89 01 23',
      titre: 'Consultant ServiceNow ITSM & ITOM | Certified System Administrator',
      competences: ['ServiceNow', 'ITSM', 'ITOM', 'CMDB', 'SecOps'],
      tjm_min: 700,
      tjm_max: 850,
      disponibilite: 'immediat',
      statut: 'approuve',
      notes_admin: JSON.stringify({
        resume: "Consultant ServiceNow expérimenté avec 8 ans de pratique sur la plateforme. Spécialiste ITSM, ITOM et CMDB, il accompagne les DSI dans la modernisation de leurs processus IT et la mise en conformité ITIL 4. Certifié CSA et CIS-ITSM, reconnu pour sa capacité à traduire les exigences métier en solutions ServiceNow performantes. Expertise complémentaire en SecOps et GRC pour les organisations soumises à des contraintes réglementaires fortes.",
        annees_exp: '8',
        ville: 'Toulouse',
        mode_travail: 'remote',
        langues: 'Français, Anglais, Arabe',
        secteurs: ['Aéronautique', 'Défense', 'Banque'],
        certifications: ['ServiceNow Certified System Administrator (CSA)', 'ServiceNow CIS - IT Service Management', 'ITIL 4 Foundation'],
        erp_modules: ['ITSM', 'ITOM', 'CMDB', 'SecOps', 'GRC'],
        photo_url: '',
        linkedin: '',
        experiences: [
          {
            titre: 'Consultant Senior ServiceNow',
            entreprise: 'Devoteam',
            periode: '2021 - 2024',
            secteur: 'Aéronautique & Défense',
            description: "Déploiement et évolution de ServiceNow ITSM/ITOM pour un constructeur aéronautique européen (80 000 collaborateurs). Refonte complète du catalogue de services (350+ items), mise en place de l'Event Management et du Discovery pour le monitoring proactif de 15 000 assets. Réduction de 55% du MTTR sur les incidents critiques."
          },
          {
            titre: 'Consultant ServiceNow ITSM',
            entreprise: 'Sopra Steria',
            periode: '2018 - 2021',
            secteur: 'Banque',
            description: "Implémentation ServiceNow ITSM pour une banque de détail (12 000 utilisateurs). Paramétrage des modules Incident, Problem, Change et Knowledge Management selon les bonnes pratiques ITIL. Développement de portails self-service avec Service Portal."
          },
          {
            titre: 'Administrateur ServiceNow Junior',
            entreprise: 'Econocom',
            periode: '2016 - 2018',
            secteur: 'Services IT',
            description: "Administration quotidienne de la plateforme ServiceNow pour un infogérant multi-clients. Gestion des utilisateurs, rôles et groupes. Création de rapports et dashboards pour le pilotage des SLA. Développement de business rules, UI policies et scheduled jobs."
          }
        ]
      })
    },

    // ─── 7. Oracle NetSuite — Consultante Financial Management ───
    {
      prenom: 'Claire',
      nom: 'DUPONT',
      email: 'c.dupont.demo@experterphub.com',
      telephone: '+33 6 78 90 12 34',
      titre: 'Consultante Oracle NetSuite | Financial Management & SuiteCommerce',
      competences: ['NetSuite', 'SuiteScript', 'SuiteCommerce', 'Financial Management', 'SuiteAnalytics'],
      tjm_min: 650,
      tjm_max: 850,
      disponibilite: 'immediat',
      statut: 'approuve',
      notes_admin: JSON.stringify({
        resume: "Consultante NetSuite certifiée avec 7 ans d'expérience dédiés à l'écosystème Oracle NetSuite. Expertise fonctionnelle et technique couvrant Financial Management, Order Management, Inventory et SuiteCommerce. Développeuse SuiteScript 2.0 confirmée, elle conçoit des solutions sur mesure pour les ETI en croissance rapide. Spécialisée dans les déploiements multi-subsidiaires avec consolidation financière et gestion multi-devises.",
        annees_exp: '7',
        ville: 'Bordeaux',
        mode_travail: 'remote',
        langues: 'Français, Anglais, Portugais',
        secteurs: ['E-commerce', 'SaaS', 'Mode & Textile'],
        certifications: ['Oracle NetSuite ERP Consultant Certified', 'Oracle NetSuite SuiteFoundation Certified', 'SuiteScript 2.0 Developer'],
        erp_modules: ['Financial Management', 'Order Management', 'Inventory', 'SuiteCommerce', 'SuiteAnalytics'],
        photo_url: '',
        linkedin: '',
        experiences: [
          {
            titre: 'Lead Consultante NetSuite',
            entreprise: 'RSM',
            periode: '2021 - 2024',
            secteur: 'E-commerce & SaaS',
            description: "Direction fonctionnelle des projets NetSuite pour des scale-ups e-commerce et SaaS. Déploiement OneWorld pour une DNVB (8 filiales, 4 devises) : Financial Management, Advanced Revenue Management et SuiteCommerce Advanced. Développement SuiteScript de connecteurs temps réel avec Shopify, Stripe et les 3PL."
          },
          {
            titre: 'Consultante NetSuite Financials',
            entreprise: 'Deloitte',
            periode: '2019 - 2021',
            secteur: 'Mode & Textile',
            description: "Implémentation NetSuite Financial Management pour un groupe textile français (6 marques, 150 boutiques). Paramétrage de la comptabilité multi-sociétés, des intercos automatisées et du reporting de gestion. Mise en place de Saved Searches avancées et de SuiteAnalytics Workbooks."
          },
          {
            titre: 'Consultante Junior NetSuite',
            entreprise: 'BDO',
            periode: '2017 - 2019',
            secteur: 'PME en croissance',
            description: "Déploiement NetSuite pour des PME en phase de structuration. Paramétrage des modules comptables et commerciaux, migration des données depuis Sage/QuickBooks, formation des utilisateurs. Développement de scripts SuiteScript pour l'automatisation de la facturation récurrente."
          }
        ]
      })
    },

    // ─── 8. SAP SuccessFactors — Consultante Employee Central ───
    {
      prenom: 'Fatima',
      nom: 'ZAHRA',
      email: 'f.zahra.demo@experterphub.com',
      telephone: '+33 6 89 01 23 45',
      titre: 'Consultante SAP SuccessFactors | Employee Central & Talent Management',
      competences: ['SuccessFactors', 'Employee Central', 'Performance & Goals', 'Recruiting', 'SAP HCM'],
      tjm_min: 750,
      tjm_max: 950,
      disponibilite: 'sous_30j',
      statut: 'approuve',
      notes_admin: JSON.stringify({
        resume: "Consultante SAP SuccessFactors avec 11 ans d'expérience en SIRH et transformation RH digitale. Experte certifiée Employee Central, Performance & Goals et Recruiting, elle a piloté plus de 12 implémentations SuccessFactors pour des entreprises de 500 à 50 000 collaborateurs. Forte connaissance des enjeux RH métier combinée à une expertise technique sur les intégrations SAP HCM / SuccessFactors via CPI.",
        annees_exp: '11',
        ville: 'Paris',
        mode_travail: 'hybride',
        langues: 'Français, Anglais, Arabe',
        secteurs: ['Énergie', 'Banque', 'Industrie'],
        certifications: ['SAP Certified Application Associate - Employee Central', 'SAP Certified Application Associate - Performance and Goal Management', 'SAP Certified Application Associate - Recruiting'],
        erp_modules: ['Employee Central', 'Performance & Goals', 'Recruiting', 'Succession', 'Compensation'],
        photo_url: '',
        linkedin: '',
        experiences: [
          {
            titre: 'Lead Consultante SuccessFactors',
            entreprise: 'IBM',
            periode: '2020 - 2024',
            secteur: 'Énergie',
            description: "Pilotage du programme de déploiement SuccessFactors pour un groupe énergétique (50 000 collaborateurs, 25 pays). Périmètre complet : Employee Central, Performance & Goals, Compensation, Succession et Recruiting. Migration depuis SAP HCM on-premise avec intégration CPI bidirectionnelle. Taux d'adoption de 91% à 6 mois post go-live."
          },
          {
            titre: 'Consultante SuccessFactors Talent',
            entreprise: 'NTT Data',
            periode: '2017 - 2020',
            secteur: 'Banque',
            description: "Déploiement des modules Talent Management (Performance, Goals, Succession, Development) pour une banque d'investissement. Configuration des formulaires d'évaluation 360°, des calibration sessions et des talent pools. Formation de 200 managers et 15 HR admins."
          },
          {
            titre: 'Consultante Junior SAP HCM / SF',
            entreprise: 'Sopra Steria',
            periode: '2013 - 2017',
            secteur: 'Industrie',
            description: "Support et évolutions SAP HCM (PA, OM, Payroll France) puis montée en compétence progressive sur SuccessFactors Employee Central. Migration des données maîtres RH, configuration des workflows et custom MDF objects. Participation à 4 projets de rollout multi-pays."
          }
        ]
      })
    },

    // ─── 9. Infor M3 — Consultant Supply Chain & Manufacturing ───
    {
      prenom: 'Marc',
      nom: 'LEFEBVRE',
      email: 'm.lefebvre.demo@experterphub.com',
      telephone: '+33 6 90 12 34 56',
      titre: 'Consultant Infor M3 | Supply Chain & Manufacturing',
      competences: ['Infor', 'M3', 'CloudSuite', 'Supply Chain', 'Manufacturing'],
      tjm_min: 700,
      tjm_max: 900,
      disponibilite: 'immediat',
      statut: 'approuve',
      notes_admin: JSON.stringify({
        resume: "Consultant Infor M3 avec 10 ans d'expérience spécialisé dans les environnements industriels et supply chain. Expert des modules M3 Manufacturing, Supply Chain Planning et Finance, il accompagne les industriels dans l'optimisation de leurs flux de production et logistiques. Reconnu pour sa double compétence fonctionnelle et technique (M3 APIs, Infor OS, ION), il intervient sur l'ensemble du cycle projet.",
        annees_exp: '10',
        ville: 'Lille',
        mode_travail: 'hybride',
        langues: 'Français, Anglais, Néerlandais',
        secteurs: ['Agroalimentaire', 'Chimie', 'Industrie Manufacturière'],
        certifications: ['Infor M3 Certified Consultant', 'Infor CloudSuite Industrial Certified', 'APICS CPIM'],
        erp_modules: ['M3', 'CloudSuite Industrial', 'Supply Chain Planning', 'Manufacturing', 'Finance'],
        photo_url: '',
        linkedin: '',
        experiences: [
          {
            titre: 'Consultant Senior Infor M3',
            entreprise: 'Ciber (One)',
            periode: '2020 - 2024',
            secteur: 'Agroalimentaire',
            description: "Déploiement d'Infor M3 CloudSuite Food & Beverage pour un groupe agroalimentaire (6 usines, 3 000 collaborateurs). Configuration complète des modules MMS, PMS, SLS et PPS. Mise en place de la traçabilité lot avec gestion des dates de péremption et des allergènes. Réduction de 25% des ruptures de stock."
          },
          {
            titre: 'Consultant Infor M3 Finance & Supply Chain',
            entreprise: 'Columbus',
            periode: '2017 - 2020',
            secteur: 'Chimie',
            description: "Implémentation M3 pour un fabricant de produits chimiques spécialisés (multi-sites, normes REACH). Paramétrage Finance (GL, AP, AR), gestion des stocks de matières dangereuses et planification de la production par formule. Développement d'interfaces avec les systèmes LIMS."
          },
          {
            titre: 'Consultant Junior Infor M3',
            entreprise: 'Lawson (Infor)',
            periode: '2014 - 2017',
            secteur: 'Industrie Manufacturière',
            description: "Paramétrage et support des modules M3 pour des PMI manufacturières. Gestion des ordres de fabrication, des gammes et nomenclatures, et du MRP. Formation des utilisateurs clés et rédaction de la documentation fonctionnelle."
          }
        ]
      })
    },

    // ─── 10. Odoo — Consultante Full Stack Python ───
    {
      prenom: 'Léa',
      nom: 'ROUSSEAU',
      email: 'l.rousseau.demo@experterphub.com',
      telephone: '+33 6 01 23 45 67',
      titre: 'Consultante Odoo ERP | Full Stack Python & Intégration',
      competences: ['Odoo', 'Python', 'CRM', 'Comptabilité', 'E-commerce'],
      tjm_min: 550,
      tjm_max: 750,
      disponibilite: 'immediat',
      statut: 'approuve',
      notes_admin: JSON.stringify({
        resume: "Consultante et développeuse Odoo polyvalente avec 6 ans d'expérience sur les versions 14 à 17. Maîtrise complète de l'écosystème Odoo : fonctionnel (CRM, Ventes, Achats, Stock, Comptabilité, MRP, Website) et technique (développement Python, OWL, API REST/XML-RPC). Spécialisée dans les déploiements pour PME et ETI, elle conçoit des solutions sur mesure alliant performance et simplicité d'utilisation.",
        annees_exp: '6',
        ville: 'Montpellier',
        mode_travail: 'remote',
        langues: 'Français, Anglais',
        secteurs: ['E-commerce', 'Retail', 'Services'],
        certifications: ['Odoo Certified Functional Consultant', 'Odoo Certified Developer'],
        erp_modules: ['CRM', 'Ventes', 'Achats', 'Stock', 'Comptabilité', 'MRP', 'Website'],
        photo_url: '',
        linkedin: '',
        experiences: [
          {
            titre: 'Lead Consultante Odoo',
            entreprise: 'Camptocamp',
            periode: '2022 - 2024',
            secteur: 'E-commerce & Retail',
            description: "Direction fonctionnelle et technique des projets Odoo 16/17 pour des clients e-commerce et retail. Déploiement complet (CRM, Ventes, Stock, Comptabilité, Website, E-commerce) pour un retailer omnicanal (25 boutiques + site web). Développement de connecteurs Odoo vers Amazon, Cdiscount et Mirakl."
          },
          {
            titre: 'Développeuse Odoo Senior',
            entreprise: 'Akretion',
            periode: '2020 - 2022',
            secteur: 'Services',
            description: "Développement de modules Odoo custom pour des entreprises de services (gestion de projets, facturation au temps passé, abonnements). Backend Python avec tests unitaires, frontend OWL pour les interfaces utilisateur. Intégration Stripe pour le paiement en ligne, connecteur GoCardless pour les prélèvements SEPA."
          },
          {
            titre: 'Consultante Odoo Junior',
            entreprise: 'Smile',
            periode: '2018 - 2020',
            secteur: 'PME multi-secteurs',
            description: "Déploiement d'Odoo 12/14 pour des PME de 10 à 100 employés. Paramétrage des modules standard, migration des données depuis Excel/Sage/EBP, formation des utilisateurs et support post go-live. Gestion de 5 à 8 projets simultanés."
          }
        ]
      })
    }
  ];

  console.log('%c=== ExpertERPHub — Insertion de 10 profils consultants ===', 'color:#00288e;font-weight:bold;font-size:14px;');
  var success = 0;
  var errors = 0;

  for (var i = 0; i < PROFILES.length; i++) {
    var p = PROFILES[i];
    try {
      var resp = await insertConsultant(p);
      if (resp.ok || resp.status === 201) {
        success++;
        console.log('%c✓ ' + (i + 1) + '/10 — ' + p.prenom + ' ' + p.nom + ' (' + p.competences[0] + ')', 'color:green;font-weight:bold;');
      } else {
        var errBody = await resp.text();
        errors++;
        console.log('%c✗ ' + (i + 1) + '/10 — ' + p.prenom + ' ' + p.nom + ' — HTTP ' + resp.status + ': ' + errBody, 'color:red;font-weight:bold;');
      }
    } catch (err) {
      errors++;
      console.log('%c✗ ' + (i + 1) + '/10 — ' + p.prenom + ' ' + p.nom + ' — Erreur: ' + err.message, 'color:red;font-weight:bold;');
    }
  }

  console.log('%c=== Résultat: ' + success + ' insérés, ' + errors + ' erreurs ===', 'color:#00288e;font-weight:bold;font-size:14px;');
  if (success > 0) {
    console.log('%c→ Rafraîchis la page pour voir les profils !', 'color:#00288e;font-style:italic;');
  }
})();
