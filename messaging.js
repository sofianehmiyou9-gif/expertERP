/**
 * ExpertERP - Messaging Module
 * Gere les conversations entre consultants et entreprises
 * via la table Supabase "messages".
 * Depend de config.js (ExpertConfig.SB_URL, ExpertConfig.SB_KEY)
 */
(function () {
  'use strict';

  if (!window.ExpertConfig || !ExpertConfig.SB_URL || !ExpertConfig.SB_KEY) {
    console.error('[Messaging] ExpertConfig manquant.');
    return;
  }

  var BASE = ExpertConfig.SB_URL + '/rest/v1/messages';
  var HEADERS = {
    'apikey': ExpertConfig.SB_KEY,
    'Authorization': 'Bearer ' + ExpertConfig.SB_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  /**
   * Genere un thread_id unique pour une conversation
   * entre deux emails (toujours le meme quel que soit l'ordre)
   */
  function makeThreadId(emailA, emailB) {
    var sorted = [emailA.toLowerCase(), emailB.toLowerCase()].sort();
    return sorted[0] + '::' + sorted[1];
  }

  /**
   * Envoie un message
   * @param {Object} opts
   * @param {string} opts.senderEmail
   * @param {string} opts.senderName
   * @param {string} opts.senderRole - 'consultant' ou 'entreprise'
   * @param {string} opts.receiverEmail
   * @param {string} opts.receiverName
   * @param {string} opts.body
   * @param {string} [opts.notificationId] - lien vers notification d'origine
   * @returns {Promise<{data: object|null, error: string|null}>}
   */
  async function send(opts) {
    var threadId = makeThreadId(opts.senderEmail, opts.receiverEmail);
    var row = {
      thread_id: threadId,
      sender_email: opts.senderEmail.toLowerCase(),
      sender_name: opts.senderName || null,
      sender_role: opts.senderRole || null,
      receiver_email: opts.receiverEmail.toLowerCase(),
      receiver_name: opts.receiverName || null,
      body: opts.body,
      read: false,
      notification_id: opts.notificationId || null
    };

    try {
      var resp = await fetch(BASE, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(row)
      });
      if (!resp.ok) {
        var err = await resp.text();
        console.error('[Messaging] Erreur envoi:', err);
        return { data: null, error: err };
      }
      var data = await resp.json();
      console.log('[Messaging] Message envoye dans thread', threadId);

      // Envoyer notification email si configuree
      if (window.ExpertEmailNotify) {
        ExpertEmailNotify.notify({
          to: opts.receiverEmail,
          toName: opts.receiverName,
          fromName: opts.senderName,
          fromEmail: opts.senderEmail,
          body: opts.body
        });
      }

      return { data: Array.isArray(data) ? data[0] : data, error: null };
    } catch (e) {
      console.error('[Messaging] Erreur reseau:', e);
      return { data: null, error: e.message };
    }
  }

  /**
   * Charge tous les messages d'un thread
   * @param {string} emailA
   * @param {string} emailB
   * @returns {Promise<Array>}
   */
  async function getThread(emailA, emailB) {
    var threadId = makeThreadId(emailA, emailB);
    try {
      var url = BASE + '?thread_id=eq.' + encodeURIComponent(threadId) + '&order=created_at.asc';
      var resp = await fetch(url, { headers: HEADERS });
      if (!resp.ok) return [];
      return await resp.json();
    } catch (e) {
      console.error('[Messaging] Erreur chargement thread:', e);
      return [];
    }
  }

  /**
   * Charge toutes les conversations d'un utilisateur
   * Retourne un objet { threadId: { messages: [...], other: {...} } }
   * @param {string} email
   * @returns {Promise<Array>} liste de conversations triees par dernier message
   */
  async function getConversations(email) {
    var emailLower = email.toLowerCase();
    try {
      var url = BASE + '?or=(sender_email.eq.' + encodeURIComponent(emailLower) +
        ',receiver_email.eq.' + encodeURIComponent(emailLower) + ')&order=created_at.desc';
      var resp = await fetch(url, { headers: HEADERS });
      if (!resp.ok) return [];
      var allMessages = await resp.json();

      // Grouper par thread
      var threads = {};
      allMessages.forEach(function (m) {
        if (!threads[m.thread_id]) {
          threads[m.thread_id] = {
            threadId: m.thread_id,
            messages: [],
            lastMessage: null,
            unreadCount: 0,
            otherEmail: m.sender_email === emailLower ? m.receiver_email : m.sender_email,
            otherName: m.sender_email === emailLower ? m.receiver_name : m.sender_name
          };
        }
        threads[m.thread_id].messages.push(m);
        if (!m.read && m.receiver_email === emailLower) {
          threads[m.thread_id].unreadCount++;
        }
      });

      // Dernier message par thread + trier
      var list = Object.values(threads);
      list.forEach(function (t) {
        t.messages.sort(function (a, b) { return new Date(a.created_at) - new Date(b.created_at); });
        t.lastMessage = t.messages[t.messages.length - 1];
        // Corriger otherName si null
        if (!t.otherName) {
          for (var i = 0; i < t.messages.length; i++) {
            var msg = t.messages[i];
            if (msg.sender_email !== emailLower && msg.sender_name) {
              t.otherName = msg.sender_name;
              break;
            }
            if (msg.receiver_email !== emailLower && msg.receiver_name) {
              t.otherName = msg.receiver_name;
              break;
            }
          }
        }
      });

      list.sort(function (a, b) {
        return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
      });

      return list;
    } catch (e) {
      console.error('[Messaging] Erreur chargement conversations:', e);
      return [];
    }
  }

  /**
   * Marque tous les messages d'un thread comme lus pour un receiver
   * @param {string} threadId
   * @param {string} receiverEmail
   */
  async function markThreadRead(threadId, receiverEmail) {
    try {
      // Use RPC function (SECURITY DEFINER) to bypass RLS
      var rpcUrl = ExpertConfig.SB_URL + '/rest/v1/rpc/mark_thread_read';
      var resp = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'apikey': ExpertConfig.SB_KEY,
          'Authorization': 'Bearer ' + ExpertConfig.SB_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_thread_id: threadId,
          p_receiver_email: receiverEmail.toLowerCase()
        })
      });
      if (!resp.ok) {
        var err = await resp.text();
        console.warn('[Messaging] Erreur markRead RPC:', err);
      } else {
        var count = await resp.json();
        console.log('[Messaging] markThreadRead:', count, 'messages marques lus');
      }
    } catch (e) {
      console.warn('[Messaging] Erreur markRead:', e);
    }
  }

  /**
   * Compte les messages non lus pour un utilisateur
   * @param {string} email
   * @returns {Promise<number>}
   */
  async function getUnreadCount(email) {
    try {
      var url = BASE + '?receiver_email=eq.' + encodeURIComponent(email.toLowerCase()) +
        '&read=eq.false&select=id';
      var resp = await fetch(url, {
        headers: {
          'apikey': ExpertConfig.SB_KEY,
          'Authorization': 'Bearer ' + ExpertConfig.SB_KEY,
          'Prefer': 'count=exact'
        }
      });
      var count = resp.headers.get('content-range');
      if (count) {
        var match = count.match(/\/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }
      var data = await resp.json();
      return Array.isArray(data) ? data.length : 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Synchronise les notifications (demandes de contact) vers la table messages
   * Crée des messages dans la table messages pour chaque notification qui n'a pas encore de message
   * @param {string} email - email de l'utilisateur pour charger ses notifications
   * @returns {Promise<number>} - nombre de messages synchronisés
   */
  async function syncFromNotifications(email) {
    var emailLower = email.toLowerCase();
    var syncedCount = 0;

    try {
      // Charger les notifications pour cet email (comme company_email OU consultant_email)
      var notificationsUrl = ExpertConfig.SB_URL + '/rest/v1/notifications' +
        '?or=(company_email.eq.' + encodeURIComponent(emailLower) +
        ',consultant_email.eq.' + encodeURIComponent(emailLower) + ')';

      console.log('[Messaging] Chargement notifications pour', emailLower);
      var resp = await fetch(notificationsUrl, { headers: HEADERS });
      if (!resp.ok) {
        console.warn('[Messaging] Erreur chargement notifications:', resp.status);
        return 0;
      }

      var notifications = await resp.json();
      if (!Array.isArray(notifications)) {
        console.log('[Messaging] Pas de notifications');
        return 0;
      }

      console.log('[Messaging] Traitant', notifications.length, 'notifications');

      // Pour chaque notification, créer les messages correspondants
      for (var i = 0; i < notifications.length; i++) {
        var notif = notifications[i];

        // Message initial (company -> consultant)
        if (notif.message) {
          var threadId = makeThreadId(notif.company_email, notif.consultant_email);
          var existingCheck = await checkMessageExists(threadId, notif.id, notif.message);

          if (!existingCheck) {
            var msg1 = {
              thread_id: threadId,
              sender_email: notif.company_email.toLowerCase(),
              sender_name: notif.company_name || null,
              sender_role: 'entreprise',
              receiver_email: notif.consultant_email.toLowerCase(),
              receiver_name: null,
              body: notif.message,
              read: false,
              notification_id: notif.id
            };

            await insertMessage(msg1);
            syncedCount++;
            console.log('[Messaging] Message initial créé pour notification', notif.id);
          }
        }

        // Message de réponse (consultant -> company)
        if (notif.reply) {
          var threadId = makeThreadId(notif.company_email, notif.consultant_email);
          var existingCheck = await checkMessageExists(threadId, notif.id, notif.reply);

          if (!existingCheck) {
            var msg2 = {
              thread_id: threadId,
              sender_email: notif.consultant_email.toLowerCase(),
              sender_name: null,
              sender_role: 'consultant',
              receiver_email: notif.company_email.toLowerCase(),
              receiver_name: null,
              body: notif.reply,
              read: false,
              notification_id: notif.id,
              created_at: notif.reply_at
            };

            await insertMessage(msg2);
            syncedCount++;
            console.log('[Messaging] Message réponse créé pour notification', notif.id);
          }
        }
      }

      console.log('[Messaging] Sync terminée:', syncedCount, 'messages créés');
      return syncedCount;
    } catch (e) {
      console.error('[Messaging] Erreur synchronisation notifications:', e);
      return 0;
    }
  }

  /**
   * Vérifie si un message existe déjà pour cette notification
   * @private
   */
  async function checkMessageExists(threadId, notificationId, body) {
    try {
      var url = BASE + '?thread_id=eq.' + encodeURIComponent(threadId) +
        '&notification_id=eq.' + encodeURIComponent(notificationId) +
        '&body=eq.' + encodeURIComponent(body);
      var resp = await fetch(url, { headers: HEADERS });
      if (!resp.ok) return false;
      var data = await resp.json();
      return Array.isArray(data) && data.length > 0;
    } catch (e) {
      return false;
    }
  }

  /**
   * Insère un message dans la table messages
   * @private
   */
  async function insertMessage(row) {
    try {
      var resp = await fetch(BASE, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(row)
      });
      if (!resp.ok) {
        var err = await resp.text();
        console.error('[Messaging] Erreur insertion message:', err);
        throw new Error(err);
      }
      return await resp.json();
    } catch (e) {
      console.error('[Messaging] Erreur insertMessage:', e);
      throw e;
    }
  }

  // API publique
  window.ExpertMessaging = {
    send: send,
    getThread: getThread,
    getConversations: getConversations,
    markThreadRead: markThreadRead,
    getUnreadCount: getUnreadCount,
    makeThreadId: makeThreadId,
    syncFromNotifications: syncFromNotifications
  };

  console.log('[Messaging] Module initialise.');
})();
