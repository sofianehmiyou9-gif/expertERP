/**
 * ExpertERPHub - Supabase Auth Client (Sprint 1 v2)
 * Utilise l'API REST Supabase Auth directement (zero dependance CDN).
 * Depend de config.js (ExpertConfig.SB_URL, ExpertConfig.SB_KEY)
 */
(function () {
  'use strict';

  if (!window.ExpertConfig || !ExpertConfig.SB_URL || !ExpertConfig.SB_KEY) {
    console.error('[ExpertSupabaseAuth] ExpertConfig manquant. Verifiez config.js.');
    return;
  }

  var BASE = ExpertConfig.SB_URL;
  var API_KEY = ExpertConfig.SB_KEY;
  var TOKEN_KEY = 'sb-auth-token';

  // ---- helpers internes ----

  function headers(accessToken) {
    var h = {
      'Content-Type': 'application/json',
      'apikey': API_KEY
    };
    if (accessToken) h['Authorization'] = 'Bearer ' + accessToken;
    return h;
  }

  function saveTokens(data) {
    if (data && data.access_token) {
      try {
        localStorage.setItem(TOKEN_KEY, JSON.stringify({
          access_token: data.access_token,
          refresh_token: data.refresh_token || null,
          user: data.user || null,
          expires_at: data.expires_at || null
        }));
      } catch (e) { /* quota */ }
    }
  }

  function loadTokens() {
    try {
      var raw = localStorage.getItem(TOKEN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function clearTokens() {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* ok */ }
  }

  // ---- API publique ----

  /**
   * Connexion par email + mot de passe
   */
  async function signIn(email, password) {
    try {
      var resp = await fetch(BASE + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email: email, password: password })
      });
      var data = await resp.json();
      if (!resp.ok) {
        return { data: null, error: { message: data.error_description || data.msg || data.error || 'Erreur de connexion' } };
      }
      saveTokens(data);
      console.log('[ExpertSupabaseAuth] signIn OK pour', email);
      return { data: { session: data, user: data.user }, error: null };
    } catch (e) {
      return { data: null, error: { message: e.message || 'Erreur reseau' } };
    }
  }

  /**
   * Deconnexion
   */
  async function signOut() {
    try {
      var tokens = loadTokens();
      if (tokens && tokens.access_token) {
        await fetch(BASE + '/auth/v1/logout', {
          method: 'POST',
          headers: headers(tokens.access_token)
        });
      }
    } catch (e) {
      console.warn('[ExpertSupabaseAuth] Erreur signOut:', e);
    }
    clearTokens();
    if (window.ExpertPortalAuth) {
      ExpertPortalAuth.clearSession();
    }
  }

  /**
   * Recupere la session active (token + user stockes)
   */
  async function getSession() {
    var tokens = loadTokens();
    if (!tokens || !tokens.access_token) return { session: null, user: null };

    // Verifier si le token est encore valide via /auth/v1/user
    try {
      var resp = await fetch(BASE + '/auth/v1/user', {
        method: 'GET',
        headers: headers(tokens.access_token)
      });
      if (resp.ok) {
        var user = await resp.json();
        return { session: tokens, user: user };
      }
      // Token expire — tenter un refresh
      if (tokens.refresh_token) {
        var refreshResp = await fetch(BASE + '/auth/v1/token?grant_type=refresh_token', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({ refresh_token: tokens.refresh_token })
        });
        if (refreshResp.ok) {
          var newData = await refreshResp.json();
          saveTokens(newData);
          return { session: newData, user: newData.user };
        }
      }
      // Tout a echoue
      clearTokens();
      return { session: null, user: null };
    } catch (e) {
      return { session: null, user: null };
    }
  }

  /**
   * Recupere l'email de l'utilisateur connecte (ou null)
   */
  async function getEmail() {
    var s = await getSession();
    if (s.user && s.user.email) return s.user.email;
    return null;
  }

  /**
   * Inscription par email + mot de passe
   */
  async function signUp(email, password) {
    try {
      var resp = await fetch(BASE + '/auth/v1/signup', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email: email, password: password })
      });
      var data = await resp.json();
      if (!resp.ok) {
        return { data: null, error: { message: data.error_description || data.msg || data.error || 'Erreur d\'inscription' } };
      }
      return { data: data, error: null };
    } catch (e) {
      return { data: null, error: { message: e.message || 'Erreur reseau' } };
    }
  }

  // Expose l'API
  window.ExpertSupabaseAuth = {
    signIn: signIn,
    signOut: signOut,
    signUp: signUp,
    getSession: getSession,
    getEmail: getEmail
  };

  console.log('[ExpertSupabaseAuth] Client REST initialise avec succes (v2 - zero CDN).');
})();
