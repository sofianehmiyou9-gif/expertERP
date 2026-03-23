/* cookie-consent.js — Bandeau cookie consent Loi 25 / PIPEDA
   Charge ce script sur toutes les pages : <script src="cookie-consent.js"></script>
   Sauvegarde le choix dans localStorage. Aucun cookie tiers n'est pose si refuse. */
(function() {
  'use strict';
  var STORAGE_KEY = 'experterp_cookie_consent';
  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch(e) {}
  if (saved === 'accepted' || saved === 'refused') return; // deja repondu

  // Creer le bandeau
  var banner = document.createElement('div');
  banner.id = 'cookie-consent-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Consentement cookies');
  banner.innerHTML =
    '<div style="max-width:960px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:16px;">' +
      '<div style="flex:1;min-width:260px;">' +
        '<strong style="font-size:.92rem;color:#0f172a;">Ce site utilise des cookies</strong>' +
        '<p style="font-size:.82rem;color:#475569;margin:4px 0 0;line-height:1.5;">Nous utilisons des cookies essentiels pour le fonctionnement du site et la sauvegarde de vos preferences. Aucun cookie publicitaire n\'est utilise. ' +
        '<a href="privacy.html" style="color:#2563eb;text-decoration:underline;">En savoir plus</a></p>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-shrink:0;">' +
        '<button id="cookie-refuse" style="padding:10px 20px;border-radius:999px;border:1px solid #d1d5db;background:#fff;color:#374151;font-size:.82rem;font-weight:600;cursor:pointer;font-family:inherit;">Refuser</button>' +
        '<button id="cookie-accept" style="padding:10px 20px;border-radius:999px;border:none;background:#2563eb;color:#fff;font-size:.82rem;font-weight:600;cursor:pointer;font-family:inherit;">Accepter</button>' +
      '</div>' +
    '</div>';

  // Style du bandeau
  banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(255,255,255,.97);backdrop-filter:blur(12px);border-top:1px solid #e5e7eb;padding:18px 24px;box-shadow:0 -4px 24px rgba(15,23,42,.08);font-family:"Inter","Manrope",sans-serif;animation:slideUpCookie .4s ease;';

  // Animation CSS
  var style = document.createElement('style');
  style.textContent = '@keyframes slideUpCookie{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}';
  document.head.appendChild(style);

  // Inserer dans le DOM
  document.body.appendChild(banner);

  function closeBanner(choice) {
    try { localStorage.setItem(STORAGE_KEY, choice); } catch(e) {}
    banner.style.animation = 'none';
    banner.style.transition = 'transform .3s ease, opacity .3s ease';
    banner.style.transform = 'translateY(100%)';
    banner.style.opacity = '0';
    setTimeout(function() { banner.remove(); }, 350);
  }

  document.getElementById('cookie-accept').addEventListener('click', function() {
    closeBanner('accepted');
  });
  document.getElementById('cookie-refuse').addEventListener('click', function() {
    closeBanner('refused');
  });
})();
