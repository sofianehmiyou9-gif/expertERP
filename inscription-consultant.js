(function () {
  'use strict';

  var form = document.getElementById('inscriptionForm');
  var messageEl = document.getElementById('messageInscription');
  var container = document.getElementById('experiencesContainer');
  var experienceCount = 0;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showMessage(type, text) {
    if (!messageEl) return;
    messageEl.className = 'message ' + type;
    messageEl.textContent = text;
  }

  function clearMessage() {
    if (!messageEl) return;
    messageEl.className = 'message';
    messageEl.textContent = '';
  }

  /* ═══ ERP TASK BANK ═══ */
  var TASK_BANK = {
    'SAP': [
      'Paramétrage SAP', 'Migration vers S/4HANA', 'Configuration des modules', 'Développement ABAP',
      'Tests unitaires et intégration', 'Formation key users', 'Support go-live',
      'Rédaction des spécifications', 'Analyse des flux métier', 'Gestion des autorisations',
      'Optimisation des processus', 'Reprise de données'
    ],
    'Oracle': [
      'Configuration Oracle Cloud', 'Migration de données', 'Intégration OIC',
      'Paramétrage des modules', 'Tests de bout en bout', 'Formation utilisateurs',
      'Conception des rapports', 'Analyse des processus', 'Support post-déploiement'
    ],
    'Dynamics': [
      'Configuration Dynamics 365', 'Développement Power Platform', 'Intégration Azure',
      'Paramétrage des entités', 'Migration de données', 'Formation utilisateurs',
      'Tests et recette', 'Analyse des processus', 'Support et maintenance'
    ],
    'Workday': [
      'Configuration Workday HCM', 'Paramétrage des business processes', 'Intégration EIB/Studio',
      'Migration des données RH', 'Formation utilisateurs', 'Reporting et dashboards',
      'Tests de recette', 'Support post-déploiement'
    ],
    '_default': [
      'Analyse des besoins métier', 'Configuration ERP', 'Rédaction des spécifications',
      'Tests et recette', 'Formation des utilisateurs', 'Support post-déploiement',
      'Migration de données', 'Gestion de projet', 'Coordination des équipes', 'Documentation'
    ]
  };

  var selectedErp = '';

  /* ═══ ERP SELECTOR ═══ */
  window.selectErpChip = function(btn) {
    document.querySelectorAll('#erpSelector .erp-chip').forEach(function(c) {
      c.style.background = '#f8fafc';
      c.style.borderColor = '#e2e8f0';
      c.style.color = '#0e0e0e';
    });
    btn.style.background = '#2563eb';
    btn.style.borderColor = '#2563eb';
    btn.style.color = '#fff';
    selectedErp = btn.dataset.erp;
    /* Refresh task dropdowns without dropping already selected tasks. */
    refreshAllTaskDropdowns();
    refreshAllGeneratedText();
  };

  function getSelectedErp() {
    return selectedErp || '';
  }

  function getTasksForErp() {
    var erp = getSelectedErp();
    return TASK_BANK[erp] || TASK_BANK['_default'];
  }

  function refreshAllTaskDropdowns() {
    container.querySelectorAll('.experience-block').forEach(function(block) {
      populateTaskDropdown(block);
    });
  }

  /* ═══ DROPDOWN MULTI-SELECT (compact) ═══ */
  function populateTaskDropdown(block) {
    var wrap = block.querySelector('.exp-tasks-wrap');
    if (!wrap) return;
    var tasks = getTasksForErp();
    var idx = block.dataset.index;
    var selectedTasks = getSelectedTasks(block);
    /* Dropdown + selected tags container */
    wrap.innerHTML =
      '<div class="task-selected-tags" id="task-tags-' + idx + '" style="display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.4rem;"></div>' +
      '<select class="task-dropdown" id="task-dd-' + idx + '" style="width:100%;padding:.45rem .6rem;font-size:.8rem;border:1.5px solid #e2e8f0;border-radius:8px;background:#f8fafc;color:#475569;cursor:pointer;">' +
        '<option value="">+ Ajouter une tâche réalisée...</option>' +
        tasks.map(function(t) { return '<option value="' + t.replace(/"/g, '&quot;') + '">' + t + '</option>'; }).join('') +
      '</select>';

    var dd = wrap.querySelector('.task-dropdown');
    dd.addEventListener('change', function() {
      if (!dd.value) return;
      addTaskTag(block, dd.value);
      dd.value = '';
      updateExpNarrative(block);
      updateGlobalResume();
    });

    selectedTasks.forEach(function(taskLabel) {
      addTaskTag(block, taskLabel);
    });
  }

  function addTaskTag(block, taskLabel) {
    var idx = block.dataset.index;
    var tagsContainer = block.querySelector('.task-selected-tags');
    if (!tagsContainer) return;
    /* Avoid duplicate */
    var existing = tagsContainer.querySelectorAll('.task-tag');
    for (var i = 0; i < existing.length; i++) {
      if (existing[i].dataset.task === taskLabel) return;
    }
    var tag = document.createElement('span');
    tag.className = 'task-tag';
    tag.dataset.task = taskLabel;
    tag.style.cssText = 'display:inline-flex;align-items:center;gap:4px;font-size:.72rem;color:#1e40af;background:#dbeafe;padding:3px 8px;border-radius:6px;border:1px solid #93c5fd;';
    tag.innerHTML = taskLabel + ' <button type="button" style="background:none;border:none;color:#1e40af;cursor:pointer;font-size:.85rem;padding:0;line-height:1;">&times;</button>';
    tag.querySelector('button').addEventListener('click', function() {
      tag.remove();
      updateExpNarrative(block);
      updateGlobalResume();
    });
    tagsContainer.appendChild(tag);
  }

  function getSelectedTasks(block) {
    var tags = block.querySelectorAll('.task-tag');
    var tasks = [];
    tags.forEach(function(t) { tasks.push(t.dataset.task); });
    return tasks;
  }

  /* ═══ HELPERS ═══ */
  function joinList(arr) {
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(', ') + ' et ' + arr[arr.length - 1];
  }

  /* ═══ EXPERIENCE DESCRIPTION (per mission) ═══ */
  function generateExpDescription(tasks, erp, poste, entreprise) {
    var catDefs = [
      { key:'config', kw:['paramétrage','configuration','configur','autorisations'],
        tpl: function(items){ return 'prise en charge des activités de ' + joinList(items); } },
      { key:'dev', kw:['développement','abap','power platform','intégration','azure','oic','eib','studio'],
        tpl: function(items){ return 'réalisation des travaux de ' + joinList(items); } },
      { key:'analyse', kw:['analyse','spécification','specs','rédaction','conception','reporting','rapports','dashboards'],
        tpl: function(items){ return 'contribution aux activités d\u2019' + joinList(items); } },
      { key:'migration', kw:['migration','reprise de données'],
        tpl: function(items){ return 'conduite de la ' + joinList(items); } },
      { key:'test', kw:['test','recette','bout en bout','unitaire'],
        tpl: function(items){ return 'participation aux phases de ' + joinList(items); } },
      { key:'formation', kw:['formation','key users','utilisateurs'],
        tpl: function(items){ return 'animation des sessions de ' + joinList(items); } },
      { key:'support', kw:['support','go-live','maintenance','post-déploiement','documentation','coordination','gestion de projet','optimisation'],
        tpl: function(items){ return 'assurance du ' + joinList(items); } }
    ];
    var cats = {}; catDefs.forEach(function(c){ cats[c.key] = []; });
    tasks.forEach(function(t) {
      var tl = t.toLowerCase();
      for (var i = 0; i < catDefs.length; i++) {
        if (catDefs[i].kw.some(function(k){ return tl.indexOf(k) !== -1; })) {
          cats[catDefs[i].key].push(t.charAt(0).toLowerCase() + t.slice(1));
          return;
        }
      }
    });

    var intro = '';
    if (poste && entreprise) intro = 'En tant que ' + poste + ' chez ' + entreprise + ', ';
    else if (entreprise) intro = 'Au sein de ' + entreprise + ', ';

    var phrases = [];
    catDefs.forEach(function(c) {
      if (!cats[c.key].length) return;
      phrases.push(c.tpl(cats[c.key]));
    });
    if (!phrases.length) return '';
    var text = intro + phrases.join(', ') + '.';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function updateExpNarrative(block) {
    var textarea = block.querySelector('textarea[name^="exp_description_"]');
    if (!textarea) return;
    var tasks = getSelectedTasks(block);
    if (!tasks.length) { textarea.value = ''; return; }
    var poste = (block.querySelector('input[name^="exp_titre_"]') || {}).value || '';
    var entreprise = (block.querySelector('input[name^="exp_entreprise_"]') || {}).value || '';
    var erp = getSelectedErp() || 'ERP';
    textarea.value = generateExpDescription(tasks, erp, poste, entreprise);
  }

  function refreshAllGeneratedText() {
    container.querySelectorAll('.experience-block').forEach(function(block) {
      updateExpNarrative(block);
    });
    updateGlobalResume();
  }

  /* ═══ GLOBAL RESUME GENERATOR (overview, different from exp descriptions) ═══ */
  function updateGlobalResume() {
    var resumeEl = document.getElementById('resume');
    if (!resumeEl) return;

    var titre = (document.getElementById('titre') || {}).value || '';
    var erp = getSelectedErp() || 'ERP';
    var blocks = container.querySelectorAll('.experience-block');
    if (!blocks.length) return;

    /* Collect all unique tasks + count experiences + company names */
    var allTasks = [];
    var companies = [];
    var totalExps = 0;
    blocks.forEach(function(block) {
      var tasks = getSelectedTasks(block);
      var entreprise = (block.querySelector('input[name^="exp_entreprise_"]') || {}).value || '';
      if (entreprise && companies.indexOf(entreprise) === -1) companies.push(entreprise);
      tasks.forEach(function(t) {
        if (allTasks.indexOf(t) === -1) allTasks.push(t);
      });
      if (tasks.length) totalExps++;
    });

    if (!allTasks.length) return;

    /* Categorize all tasks for the overview */
    var domains = [];
    var domainKw = {
      'configuration et paramétrage': ['paramétrage','configuration','configur','autorisations','entités','business processes'],
      'développement et intégration': ['développement','abap','power platform','intégration','azure','oic','eib','studio'],
      'analyse et conception': ['analyse','spécification','specs','rédaction','conception','reporting','rapports','dashboards'],
      'migration de données': ['migration','reprise de données'],
      'tests et validation': ['test','recette','bout en bout','unitaire'],
      'formation et accompagnement': ['formation','key users','utilisateurs'],
      'support et gestion de projet': ['support','go-live','maintenance','post-déploiement','documentation','coordination','gestion de projet','optimisation']
    };
    for (var domain in domainKw) {
      var found = allTasks.some(function(t) {
        var tl = t.toLowerCase();
        return domainKw[domain].some(function(k) { return tl.indexOf(k) !== -1; });
      });
      if (found) domains.push(domain);
    }

    /* Build global resume text */
    var resume = '';

    /* Line 1: Professional profile intro */
    if (titre) {
      resume += titre + ' spécialisé en environnement ' + erp;
    } else {
      resume += 'Consultant spécialisé en environnement ' + erp;
    }
    if (totalExps > 1) {
      resume += ', fort de ' + totalExps + ' expériences significatives';
      if (companies.length) resume += ' notamment chez ' + joinList(companies);
    } else if (companies.length) {
      resume += ', ayant intervenu chez ' + joinList(companies);
    }
    resume += '. ';

    /* Line 2: Domains of expertise */
    if (domains.length) {
      resume += 'Expertise couvrant les domaines de ' + joinList(domains) + '. ';
    }

    /* Line 3: Professional qualities */
    var qualities = [];
    if (allTasks.some(function(t){ return /formation|key users|utilisateurs/i.test(t); })) qualities.push('capacité à accompagner et former les équipes métier');
    if (allTasks.some(function(t){ return /gestion de projet|coordination/i.test(t); })) qualities.push('aptitude à piloter des projets de bout en bout');
    if (allTasks.some(function(t){ return /migration|reprise/i.test(t); })) qualities.push('expérience en conduite de migrations complexes');
    if (allTasks.some(function(t){ return /analyse|spécification|conception/i.test(t); })) qualities.push('solides compétences en analyse fonctionnelle');
    if (qualities.length) {
      resume += 'Profil reconnu pour ' + joinList(qualities.slice(0, 3)) + '.';
    }

    resumeEl.value = resume;
  }

  /* ═══ EXPERIENCE BLOCK ═══ */
  function addExperienceBlock(initialData) {
    experienceCount += 1;

    var wrapper = document.createElement('div');
    wrapper.className = 'experience-block';
    wrapper.dataset.index = String(experienceCount);

    var title = initialData && initialData.titre ? initialData.titre : '';
    var entreprise = initialData && initialData.entreprise ? initialData.entreprise : '';
    var periode = initialData && initialData.periode ? initialData.periode : '';
    var description = initialData && initialData.description ? initialData.description : '';

    wrapper.innerHTML =
      '<h3>Expérience ' + experienceCount + '</h3>' +
      '<button type="button" class="btn btn-remove" data-remove="1">Supprimer</button>' +
      '<div class="form-group">' +
        '<label>Titre du poste *</label>' +
        '<input type="text" name="exp_titre_' + experienceCount + '" value="' + escapeHtml(title) + '" required>' +
      '</div>' +
      '<div class="form-group">' +
        '<label>Entreprise *</label>' +
        '<input type="text" name="exp_entreprise_' + experienceCount + '" value="' + escapeHtml(entreprise) + '" required>' +
      '</div>' +
      '<div class="form-group">' +
        '<label>Période *</label>' +
        '<input type="text" name="exp_periode_' + experienceCount + '" value="' + escapeHtml(periode) + '" placeholder="Ex: 2022 - 2025" required>' +
      '</div>' +
      '<div class="form-group">' +
        '<label style="font-size:.78rem;color:#64748b;margin-bottom:.25rem;">Tâches réalisées sur cette mission :</label>' +
        '<div class="exp-tasks-wrap" style="margin-bottom:.5rem;"></div>' +
        '<label>Description <span style="font-size:.72rem;color:#94a3b8;font-weight:400;">(générée automatiquement, modifiable)</span></label>' +
        '<textarea name="exp_description_' + experienceCount + '" placeholder="Sélectionnez vos tâches ci-dessus ou saisissez librement...">' + escapeHtml(description) + '</textarea>' +
      '</div>';

    container.appendChild(wrapper);

    /* Populate task dropdown */
    populateTaskDropdown(wrapper);

    wrapper.querySelectorAll('input[name^="exp_titre_"], input[name^="exp_entreprise_"]').forEach(function(input) {
      input.addEventListener('input', function() {
        updateExpNarrative(wrapper);
        updateGlobalResume();
      });
    });

    wrapper.querySelector('[data-remove="1"]').addEventListener('click', function () {
      wrapper.remove();
      clearMessage();
      updateGlobalResume();
    });
  }

  function collectExperiences() {
    var blocks = container.querySelectorAll('.experience-block');
    var experiences = [];

    blocks.forEach(function (block) {
      var titre = block.querySelector('input[name^="exp_titre_"]');
      var entreprise = block.querySelector('input[name^="exp_entreprise_"]');
      var periode = block.querySelector('input[name^="exp_periode_"]');
      var description = block.querySelector('textarea[name^="exp_description_"]');

      var titreVal = titre ? titre.value.trim() : '';
      experiences.push({
        poste: titreVal,
        titre: titreVal,
        entreprise: entreprise ? entreprise.value.trim() : '',
        periode: periode ? periode.value.trim() : '',
        description: description ? description.value.trim() : ''
      });
    });

    return experiences;
  }

  function collectCompetences(rawValue) {
    return rawValue
      .split(',')
      .map(function (item) { return item.trim(); })
      .filter(Boolean);
  }

  function saveDraft(payload) {
    try {
      var wrapper = { data: payload, savedAt: Date.now() };
      localStorage.setItem('inscription_consultant_draft', JSON.stringify(wrapper));
    } catch (err) { /* silent */ }
  }

  function clearDraft() {
    try { localStorage.removeItem('inscription_consultant_draft'); } catch (e) { /* silent */ }
  }

  function loadDraft() {
    try {
      var raw = localStorage.getItem('inscription_consultant_draft');
      if (!raw) return null;
      var wrapper = JSON.parse(raw);
      if (wrapper.savedAt && (Date.now() - wrapper.savedAt > 86400000)) {
        localStorage.removeItem('inscription_consultant_draft');
        return null;
      }
      return wrapper.data || wrapper;
    } catch (e) {
      return null;
    }
  }

  /* ═══ CHECK IF EMAIL ALREADY EXISTS ═══ */
  async function emailAlreadyUsed(email) {
    try {
      var results = await sbSelect('consultants', 'select=id&email=eq.' + encodeURIComponent(email.toLowerCase()));
      return results && results.length > 0;
    } catch (e) {
      return false;
    }
  }

  /* ═══ SUBMIT TO SUPABASE ═══ */
  async function submitToSupabase(payload) {
    var today = new Date().toISOString().split('T')[0];
    var expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    var notesAdmin = {
      source: 'inscription_directe',
      resume: payload.resume || '',
      resume_pro: payload.resume || '',
      experiences: payload.experiences || [],
      date_creation: today,
      date_expiration: expiryDate.toISOString().split('T')[0],
      submitted_at: new Date().toISOString()
    };

    var row = {
      nom: payload.nom,
      prenom: payload.prenom,
      email: payload.email.toLowerCase(),
      telephone: payload.telephone,
      titre: payload.titre,
      competences: payload.competences,
      statut: 'en_attente',
      notes_admin: JSON.stringify(notesAdmin)
    };

    return await sbInsert('consultants', row);
  }

  window.ajouterExperience = function () {
    addExperienceBlock();
    clearMessage();
  };

  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      clearMessage();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (!getSelectedErp()) {
        showMessage('error', 'Sélectionne votre ERP principal avant d\'envoyer le formulaire.');
        return;
      }

      var payload = {
        nom: document.getElementById('nom').value.trim(),
        prenom: document.getElementById('prenom').value.trim(),
        email: document.getElementById('email').value.trim(),
        telephone: document.getElementById('telephone').value.trim(),
        titre: document.getElementById('titre').value.trim(),
        resume: document.getElementById('resume').value.trim(),
        competences: collectCompetences(document.getElementById('competences').value || ''),
        experiences: collectExperiences()
      };

      if (payload.experiences.length === 0) {
        showMessage('error', 'Ajoute au moins une expérience professionnelle.');
        return;
      }

      // Disable submit button during processing
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours…';
      }

      try {
        // Check if email already registered
        var exists = await emailAlreadyUsed(payload.email);
        if (exists) {
          showMessage('error', 'Cet email est déjà utilisé. Si vous avez déjà postulé, votre candidature est en cours de traitement.');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Valider l\'Inscription'; }
          return;
        }

        // Submit to Supabase
        await submitToSupabase(payload);

        // Success
        clearDraft();
        showMessage('success', 'Candidature envoyée avec succès ! Notre équipe examinera votre profil sous 48h. Vous recevrez un email de confirmation.');
        form.reset();
        container.innerHTML = '';
        experienceCount = 0;
        addExperienceBlock();
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (err) {
        showMessage('error', 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
        console.error('Inscription error:', err);
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Valider l\'Inscription'; }
      }
    });
  }

  addExperienceBlock();

  /* Load draft on page load */
  var draftData = loadDraft();
  if (draftData && form) {
    if (draftData.nom) document.getElementById('nom').value = draftData.nom;
    if (draftData.prenom) document.getElementById('prenom').value = draftData.prenom;
    if (draftData.email) document.getElementById('email').value = draftData.email;
    if (draftData.telephone) document.getElementById('telephone').value = draftData.telephone;
    if (draftData.titre) document.getElementById('titre').value = draftData.titre;
    if (draftData.resume) document.getElementById('resume').value = draftData.resume;
    if (draftData.competences) document.getElementById('competences').value = draftData.competences.join(', ');
    if (draftData.experiences && draftData.experiences.length) {
      container.innerHTML = '';
      experienceCount = 0;
      draftData.experiences.forEach(function(exp) {
        addExperienceBlock(exp);
      });
    }
  }

  /* Auto-save draft every 30 seconds */
  setInterval(function() {
    if (!form) return;
    var draft = {
      nom: (document.getElementById('nom') || {}).value || '',
      prenom: (document.getElementById('prenom') || {}).value || '',
      email: (document.getElementById('email') || {}).value || '',
      telephone: (document.getElementById('telephone') || {}).value || '',
      titre: (document.getElementById('titre') || {}).value || '',
      resume: (document.getElementById('resume') || {}).value || '',
      competences: collectCompetences((document.getElementById('competences') || {}).value || ''),
      experiences: collectExperiences()
    };
    // Only save if at least name or email filled
    if (draft.nom || draft.email) saveDraft(draft);
  }, 30000);
})();
