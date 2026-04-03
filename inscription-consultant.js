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
      '<h3>Experience ' + experienceCount + '</h3>' +
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
        '<label>Periode *</label>' +
        '<input type="text" name="exp_periode_' + experienceCount + '" value="' + escapeHtml(periode) + '" placeholder="Ex: 2022 - 2025" required>' +
      '</div>' +
      '<div class="form-group">' +
        '<label>Description</label>' +
        '<textarea name="exp_description_' + experienceCount + '" placeholder="Missions, resultats, outils...">' + escapeHtml(description) + '</textarea>' +
      '</div>';

    container.appendChild(wrapper);

    wrapper.querySelector('[data-remove="1"]').addEventListener('click', function () {
      wrapper.remove();
      clearMessage();
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
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Soumettre ma candidature'; }
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
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Soumettre ma candidature'; }
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
