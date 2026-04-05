-- ══════════════════════════════════════════════════════════════
-- ExpertERP — Seed: 2 entreprises + 10 ressources B2B
-- À exécuter dans Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- ═══ ENTREPRISE 1: Nexia Conseil ═══
INSERT INTO entreprises (nom, secteur, contact, email, telephone, type_demande, description, statut, date_expiration)
VALUES (
  'Nexia Conseil',
  'Conseil en transformation digitale',
  'Isabelle Mercier',
  'i.mercier@nexiaconseil.ca',
  '+1 514 555 0142',
  'offrir',
  '{"plan":"pro","description":"Cabinet de conseil spécialisé en implémentation SAP et Oracle pour le secteur manufacturier et distribution au Québec. 45 consultants, 12 ans d''expérience.","resources_count":5}',
  'approuve',
  '2027-03-28'
);

-- ═══ ENTREPRISE 2: StratERP Solutions ═══
INSERT INTO entreprises (nom, secteur, contact, email, telephone, type_demande, description, statut, date_expiration)
VALUES (
  'StratERP Solutions',
  'Intégration ERP & Cloud',
  'Philippe Gauthier',
  'p.gauthier@straterp.com',
  '+1 438 555 0287',
  'offrir',
  '{"plan":"pro","description":"Firme d''intégration Dynamics 365 et Workday, spécialisée dans les migrations cloud pour les services financiers et assurances. 30 consultants, présence Montréal-Toronto.","resources_count":5}',
  'approuve',
  '2027-03-28'
);

-- ═══ RESSOURCES NEXIA CONSEIL (5 consultants SAP/Oracle) ═══

INSERT INTO consultants (prenom, nom, email, telephone, titre, competences, tjm_min, tjm_max, statut, notes_admin)
VALUES (
  'Alexandre', 'Tremblay',
  'res_nexia_001@internal.experterp.local',
  '+1 514 555 0201',
  'Consultant fonctionnel SAP',
  ARRAY['SAP', 'FI/CO', 'S/4HANA', 'Migration'],
  900, 1100,
  'approuve',
  '{"source":"import_b2b","entreprise_nom":"Nexia Conseil","entreprise_email":"i.mercier@nexiaconseil.ca","visibility":"b2b","resume":"Consultant SAP FI/CO senior avec 14 ans d''expérience en transformation financière. Certifié S/4HANA Finance, expert en migration depuis ECC. A dirigé 8 projets de migration S/4HANA dans le secteur manufacturier au Québec.","annees_exp":"14","ville":"Montreal, Quebec","mode_travail":"Hybride","langues":"Français, Anglais","secteurs":["Manufacturier","Distribution","Énergie"],"certifications":["SAP S/4HANA Finance","SAP FI/CO Associate"],"erp_modules":["FI","CO","AA","TR"]}'
);

INSERT INTO consultants (prenom, nom, email, telephone, titre, competences, tjm_min, tjm_max, statut, notes_admin)
VALUES (
  'Marie-Ève', 'Bouchard',
  'res_nexia_002@internal.experterp.local',
  '+1 514 555 0202',
  'Chef de projet Oracle',
  ARRAY['Oracle', 'ERP Cloud', 'Financials', 'SCM'],
  1000, 1200,
  'approuve',
  '{"source":"import_b2b","entreprise_nom":"Nexia Conseil","entreprise_email":"i.mercier@nexiaconseil.ca","visibility":"b2b","resume":"Chef de projet Oracle ERP Cloud avec 16 ans d''expérience. Spécialisée en déploiement Financials et Supply Chain pour les grandes entreprises manufacturières. Track record de 10 go-lives réussis.","annees_exp":"16","ville":"Montreal, Quebec","mode_travail":"Hybride","langues":"Français, Anglais, Espagnol","secteurs":["Manufacturier","Agroalimentaire","Pharmaceutique"],"certifications":["Oracle Cloud ERP Implementation Specialist","PMP"],"erp_modules":["Financials","Procurement","SCM","Projects"]}'
);

INSERT INTO consultants (prenom, nom, email, telephone, titre, competences, tjm_min, tjm_max, statut, notes_admin)
VALUES (
  'Jean-François', 'Côté',
  'res_nexia_003@internal.experterp.local',
  '+1 418 555 0203',
  'Consultant technique SAP',
  ARRAY['SAP', 'ABAP', 'Basis', 'Integration', 'BTP'],
  850, 1050,
  'approuve',
  '{"source":"import_b2b","entreprise_nom":"Nexia Conseil","entreprise_email":"i.mercier@nexiaconseil.ca","visibility":"b2b","resume":"Développeur ABAP senior et architecte technique SAP. 11 ans d''expérience en développement custom, intégrations CPI/BTP et administration Basis. Expert en performance tuning et migration technique vers S/4HANA.","annees_exp":"11","ville":"Quebec, Quebec","mode_travail":"Remote","langues":"Français, Anglais","secteurs":["Manufacturier","Services publics","Transport"],"certifications":["SAP BTP Developer","SAP Basis Administrator"],"erp_modules":["ABAP","Basis","CPI","BTP","Fiori"]}'
);

