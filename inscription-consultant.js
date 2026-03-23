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
    if (!messageEl) {
      return;
    }

    messageEl.className = 'message ' + type;
    messageEl.textContent = text;
  }

  function clearMessage() {
    if (!messageEl) {
      return;
    }

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

      experiences.push({
        titre: titre ? titre.value.trim() : '',
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
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function saveDraft(payload) {
    try {
      localStorage.setItem('inscription_consultant_draft', JSON.stringify(payload));
    } catch (err) {
      // If storage is unavailable, keep UX functional without persistence.
    }
  }

  window.ajouterExperience = function () {
    addExperienceBlock();
    clearMessage();
  };

  if (form) {
    form.addEventListener('submit', function (event) {
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
        experiences: collectExperiences(),
        submittedAt: new Date().toISOString()
      };

      if (payload.experiences.length === 0) {
        showMessage('error', 'Ajoute au moins une experience professionnelle.');
        return;
      }

      saveDraft(payload);
      showMessage('success', 'Inscription enregistree localement. Prochaine etape: connecter ce formulaire a Supabase.');
      form.reset();
      container.innerHTML = '';
      experienceCount = 0;
      addExperienceBlock();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  addExperienceBlock();
})();
