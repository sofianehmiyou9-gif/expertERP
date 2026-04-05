(function () {
  const KEY = 'experterp_portal_session';
  const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

  function normalizeRole(role) {
    const value = String(role || '').toLowerCase();
    if (value === 'company') return 'entreprise';
    return value;
  }

  function computeSessionSignature(data) {
    var payload = data.role + '|' + data.email + '|' + data.expiresAt;
    var hash = 0;
    var salt = KEY + '_sig_v1';
    var str = salt + payload;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.role) return null;
      if (parsed.expiresAt && Date.now() > Date.parse(parsed.expiresAt)) {
        localStorage.removeItem(KEY);
        return null;
      }
      if (parsed._sig !== computeSessionSignature(parsed)) {
        clearSession();
        return null;
      }
      parsed.role = normalizeRole(parsed.role);
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function setSession(session) {
    const now = Date.now();
    const normalized = {
      role: normalizeRole(session && session.role),
      email: session && session.email ? String(session.email).trim() : '',
      adminGranted: !!(session && session.adminGranted),
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SESSION_TTL_MS).toISOString()
    };
    normalized._sig = computeSessionSignature(normalized);
    localStorage.setItem(KEY, JSON.stringify(normalized));
    return normalized;
  }

  function clearSession() {
    localStorage.removeItem(KEY);
  }

  function getDashboardUrl(role, email) {
    const normalizedRole = normalizeRole(role);
    if (normalizedRole === 'consultant') return 'dashboard-consultant.html' + (email ? ('?email=' + encodeURIComponent(email)) : '');
    if (normalizedRole === 'entreprise') return 'dashboard-entreprise.html' + (email ? ('?email=' + encodeURIComponent(email)) : '');
    if (normalizedRole === 'admin') return 'dashboard-admin.html';
    if (normalizedRole === 'visiteur_pro') return 'index.html'; /* Pas de dashboard visiteur — retour au site */
    return 'index.html';
  }

  function goToDashboard(role, email, extra) {
    const session = setSession({ role: role, email: email, ...(extra || {}) });
    window.location.href = getDashboardUrl(session.role, session.email);
  }

  window.ExpertPortalAuth = {
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    getDashboardUrl: getDashboardUrl,
    goToDashboard: goToDashboard
  };
})();