INSERT INTO consultants (prenom, nom, email, telephone, titre, competences, tjm_min, tjm_max, statut, notes_admin)
VALUES (
  'Nadia', 'El Fassi',
  'res_nexia_004@internal.experterp.local',
  '+1 514 555 0204',
  'Consultante SAP MM/SD',
  ARRAY['SAP', 'MM', 'SD', 'S/4HANA', 'Logistique'],
  800, 950,
  'approuve',
  '{"source":"import_b2b","entreprise_nom":"Nexia Conseil","entreprise_email":"i.mercier@nexiaconseil.ca","visibility":"b2b","resume":"Consultante fonctionnelle SAP MM/SD avec 9 ans d''expérience en chaîne logistique et gestion des achats. Spécialisée en optimisation des processus Procure-to-Pay et Order-to-Cash dans le secteur de la distribution.","annees_exp":"9","ville":"Laval, Quebec","mode_travail":"Hybride","langues":"Français, Anglais, Arabe","secteurs":["Distribution","Retail","Logistique"],"certifications":["SAP MM Associate","SAP SD Associate"],"erp_modules":["MM","SD","WM","LE","EWM"]}'
);

INSERT INTO consultants (prenom, nom, email, telephone, titre, competences, tjm_min, tjm_max, statut, notes_admin)
VALUES (
  'Patrick', 'Nguyen',
  'res_nexia_005@internal.experterp.local',
  '+1 514 555 0205',
  'Analyste fonctionnel Oracle HCM',
  ARRAY['Oracle', 'HCM', 'Payroll', 'Benefits', 'Cloud'],
  750, 900,
  'approuve',
  '{"source":"import_b2b","entreprise_nom":"Nexia Conseil","entreprise_email":"i.mercier@nexiaconseil.ca","visibility":"b2b","resume":"Analyste fonctionnel Oracle HCM Cloud avec 7 ans d''expérience en gestion des ressources humaines et paie. Expert en configuration Core HR, Absence Management et Payroll pour le marché canadien.","annees_exp":"7","ville":"Montreal, Quebec","mode_travail":"Hybride","langues":"Français, Anglais, Vietnamien","secteurs":["Services financiers","Assurances","Secteur public"],"certifications":["Oracle HCM Cloud Implementation Specialist"],"erp_modules":["Core HR","Payroll","Benefits","Absence Management","Recruiting"]}'
);

-- ═══ RESSOURCES STRATERP SOLUTIONS (5 consultants Dynamics/Workday) ═══

INSERT INTO consultants (prenom, nom, email, telephone, titre, competences, tjm_min, tjm_max, statut, notes_admin)
VALUES (
  'Catherine', 'Lavoie',
  'res_straterp_001@internal.experterp.local',
  '+1 438 555 0301',
  'Consultante Dynamics 365 Finance',
  ARRAY['Microsoft Dynamics', 'F&O', 'Finance', 'Power Platform'],
  900, 1100,
  'approuve',
  '{"source":"import_b2b","entreprise_nom":"StratERP Solutions","entreprise_email":"p.gauthier@straterp.com","visibility":"b2b","resume":"Consultante senior Dynamics 365 Finance & Operations avec 13 ans d''expérience. Experte en modules Finance, General Ledger et consolidation multi-entités. Certifiée Microsoft, spécialisée dans les migrations depuis AX 2012 vers D365 F&O.","annees_exp":"13","ville":"Montreal, Quebec","mode_travail":"Hybride","langues":"Français, Anglais","secteurs":["Services financiers","Assurances","Banque"],"certifications":["Microsoft Certified: Dynamics 365 Finance Functional Consultant","MB-310"],"erp_modules":["Finance","General Ledger","AP/AR","Fixed Assets","Budgeting"]}'
);

