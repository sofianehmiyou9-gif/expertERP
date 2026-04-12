(function () {
  const KEY = 'experterp_portal_session';
  const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

  function normalizeRole(role) {
    const value = String(role || '').toLowerCase();
    if (value === 'company') return 'entreprise';
    return value;
  }

  /* ── SHA-256 signature (async) ────────────────────────── */
  async function sha256Hex(str) {
    var encoder = new TextEncoder();
    var buf = await crypto.subtle.digest('SHA-256', encoder.encode(str));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  async function computeSessionSignature(data) {
    var payload = data.role + '|' + data.email + '|' + data.expiresAt;
    var salt = KEY + '_sig_v2';
    return await sha256Hex(salt + payload);
  }

  /* ── Legacy DJB2 signature (for migration of old sessions) ── */
  function computeLegacySignature(data) {
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

  /* ── getSession (sync — returns session or null) ──────── */
  /* Checks structure + expiry synchronously. Signature is   */
  /* verified async in the background; if forged, the        */
  /* session is cleared on next tick.                         */
  function getSession() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.role) return null;
      if (parsed.expiresAt && Date.now() > Date.parse(parsed.expiresAt)) {
        localStorage.removeItem(KEY);
        return null;
      }
      /* Quick sync check: reject if no signature at all */
      if (!parsed._sig) { clearSession(); return null; }
      /* Async background verification (non-blocking) */
      _verifySignatureBackground(parsed);
      parsed.role = normalizeRole(parsed.role);
      return parsed;
    } catch (e) {
      return null;
    }
  }

  /* Async verify — clears session if signature is invalid */
  function _verifySignatureBackground(parsed) {
    computeSessionSignature(parsed).then(function (expected) {
      if (parsed._sig !== expected) {
        /* Also check legacy DJB2 for sessions created before the upgrade */
        if (parsed._sig !== computeLegacySignature(parsed)) {
          clearSession();
          /* Optionally reload to force re-login */
        }
      }
    }).catch(function () { /* crypto.subtle unavailable — skip */ });
  }

  /* ── getSessionAsync (full async verification) ────────── */
  /* Use this in critical paths (admin access, sensitive ops) */
  async function getSessionAsync() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.role) return null;
      if (parsed.expiresAt && Date.now() > Date.parse(parsed.expiresAt)) {
        localStorage.removeItem(KEY);
        return null;
      }
      if (!parsed._sig) { clearSession(); return null; }
      var expected = await computeSessionSignature(parsed);
      if (parsed._sig !== expected) {
        /* Check legacy DJB2 for migration */
        if (parsed._sig !== computeLegacySignature(parsed)) {
          clearSession();
          return null;
        }
        /* Migrate: re-sign with SHA-256 */
        parsed._sig = expected;
        localStorage.setItem(KEY, JSON.stringify(parsed));
      }
      parsed.role = normalizeRole(parsed.role);
      return parsed;
    } catch (e) {
      return null;
    }
  }

  /* ── setSession (async — computes SHA-256 signature) ──── */
  async function setSession(session) {
    var now = Date.now();
    var normalized = {
      role: normalizeRole(session && session.role),
      email: session && session.email ? String(session.email).trim() : '',
      adminGranted: !!(session && session.adminGranted),
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SESSION_TTL_MS).toISOString()
    };
    try {
      normalized._sig = await computeSessionSignature(normalized);
    } catch (e) {
      /* Fallback: legacy hash if crypto.subtle unavailable */
      normalized._sig = computeLegacySignature(normalized);
    }
    localStorage.setItem(KEY, JSON.stringify(normalized));
    return normalized;
  }

  function clearSession() {
    localStorage.removeItem(KEY);
  }

  function getDashboardUrl(role, email) {
    var normalizedRole = normalizeRole(role);
    if (normalizedRole === 'consultant') return 'dashboard-consultant.html' + (email ? ('?email=' + encodeURIComponent(email)) : '');
    if (normalizedRole === 'entreprise') return 'dashboard-entreprise.html' + (email ? ('?email=' + encodeURIComponent(email)) : '');
    if (normalizedRole === 'admin') return 'dashboard-admin.html';
    if (normalizedRole === 'visiteur_pro') return 'dashboard-visiteur.html';
    return 'index.html';
  }

  async function goToDashboard(role, email, extra) {
    var session = await setSession({ role: role, email: email, ...(extra || {}) });
    window.location.href = getDashboardUrl(session.role, session.email);
  }

  window.ExpertPortalAuth = {
    getSession: getSession,
    getSessionAsync: getSessionAsync,
    setSession: setSession,
    clearSession: clearSession,
    getDashboardUrl: getDashboardUrl,
    goToDashboard: goToDashboard
  };
})();
