/**
 * ExpertERPHub - Configuration centralisee
 * Toutes les constantes Supabase et parametres globaux
 */
(function () {
  'use strict';

  var SB_URL = 'https://aqvkcbeezzbmoiykzfyo.supabase.co';
  var SB_KEY = 'sb_publishable_3ZOOWdx35IRT6UocT_s9PQ_hI0Yrbim';

  // Email(s) autorise(s) pour l'acces admin
  var ADMIN_EMAILS = [
    'sofianehmiyou9@gmail.com'
  ];

  // Secret pour generation de tokens d'acces (SÉCURITÉ v2)
  var ACCESS_TOKEN_SECRET = 'erphub_secure_2026';

  window.ExpertConfig = {
    SB_URL: SB_URL,
    SB_KEY: SB_KEY,
    ADMIN_EMAILS: ADMIN_EMAILS,
    ACCESS_TOKEN_SECRET: ACCESS_TOKEN_SECRET
  };
})();
