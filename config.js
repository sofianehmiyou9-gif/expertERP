/**
 * ExpertERP - Configuration centralisee
 * Toutes les constantes Supabase et parametres globaux
 */
(function () {
  'use strict';

  var SB_URL = 'https://aqvkcbeezzbmoiykzfyo.supabase.co';
  var SB_KEY = 'sb_publishable_3ZOOWdx35IRT6UocT_s9PQ_hI0Yrbim';

  // Hash SHA256 des emails admin (emails jamais exposés en clair côté client)
  var ADMIN_EMAIL_HASHES = [
    '7792ae42981e55ae24ebd958fddd60266a659707bb44e4bd1aedf0af10973835'
  ];

  // Hash du secret pour tokens d'acces (le secret original n'est JAMAIS expose cote client)
  // TODO: Replace 'a1b2c3d4e5f6' with a real SHA-256 hash if access tokens are implemented
  var ACCESS_TOKEN_HASH = 'a1b2c3d4e5f6';

  window.ExpertConfig = {
    SB_URL: SB_URL,
    SB_KEY: SB_KEY,
    ADMIN_EMAIL_HASHES: ADMIN_EMAIL_HASHES,
    ACCESS_TOKEN_HASH: ACCESS_TOKEN_HASH
  };
})();
