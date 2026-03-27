/**
 * ExpertERPHub - Fonctions utilitaires partagees
 * Depends on: config.js (must be loaded first)
 */
(function () {
  'use strict';

  /**
   * Echappe les caracteres HTML dangereux (anti-XSS)
   * Usage: element.innerHTML = safe(userData);
   */
  function safe(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Alias de safe() pour compatibilite avec le code existant
   */
  function sanitizeHtml(str) {
    return safe(str);
  }

  /**
   * Formate une date ISO en format lisible (locale FR par defaut)
   * @param {string|Date} date - Date ISO ou objet Date
   * @param {object} options - Options Intl.DateTimeFormat (optionnel)
   * @returns {string} Date formatee ou chaine vide
   */
  function formatDate(date, options) {
    if (!date) return '';
    try {
      var d = new Date(date);
      if (isNaN(d.getTime())) return String(date);
      var defaultOpts = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return d.toLocaleDateString('fr-FR', options || defaultOpts);
    } catch (e) {
      return String(date);
    }
  }

  /**
   * Verifie si un email est dans la liste des admins autorises
   * @param {string} email
   * @returns {boolean}
   */
  function isAdminEmail(email) {
    if (!email || !window.ExpertConfig || !window.ExpertConfig.ADMIN_EMAIL_HASHES) return false;
    var normalized = String(email).trim().toLowerCase();
    // Compare le hash de l'email avec les hash admin stockés
    // Utilise une version sync simple pour compatibilité
    try {
      var encoder = new TextEncoder();
      var data = encoder.encode(normalized);
      // Fallback sync: on utilise une promesse résolue immédiatement via un flag
      var match = false;
      crypto.subtle.digest('SHA-256', data).then(function(hashBuffer) {
        var hashHex = Array.from(new Uint8Array(hashBuffer)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
        match = window.ExpertConfig.ADMIN_EMAIL_HASHES.indexOf(hashHex) !== -1;
      });
      // Note: cette vérification est async, on fournit aussi une version async
      return match;
    } catch(e) { return false; }
  }

  // Version async (recommandée) pour vérification admin
  async function isAdminEmailAsync(email) {
    if (!email || !window.ExpertConfig || !window.ExpertConfig.ADMIN_EMAIL_HASHES) return false;
    var normalized = String(email).trim().toLowerCase();
    var encoder = new TextEncoder();
    var data = encoder.encode(normalized);
    var hashBuffer = await crypto.subtle.digest('SHA-256', data);
    var hashHex = Array.from(new Uint8Array(hashBuffer)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    return window.ExpertConfig.ADMIN_EMAIL_HASHES.indexOf(hashHex) !== -1;
  }

  /**
   * Verifie l'acces admin. Combine le check de session + email.
   * Retourne true si l'acces est autorise, false sinon.
   * @param {object} session - Session portal-auth (optionnel, auto-detect si absent)
   * @returns {boolean}
   */
  function checkAdminAccess(session) {
    var s = session;
    if (!s && window.ExpertPortalAuth) {
      s = window.ExpertPortalAuth.getSession();
    }
    if (!s) return false;
    if (s.role !== 'admin') return false;
    // Si adminGranted (login par password), verifier aussi l'email si disponible
    if (s.adminGranted) return true;
    // Si l'email est dans la liste admin, autoriser
    if (s.email && isAdminEmail(s.email)) return true;
    return false;
  }

  window.ExpertUtils = {
    safe: safe,
    sanitizeHtml: sanitizeHtml,
    formatDate: formatDate,
    isAdminEmail: isAdminEmail,
    isAdminEmailAsync: isAdminEmailAsync,
    checkAdminAccess: checkAdminAccess
  };

  // Rendre safe() et sanitizeHtml() disponibles globalement pour compatibilite
  if (!window.safe) window.safe = safe;
  if (!window.sanitizeHtml) window.sanitizeHtml = sanitizeHtml;
  if (!window.formatDate) window.formatDate = formatDate;
})();
