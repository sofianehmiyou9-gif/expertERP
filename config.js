/**
 * ExpertERP - Configuration centralisee
 * Toutes les constantes Supabase et parametres globaux
 *
 * Environnements :
 *   PROD    → expert-erp.vercel.app (branche main)
 *   STAGING → preview Vercel auto-generee (branche dev)
 *   LOCAL   → localhost / fichier local
 *
 * Pour activer le staging, creer un 2e projet Supabase et renseigner
 * les clés STAGING ci-dessous. Tant qu'elles sont vides, le staging
 * utilise la meme base que la prod (safe pour tester le front).
 */
(function () {
  'use strict';

  // ── Credentials par environnement ──
  var PROD = {
    SB_URL: 'https://aqvkcbeezzbmoiykzfyo.supabase.co',
    SB_KEY: 'sb_publishable_3ZOOWdx35IRT6UocT_s9PQ_hI0Yrbim'
  };

  // Staging : remplir quand un 2e projet Supabase sera cree
  // En attendant, on fallback sur PROD (meme base, pas de risque)
  var STAGING = {
    SB_URL: '',
    SB_KEY: ''
  };

  // ── Detection automatique de l'environnement ──
  var host = window.location.hostname || '';
  var ENV = 'local';
  if (host === 'expert-erp.vercel.app') {
    ENV = 'production';
  } else if (host.endsWith('.vercel.app')) {
    ENV = 'staging';
  }

  // Choisir les credentials selon l'env
  var creds = PROD; // default = prod
  if (ENV === 'staging' && STAGING.SB_URL && STAGING.SB_KEY) {
    creds = STAGING;
  }

  // Hash SHA256 des emails admin (emails jamais exposés en clair côté client)
  var ADMIN_EMAIL_HASHES = [
    '7792ae42981e55ae24ebd958fddd60266a659707bb44e4bd1aedf0af10973835'
  ];

  // Hash du secret pour tokens d'acces (le secret original n'est JAMAIS expose cote client)
  // TODO: Replace 'a1b2c3d4e5f6' with a real SHA-256 hash if access tokens are implemented
  var ACCESS_TOKEN_HASH = 'a1b2c3d4e5f6';

  window.ExpertConfig = {
    ENV: ENV,
    SB_URL: creds.SB_URL,
    SB_KEY: creds.SB_KEY,
    ADMIN_EMAIL_HASHES: ADMIN_EMAIL_HASHES,
    ACCESS_TOKEN_HASH: ACCESS_TOKEN_HASH
  };

  if (ENV !== 'production') {
    console.log('[ExpertConfig] Environnement:', ENV, '| Supabase:', creds.SB_URL ? 'connecte' : 'non configure');
  }
})();
