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
    'Odoo': { full: 'Odoo ERP', modules: ['CRM', 'Comptabilité', 'Inventaire', 'MRP', 'eCommerce'] }
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
   * Professionnalise le résumé du consultant
   */
  function enhanceResume(resume, data) {
    if (!resume || resume.trim().length < 10) return resume || '';

    var text = resume.trim();
    var erp = detectPrimaryErp(data.competences);
    var annees = data.annees_exp || '';

    // Nettoyage basique
    text = text.charAt(0).toUpperCase() + text.slice(1);
    // Supprimer les lignes vides multiples
    text = text.replace(/\n{3,}/g, '\n\n');
    // Assurer une ponctuation de fin
    if (!/[.!?]$/.test(text.trim())) {
      text = text.trim() + '.';
    }

    // Si le texte est très court, enrichir
    if (text.length < 80) {
      var prefix = '';
      if (annees) {
        prefix = 'Consultant ERP avec ' + annees + " d'expérience";
      } else {
        prefix = 'Consultant ERP spécialisé';
      }
      if (erp) {
        prefix += ' en ' + erp;
      }
      text = prefix + '. ' + text;
    }

    return text;
  }

  /**
   * Professionnalise les expériences
   */
  function enhanceExperiences(experiences) {
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

    var result = {
      titre: enhanceTitre(profileData.titre, profileData.competences),
      resume: enhanceResume(notes.resume || '', {
        competences: profileData.competences,
        annees_exp: notes.annees_exp
      }),
      competences: enhanceCompetences(profileData.competences),
      experiences: enhanceExperiences(notes.experiences || []),
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
    _detectPrimaryErp: detectPrimaryErp
  };

})();
