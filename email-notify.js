/**
 * ExpertERPHub - Email Notification Module
 * Envoie des notifications par email quand un message est recu.
 * Utilise Vercel Serverless Function /api/send-email (Resend).
 * Depend de config.js
 */
(function () {
  'use strict';

  if (!window.ExpertConfig) {
    console.error('[EmailNotify] ExpertConfig manquant.');
    return;
  }

  // Utilise la fonction serverless Vercel /api/send-email (Resend)
  var EMAIL_API_URL = '/api/send-email';

  /**
   * Envoie une notification email via Edge Function
   * Si l'Edge Function n'est pas deployee, fallback silencieux.
   * @param {Object} opts
   * @param {string} opts.to - email destinataire
   * @param {string} opts.toName - nom destinataire
   * @param {string} opts.fromName - nom expediteur (affichage)
   * @param {string} opts.fromEmail - email expediteur (pour reply-to)
   * @param {string} opts.body - contenu du message
   */
  async function notify(opts) {
    var payload = {
      to: opts.to,
      subject: 'Nouveau message de ' + (opts.fromName || opts.fromEmail) + ' — ExpertERPHub',
      html: buildEmailHtml(opts)
    };

    try {
      var resp = await fetch(EMAIL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        console.log('[EmailNotify] Email envoye a', opts.to);
      } else {
        var errData = await resp.json().catch(function () { return {}; });
        console.warn('[EmailNotify] Erreur envoi email (status ' + resp.status + '):', errData);
      }
    } catch (e) {
      console.warn('[EmailNotify] API non accessible:', e.message);
    }
  }

  /**
   * Construit le HTML de l'email
   */
  function buildEmailHtml(opts) {
    return '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">' +
      '<div style="background:#1a3a5c;color:white;padding:20px;text-align:center;">' +
      '<h2 style="margin:0;">ExpertERPHub</h2>' +
      '</div>' +
      '<div style="padding:20px;background:#f9f9f9;">' +
      '<p>Bonjour' + (opts.toName ? ' ' + opts.toName : '') + ',</p>' +
      '<p><strong>' + (opts.fromName || opts.fromEmail) + '</strong> vous a envoye un message :</p>' +
      '<div style="background:white;border-left:4px solid #1a3a5c;padding:15px;margin:15px 0;">' +
      escapeHtml(opts.body) +
      '</div>' +
      '<p>Pour repondre, connectez-vous a votre tableau de bord :</p>' +
      '<a href="https://expert-erp.vercel.app/" style="display:inline-block;background:#1a3a5c;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;">Acceder a mon dashboard</a>' +
      '<p style="color:#888;font-size:12px;margin-top:20px;">Vous pouvez aussi repondre directement a ' +
      escapeHtml(opts.fromEmail) + '</p>' +
      '</div>' +
      '<div style="padding:10px;text-align:center;color:#aaa;font-size:11px;">' +
      'ExpertERPHub — Plateforme B2B de Staff Augmentation ERP' +
      '</div>' +
      '</div>';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/\n/g, '<br>');
  }

  window.ExpertEmailNotify = {
    notify: notify
  };

  console.log('[EmailNotify] Module initialise.');
})();
