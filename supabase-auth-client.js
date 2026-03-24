/**
 * ExpertERPHub - Supabase Auth Client (Sprint 1)
 * Initialise le client Supabase JS et expose des helpers d'authentification.
 * Depend de config.js (ExpertConfig.SB_URL, ExpertConfig.SB_KEY)
 */
(function () {
  'use strict';

  // Verifie que supabase-js et config sont charges
  if (typeof supabase === 'undefined' || !supabase.createClient) {
    console.error('[ExpertSupabaseAuth] supabase-js non charge. Verifiez le CDN.');
    return;
  }
  if (!window.ExpertConfig || !ExpertConfig.SB_URL || !ExpertConfig.SB_KEY) {
    console.error('[ExpertSupabaseAuth] ExpertConfig manquant. Verifiez config.js.');
    return;
  }

  // Initialise le client Supabase
  var client = supabase.createClient(ExpertConfig.SB_URL, ExpertConfig.SB_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });

  /**
   * Connexion par email + mot de passe via Supabase Auth
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{data: object|null, error: object|null}>}
   */
  async function signIn(email, password) {
    try {
      var result = await client.auth.signInWithPassword({
        email: email,
        password: password
      });
      return result;
    } catch (e) {
      return { data: null, error: { message: e.message || 'Erreur de connexion' } };
    }
  }

  /**
   * Deconnexion
   * @returns {Promise<void>}
   */
  async function signOut() {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('[ExpertSupabaseAuth] Erreur signOut:', e);
    }
    // Nettoie aussi l'ancien systeme de session
    if (window.ExpertPortalAuth) {
      ExpertPortalAuth.clearSession();
    }
  }

  /**
   * Recupere la session active (si existante)
   * @returns {Promise<{session: object|null, user: object|null}>}
   */
  async function getSession() {
    try {
      var result = await client.auth.getSession();
      if (result.data && result.data.session) {
        return {
          session: result.data.session,
          user: result.data.session.user
        };
      }
      return { session: null, user: null };
    } catch (e) {
      return { session: null, user: null };
    }
  }

  /**
   * Recupere l'email de l'utilisateur connecte (ou null)
   * @returns {Promise<string|null>}
   */
  async function getEmail() {
    var s = await getSession();
    if (s.user && s.user.email) return s.user.email;
    return null;
  }

  /**
   * Inscription par email + mot de passe
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{data: object|null, error: object|null}>}
   */
  async function signUp(email, password) {
    try {
      var result = await client.auth.signUp({
        email: email,
        password: password
      });
      return result;
    } catch (e) {
      return { data: null, error: { message: e.message || 'Erreur d\'inscription' } };
    }
  }

  // API publique
  window.ExpertSupabaseAuth = {
    client: client,
    signIn: signIn,
    signOut: signOut,
    signUp: signUp,
    getSession: getSession,
    getEmail: getEmail
  };

  console.log('[ExpertSupabaseAuth] Client initialise avec succes.');
})();
