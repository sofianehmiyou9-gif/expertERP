/**
 * ExpertERP — Helpers Supabase centralisés
 * Depends on: config.js (window.ExpertConfig.SB_URL / SB_KEY)
 *
 * Fournit : sbFetch, sbInsert, sbUpdate, sbSelect, parseNotes, normalizeStatus, sha256Hex
 * Toutes les fonctions sont exposées via window.ExpertSB et aussi en global pour compatibilité.
 */
(function () {
  'use strict';

  /* ── Raccourcis config ── */
  function url() { return (window.ExpertConfig && ExpertConfig.SB_URL) || ''; }
  function key() { return (window.ExpertConfig && ExpertConfig.SB_KEY) || ''; }
  function headers(extra) {
    var h = { 'apikey': key(), 'Authorization': 'Bearer ' + key() };
    if (extra) { for (var k in extra) { if (extra.hasOwnProperty(k)) h[k] = extra[k]; } }
    return h;
  }

  /* ── Colonnes publiques (exclut password_hash) ── */
  var CONSULTANT_COLS = 'id,created_at,nom,prenom,email,telephone,titre,experience_annees,competences,disponibilite,tjm_min,tjm_max,notes_admin,statut';

  /* ── CRUD Supabase ── */

  /**
   * GET — Lecture avec query params.
   * @param {string} table  Nom de la table (ex: 'consultants')
   * @param {object|string} query  Objet clé/valeur ou string déjà encodé
   * @returns {Promise<Array>}
   */
  async function sbFetch(table, query) {
    var qs = '';
    if (query) {
      if (typeof query === 'string') { qs = query; }
      else { qs = new URLSearchParams(query).toString(); }
    }
    var sep = qs ? '?' + qs : '';
    var response = await fetch(url() + '/rest/v1/' + table + sep, { headers: headers() });
    return response.json();
  }

  /**
   * GET — Alias legacy de sbFetch pour compatibilité (certains fichiers utilisent sbSelect).
   */
  async function sbSelect(table, query) {
    return sbFetch(table, query);
  }

  /**
   * POST — Insertion d'un enregistrement.
   * @param {string} table
   * @param {object} data
   * @returns {Promise<object>}
   */
  async function sbInsert(table, data) {
    var prefer = 'return=minimal';
    var qs = '';
    if (table === 'consultants') {
      prefer = 'return=representation';
      qs = '?select=' + CONSULTANT_COLS;
    } else {
      prefer = 'return=representation';
    }
    var response = await fetch(url() + '/rest/v1/' + table + qs, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json', 'Prefer': prefer }),
      body: JSON.stringify(data)
    });
    if (prefer === 'return=minimal') return { success: true };
    return response.json();
  }

  /**
   * PATCH — Mise à jour par id.
   * @param {string} table
   * @param {string} id
   * @param {object} data
   * @returns {Promise<boolean>}  true si succès
   */
  async function sbUpdate(table, id, data) {
    var response = await fetch(url() + '/rest/v1/' + table + '?id=eq.' + id, {
      method: 'PATCH',
      headers: headers({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }),
      body: JSON.stringify(data)
    });
    return response.ok;
  }

  /**
   * DELETE — Supprime une ligne par ID.
   * @param {string} table
   * @param {string} id
   * @returns {Promise<boolean>}  true si succès
   */
  async function sbDelete(table, id) {
    var response = await fetch(url() + '/rest/v1/' + table + '?id=eq.' + id, {
      method: 'DELETE',
      headers: headers({ 'Prefer': 'return=minimal' })
    });
    return response.ok;
  }

  /**
   * RPC — Appel d'une fonction PostgreSQL via PostgREST.
   * @param {string} fnName  Nom de la fonction (ex: 'verify_consultant_password')
   * @param {object} params  Paramètres de la fonction
   * @returns {Promise<any>}
   */
  async function sbRpc(fnName, params) {
    var response = await fetch(url() + '/rest/v1/rpc/' + fnName, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params || {})
    });
    return response.json();
  }

  /* ── Utilitaires données ── */

  /**
   * Parse un champ JSON (description, notes_admin, etc.) en objet.
   * Accepte string JSON, objet, ou null → retourne toujours un objet.
   */
  function parseNotes(raw) {
    if (!raw) return {};
    if (typeof raw === 'object') return raw;
    try { return JSON.parse(raw); } catch (e) { return {}; }
  }

  /**
   * Normalise un statut (enlève accents, lowercase, trim).
   */
  function normalizeStatus(value) {
    var raw = String(value || '').trim().toLowerCase();
    var basic = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (basic === 'approuve') return 'approuve';
    if (basic === 'refuse') return 'refuse';
    if (basic === 'en_attente') return 'en_attente';
    if (basic === 'en_mission') return 'en_mission';
    if (basic === 'inactif') return 'inactif';
    return basic;
  }

  /**
   * SHA-256 hash → hex string (pour authentification).
   */
  async function sha256Hex(text) {
    var value = String(text || '');
    var bytes = new TextEncoder().encode(value);
    var hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hashBuffer))
      .map(function (b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  }

  /* ── Export global ── */
  window.ExpertSB = {
    sbFetch: sbFetch,
    sbSelect: sbSelect,
    sbInsert: sbInsert,
    sbUpdate: sbUpdate,
    sbRpc: sbRpc,
    sbDelete: sbDelete,
    parseNotes: parseNotes,
    normalizeStatus: normalizeStatus,
    sha256Hex: sha256Hex,
    CONSULTANT_COLS: CONSULTANT_COLS
  };

  // Rendre disponible globalement pour compatibilité avec le code inline existant
  if (!window.sbFetch) window.sbFetch = sbFetch;
  if (!window.sbSelect) window.sbSelect = sbSelect;
  if (!window.sbInsert) window.sbInsert = sbInsert;
  if (!window.sbUpdate) window.sbUpdate = sbUpdate;
  if (!window.sbRpc) window.sbRpc = sbRpc;
  if (!window.sbDelete) window.sbDelete = sbDelete;
  if (!window.CONSULTANT_COLS) window.CONSULTANT_COLS = CONSULTANT_COLS;
  if (!window.parseNotes) window.parseNotes = parseNotes;
  if (!window.normalizeStatus) window.normalizeStatus = normalizeStatus;
  if (!window.sha256Hex) window.sha256Hex = sha256Hex;
})();