INSERT INTO consultants (prenom, nom, email, telephone, titre, competences, tjm_min, tjm_max, statut, notes_admin)
VALUES (
  'David', 'Roy',
  'res_straterp_002@internal.experterp.local',
  '+1 416 555 0302',
  'Architecte Dynamics 365 SCM',
  ARRAY['Microsoft Dynamics', 'F&O', 'Supply Chain', 'Azure', 'Power BI'],
  1000, 1250,
  'approuve',
  '{"source":"import_b2b","entreprise_nom":"StratERP Solutions","entreprise_email":"p.gauthier@straterp.com","visibility":"b2b","resume":"Architecte solutions Dynamics 365 Supply Chain Management. 15 ans d''expérience dont 8 sur Dynamics. Expert en conception d''architectures cloud Azure, intégrations Power Platform et reporting Power BI pour les opérations logistiques.","annees_exp":"15","ville":"Toronto, Ontario","mode_travail":"Hybride","langues":"Français, Anglais","secteurs":["Logistique","Manufacturier","Distribution"],"certifications":["Microsoft Certified: Dynamics 365 Supply Chain Management","Azure Solutions Architect Expert"],"erp_modules":["Supply Chain","Warehouse Management","Transportation","Production Control","Master Planning"]}'
);

INSERT INTO consultants (prenom, nom, email, telephone, titre, competences, tjm_min, tjm_max, statut, notes_admin)
VALUES (
  'Samira', 'Hassan',
  'res_straterp_003@internal.experterp.local',
  '+1 438 555 0303',
  'Consultante Workday HCM',
  ARRAY['Workday', 'HCM', 'Compensation', 'Benefits', 'Recruiting'],
  850, 1050,
  'approuve',
  '{"source":"import_b2b","entreprise_nom":"StratERP Solutions","entreprise_email":"p.gauthier@straterp.com","visibility":"b2b","resume":"Consultante Workday HCM certifiée avec 10 ans d''expérience en SIRH. Spécialisée en Compensation, Benefits et Talent Management pour les entreprises de 2000+ employés dans le secteur des services financiers.","annees_exp":"10","ville":"Montreal, Quebec","mode_travail":"Remote","langues":"Français, Anglais, Arabe","secteurs":["Services financiers","Assurances","Technologies"],"certifications":["Workday HCM Certified","Workday Compensation Certified"],"erp_modules":["HCM","Compensation","Benefits","Recruiting","Talent Management"]}'
);

INSERT INTO consultants (prenom, nom, email, telephone, titre, competences, tjm_min, tjm_max, statut, notes_admin)
VALUES (
  'Marc-André', 'Pelletier',
  'res_straterp_004@internal.experterp.local',
  '+1 438 555 0304',
  'Développeur Dynamics 365 X++',
  ARRAY['Microsoft Dynamics', 'X++', 'F&O', 'Azure DevOps', 'Power Automate'],
  800, 1000,
  'approuve',
  '{"source":"import_b2b","entreprise_nom":"StratERP Solutions","entreprise_email":"p.gauthier@straterp.com","visibility":"b2b","resume":"Développeur senior X++ et architecte technique Dynamics 365 F&O. 9 ans d''expérience en développement custom, extensions, intégrations via Data Entities et Logic Apps. Expert Azure DevOps pour CI/CD D365.","annees_exp":"9","ville":"Montreal, Quebec","mode_travail":"Hybride","langues":"Français, Anglais","secteurs":["Technologies","Manufacturier","Services financiers"],"certifications":["Microsoft Certified: Dynamics 365 Finance and Operations Apps Developer","MB-500"],"erp_modules":["X++ Development","Data Entities","Power Automate","Azure Logic Apps","SSRS Reports"]}'
);

INSERT INTO consultants (prenom, nom, email, telephone, titre, competences, tjm_min, tjm_max, statut, notes_admin)
VALUES (
  'Émilie', 'Gagnon',
  'res_straterp_005@internal.experterp.local',
  '+1 416 555 0305',
  'Chef de projet Workday Finance',
  ARRAY['Workday', 'Finance', 'Planning', 'Prism Analytics'],
  950, 1150,
  'approuve',
  '{"source":"import_b2b","entreprise_nom":"StratERP Solutions","entreprise_email":"p.gauthier@straterp.com","visibility":"b2b","resume":"Chef de projet Workday Financial Management avec 12 ans d''expérience. A piloté 6 implémentations Workday Finance de bout en bout pour des entreprises du TSX 60. Experte en Adaptive Planning et Prism Analytics.","annees_exp":"12","ville":"Toronto, Ontario","mode_travail":"Hybride","langues":"Français, Anglais","secteurs":["Services financiers","Assurances","Télécommunications"],"certifications":["Workday Financial Management Certified","Workday Adaptive Planning Certified","PMP"],"erp_modules":["Financial Management","Adaptive Planning","Prism Analytics","Expenses","Procurement"]}'
);
