/**
 * ExpertERP — Client-side content translator FR↔EN
 * Translates dynamic profile content (resume, experiences, projects, certifications)
 * Uses a comprehensive dictionary + regex patterns for ERP consulting domain.
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════
     DICTIONARY: phrase-level FR → EN
  ══════════════════════════════════════ */
  const PHRASES = [
    // ── Roles & Titles ──
    ['Consultant fonctionnel', 'Functional Consultant'],
    ['Consultant technique', 'Technical Consultant'],
    ['Chef de projet', 'Project Manager'],
    ['Directeur de projet', 'Project Director'],
    ['Architecte solution', 'Solution Architect'],
    ['Architecte technique', 'Technical Architect'],
    ['Responsable applicatif', 'Application Manager'],
    ['Analyste fonctionnel', 'Functional Analyst'],
    ['Analyste technique', 'Technical Analyst'],
    ['Développeur', 'Developer'],
    ['Intégrateur', 'Integrator'],
    ['Formateur', 'Trainer'],
    ['Lead technique', 'Technical Lead'],
    ['Lead fonctionnel', 'Functional Lead'],
    ['Consultant senior', 'Senior Consultant'],
    ['Consultant junior', 'Junior Consultant'],
    ['Consultant confirmé', 'Experienced Consultant'],
    ['Expert ERP', 'ERP Expert'],

    // ── Experience descriptions ──
    ['ans d\'expérience', 'years of experience'],
    ['ans d\'exp\\.', 'years of exp.'],
    ['d\'expérience dans', 'of experience in'],
    ['Spécialisé en', 'Specialized in'],
    ['Spécialisée en', 'Specialized in'],
    ['Spécialisation en', 'Specialization in'],
    ['Spécialisé dans', 'Specialized in'],
    ['Spécialisé modules', 'Specialized in modules'],
    ['Certifié', 'Certified'],
    ['Certifiée', 'Certified'],
    ['Intervenu sur', 'Worked on'],
    ['Intervenue sur', 'Worked on'],
    ['interventions sur', 'assignments on'],
    ['Approche orientée résultats', 'Results-oriented approach'],
    ['avec une forte capacité', 'with a strong ability'],
    ['piloter des équipes', 'lead teams'],
    ['pilotage d\'équipes', 'team management'],
    ['équipes fonctionnelles', 'functional teams'],
    ['équipes techniques', 'technical teams'],
    ['transformation digitale', 'digital transformation'],
    ['transformation numérique', 'digital transformation'],
    ['mise en œuvre', 'implementation'],
    ['mise en oeuvre', 'implementation'],
    ['déploiement', 'deployment'],
    ['déploiements', 'deployments'],
    ['déploiement multi-pays', 'multi-country deployment'],
    ['rollout multi-pays', 'multi-country rollout'],
    ['programmes de déploiement', 'deployment programs'],
    ['projets de transformation', 'transformation projects'],
    ['projets de migration', 'migration projects'],
    ['migration vers', 'migration to'],
    ['implémentation', 'implementation'],
    ['paramétrage', 'configuration'],
    ['configuration et paramétrage', 'setup and configuration'],
    ['optimisation des processus', 'process optimization'],
    ['optimisation', 'optimization'],
    ['amélioration continue', 'continuous improvement'],
    ['gestion de projet', 'project management'],
    ['gestion du changement', 'change management'],
    ['conduite du changement', 'change management'],
    ['recueil des besoins', 'requirements gathering'],
    ['analyse des besoins', 'requirements analysis'],
    ['rédaction des spécifications', 'specifications writing'],
    ['spécifications fonctionnelles', 'functional specifications'],
    ['spécifications techniques', 'technical specifications'],
    ['cahier des charges', 'specifications document'],
    ['tests unitaires', 'unit testing'],
    ['tests d\'intégration', 'integration testing'],
    ['tests de recette', 'acceptance testing'],
    ['recette utilisateur', 'user acceptance testing'],
    ['formation des utilisateurs', 'user training'],
    ['formation des équipes', 'team training'],
    ['formation et accompagnement', 'training and support'],
    ['accompagnement au démarrage', 'go-live support'],
    ['support post-démarrage', 'post go-live support'],
    ['support et maintenance', 'support and maintenance'],
    ['mise en production', 'go-live'],
    ['montée en charge', 'scaling up'],

    // ── SAP specific ──
    ['comptabilité, analytique et contrôle de gestion', 'accounting, analytics and management control'],
    ['comptabilité et finance', 'accounting and finance'],
    ['comptabilité générale', 'general accounting'],
    ['contrôle de gestion', 'management control'],
    ['gestion des achats', 'procurement management'],
    ['gestion des stocks', 'inventory management'],
    ['gestion de la chaîne logistique', 'supply chain management'],
    ['chaîne logistique', 'supply chain'],
    ['gestion des ventes', 'sales management'],
    ['gestion des ressources humaines', 'human resources management'],
    ['ressources humaines', 'human resources'],
    ['gestion de la production', 'production management'],
    ['gestion d\'entrepôt', 'warehouse management'],
    ['gestion des entrepôts', 'warehouse management'],
    ['logistique', 'logistics'],
    ['approvisionnement', 'procurement'],
    ['facturation', 'billing'],
    ['trésorerie', 'treasury'],
    ['consolidation', 'consolidation'],
    ['reporting financier', 'financial reporting'],
    ['clôture comptable', 'accounting closing'],
    ['clôtures mensuelles', 'monthly closings'],
    ['immobilisations', 'fixed assets'],

    // ── Sectors ──
    ['Finance / Industrie', 'Finance / Industry'],
    ['Finance', 'Finance'],
    ['Industrie', 'Industry'],
    ['Industrie manufacturière', 'Manufacturing'],
    ['Banque', 'Banking'],
    ['Banque et assurance', 'Banking and insurance'],
    ['Assurance', 'Insurance'],
    ['Distribution', 'Retail'],
    ['Grande distribution', 'Retail'],
    ['Énergie', 'Energy'],
    ['Energie', 'Energy'],
    ['Télécommunications', 'Telecommunications'],
    ['Telecoms', 'Telecom'],
    ['Pharmaceutique', 'Pharmaceutical'],
    ['Agroalimentaire', 'Food & Beverage'],
    ['Automobile', 'Automotive'],
    ['Aéronautique', 'Aerospace'],
    ['Transport', 'Transportation'],
    ['Logistique et transport', 'Logistics and transportation'],
    ['Services publics', 'Public services'],
    ['Secteur public', 'Public sector'],
    ['Luxe', 'Luxury'],
    ['Santé', 'Healthcare'],
    ['Immobilier', 'Real estate'],
    ['Construction', 'Construction'],
    ['Mines et métallurgie', 'Mining and metallurgy'],
    ['Technologies', 'Technology'],
    ['Non précisé', 'Not specified'],

    // ── Common professional phrases ──
    ['Entreprise confidentielle', 'Confidential company'],
    ['Période non précisée', 'Period not specified'],
    ['Expérience ERP', 'ERP Experience'],
    ['Expérience professionnelle', 'Professional experience'],
    ['Mission ERP', 'ERP Mission'],
    ['Tarif sur demande', 'Rate on request'],
    ['des grands groupes', 'large corporations'],
    ['grands comptes', 'large accounts'],
    ['groupes du CAC 40', 'CAC 40 companies'],
    ['entreprises du CAC 40', 'CAC 40 companies'],
    ['des entreprises du', 'companies in the'],
    ['environnement international', 'international environment'],
    ['contexte international', 'international context'],
    ['contexte multi-pays', 'multi-country context'],
    ['environnement multi-sites', 'multi-site environment'],
    ['forte de', 'with strong'],
    ['en charge de', 'in charge of'],
    ['responsable de', 'responsible for'],
    ['en collaboration avec', 'in collaboration with'],
    ['coordination avec', 'coordination with'],
    ['dans le cadre de', 'as part of'],
    ['dans le cadre du', 'as part of the'],
    ['pour le compte de', 'on behalf of'],
    ['chez des clients', 'at clients'],
    ['secteurs variés', 'various sectors'],
    ['différents secteurs', 'various sectors'],
    ['secteurs d\'activité', 'business sectors'],

    // ── Connectors & common words ──
    ['avec', 'with'],
    ['pour', 'for'],
    ['dans', 'in'],
    ['chez', 'at'],
    ['depuis', 'since'],
    ['entre', 'between'],
    ['sous', 'under'],
    ['Secteur', 'Sector'],
    ['secteur', 'sector'],
    ['Disponible immédiatement', 'Available immediately'],
    ['Disponible', 'Available'],
    ['Indisponible', 'Unavailable'],
    ['Membre depuis', 'Member since'],
  ];

  /* ══════════════════════════════════════
     WORD-LEVEL dictionary for remaining words
  ══════════════════════════════════════ */
  const WORDS = {
    'et': 'and', 'ou': 'or', 'le': 'the', 'la': 'the', 'les': 'the', 'des': 'of the',
    'du': 'of the', 'un': 'a', 'une': 'a', 'de': 'of', 'en': 'in', 'au': 'at the', 'aux': 'at the',
    'sur': 'on', 'est': 'is', 'sont': 'are', 'a': 'has', 'ont': 'have',
    'plus': 'more', 'très': 'very', 'également': 'also', 'ainsi': 'thus',
    'notamment': 'including', 'également': 'also', 'principalement': 'mainly',
    'actuellement': 'currently', 'précédemment': 'previously',
    'ans': 'years', 'an': 'year', 'mois': 'months',
    'projets': 'projects', 'projet': 'project',
    'modules': 'modules', 'module': 'module',
    'clients': 'clients', 'client': 'client',
    'processus': 'processes', 'données': 'data',
    'équipe': 'team', 'équipes': 'teams',
    'entreprise': 'company', 'entreprises': 'companies',
    'utilisateurs': 'users', 'utilisateur': 'user',
    'système': 'system', 'systèmes': 'systems',
    'solution': 'solution', 'solutions': 'solutions',
    'interface': 'interface', 'interfaces': 'interfaces',
    'rapport': 'report', 'rapports': 'reports',
    'analyse': 'analysis', 'analyses': 'analyses',
    'gestion': 'management', 'pilotage': 'management',
    'développement': 'development', 'conception': 'design',
    'intégration': 'integration', 'validation': 'validation',
    'production': 'production', 'maintenance': 'maintenance',
    'migration': 'migration', 'évolution': 'evolution',
    'amélioration': 'improvement', 'suivi': 'monitoring',
    'coordination': 'coordination', 'planification': 'planning',
  };

  // Sort phrases by length (longest first) to avoid partial replacements
  const SORTED_PHRASES = PHRASES.slice().sort((a, b) => b[0].length - a[0].length);

  /**
   * Translate a French text to English using dictionary + patterns
   */
  function translateToEnglish(text) {
    if (!text || typeof text !== 'string') return text;
    let result = text;

    // Phase 1: Replace known phrases (longest first)
    SORTED_PHRASES.forEach(([fr, en]) => {
      const regex = new RegExp(fr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      result = result.replace(regex, en);
    });

    return result;
  }

  /* ══════════════════════════════════════
     CONTENT CACHE — stores original FR text
  ══════════════════════════════════════ */
  let originalContent = null;

  function cacheOriginalContent() {
    if (originalContent) return; // already cached
    originalContent = {
      resume: document.getElementById('profile-resume')?.textContent || '',
      experiences: [],
      projets: [],
      skillExp: [],
      certifs: []
    };
    // Cache experience items
    document.querySelectorAll('.experience-item').forEach(item => {
      originalContent.experiences.push({
        title: item.querySelector('.exp-title')?.textContent || '',
        company: item.querySelector('.exp-company-line')?.textContent || '',
        sector: item.querySelector('.exp-sector')?.textContent || '',
        bullets: Array.from(item.querySelectorAll('.exp-bullets li')).map(li => li.textContent),
        tags: Array.from(item.querySelectorAll('.exp-tag')).map(t => t.textContent)
      });
    });
    // Cache projet items
    document.querySelectorAll('#profile-projets .projet-card, #profile-projets .experience-item').forEach(item => {
      const title = item.querySelector('.projet-title, .exp-title');
      const desc = item.querySelector('.projet-desc, .exp-company-line');
      originalContent.projets.push({
        title: title?.textContent || '',
        desc: desc?.textContent || ''
      });
    });
    // Cache skill experience
    document.querySelectorAll('.skill-exp-row').forEach(row => {
      originalContent.skillExp.push({
        label: row.querySelector('.skill-exp-label')?.textContent || '',
        value: row.querySelector('.skill-exp-value')?.textContent || ''
      });
    });
  }

  /**
   * Apply translation to all dynamic content on the page
   */
  function translatePageContent(lang) {
    cacheOriginalContent();

    if (lang === 'fr') {
      // Restore original French content
      restoreFrench();
      return;
    }

    // Translate to English
    const resumeEl = document.getElementById('profile-resume');
    if (resumeEl && originalContent.resume) {
      resumeEl.textContent = translateToEnglish(originalContent.resume);
    }

    // Translate experience items
    const expItems = document.querySelectorAll('.experience-item');
    expItems.forEach((item, i) => {
      const orig = originalContent.experiences[i];
      if (!orig) return;
      const titleEl = item.querySelector('.exp-title');
      const companyEl = item.querySelector('.exp-company-line');
      const sectorEl = item.querySelector('.exp-sector');
      if (titleEl) titleEl.textContent = translateToEnglish(orig.title);
      if (companyEl) companyEl.textContent = translateToEnglish(orig.company);
      if (sectorEl) sectorEl.textContent = translateToEnglish(orig.sector);
      item.querySelectorAll('.exp-bullets li').forEach((li, j) => {
        if (orig.bullets[j]) li.textContent = translateToEnglish(orig.bullets[j]);
      });
    });

    // Translate project items
    const projItems = document.querySelectorAll('#profile-projets .projet-card, #profile-projets .experience-item');
    projItems.forEach((item, i) => {
      const orig = originalContent.projets[i];
      if (!orig) return;
      const title = item.querySelector('.projet-title, .exp-title');
      const desc = item.querySelector('.projet-desc, .exp-company-line');
      if (title) title.textContent = translateToEnglish(orig.title);
      if (desc) desc.textContent = translateToEnglish(orig.desc);
    });

    // Translate empty blocks
    document.querySelectorAll('.empty-block').forEach(el => {
      el.textContent = translateToEnglish(el.textContent);
    });
  }

  function restoreFrench() {
    if (!originalContent) return;
    const resumeEl = document.getElementById('profile-resume');
    if (resumeEl && originalContent.resume) {
      resumeEl.textContent = originalContent.resume;
    }
    const expItems = document.querySelectorAll('.experience-item');
    expItems.forEach((item, i) => {
      const orig = originalContent.experiences[i];
      if (!orig) return;
      const titleEl = item.querySelector('.exp-title');
      const companyEl = item.querySelector('.exp-company-line');
      const sectorEl = item.querySelector('.exp-sector');
      if (titleEl) titleEl.textContent = orig.title;
      if (companyEl) companyEl.textContent = orig.company;
      if (sectorEl) sectorEl.textContent = orig.sector;
      item.querySelectorAll('.exp-bullets li').forEach((li, j) => {
        if (orig.bullets[j]) li.textContent = orig.bullets[j];
      });
    });
    const projItems = document.querySelectorAll('#profile-projets .projet-card, #profile-projets .experience-item');
    projItems.forEach((item, i) => {
      const orig = originalContent.projets[i];
      if (!orig) return;
      const title = item.querySelector('.projet-title, .exp-title');
      const desc = item.querySelector('.projet-desc, .exp-company-line');
      if (title) title.textContent = orig.title;
      if (desc) desc.textContent = orig.desc;
    });
  }

  /**
   * Reset cache (call after profile data loads/changes)
   */
  function resetCache() {
    originalContent = null;
  }

  window.ExpertTranslate = {
    translatePageContent: translatePageContent,
    translateToEnglish: translateToEnglish,
    resetCache: resetCache
  };
})();
