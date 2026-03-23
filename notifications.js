(function () {
  'use strict';
  var LS_KEY = 'experterp_notifications';
  var _cache = [];      // in-memory cache after Supabase fetch
  var _loaded = false;  // true once Supabase data has been fetched

  function cfg() {
    return window.ExpertConfig || {};
  }
  function sbUrl() { return cfg().SB_URL || ''; }
  function sbKey() { return cfg().SB_KEY || ''; }
  function hasSB() { return !!(sbUrl() && sbKey()); }

  function uid() {
    return 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }

  // -- localStorage fallback --
  function lsGet() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function lsSave(list) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  // -- Supabase REST helpers --
  function sbHeaders() {
    return {
      'apikey': sbKey(),
      'Authorization': 'Bearer ' + sbKey(),
      'Content-Type': 'application/json'
    };
  }

  async function sbFetchNotifications(filters) {
    if (!hasSB()) return null;
    var params = new URLSearchParams(filters || {});
    params.set('select', '*');
    params.set('order', 'created_at.desc');
    try {
      var r = await fetch(sbUrl() + '/rest/v1/notifications?' + params.toString(), {
        headers: { 'apikey': sbKey(), 'Authorization': 'Bearer ' + sbKey() }
      });
      if (!r.ok) { console.warn('[Notif] Supabase fetch failed:', r.status); return null; }
      return await r.json();
    } catch (e) {
      console.warn('[Notif] Supabase fetch error:', e);
      return null;
    }
  }

  async function sbInsertNotif(notif) {
    if (!hasSB()) return false;
    try {
      var r = await fetch(sbUrl() + '/rest/v1/notifications', {
        method: 'POST',
        headers: Object.assign({}, sbHeaders(), { 'Prefer': 'return=representation' }),
        body: JSON.stringify(notif)
      });
      if (r.ok) {
        var rows = await r.json();
        return rows && rows[0] ? rows[0] : notif;
      }
      console.warn('[Notif] Supabase insert failed:', r.status);
      return false;
    } catch (e) {
      console.warn('[Notif] Supabase insert error:', e);
      return false;
    }
  }

  async function sbPatchNotif(id, patch) {
    if (!hasSB()) return false;
    try {
      var r = await fetch(sbUrl() + '/rest/v1/notifications?id=eq.' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: Object.assign({}, sbHeaders(), { 'Prefer': 'return=representation' }),
        body: JSON.stringify(patch)
      });
      if (r.ok) return true;
      // If id is not UUID, try matching on old string id
      var r2 = await fetch(sbUrl() + '/rest/v1/notifications?old_id=eq.' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: Object.assign({}, sbHeaders(), { 'Prefer': 'return=representation' }),
        body: JSON.stringify(patch)
      });
      return r2.ok;
    } catch (e) {
      console.warn('[Notif] Supabase patch error:', e);
      return false;
    }
  }

  // -- Normalize a notification row from Supabase --
  function normalize(row) {
    return {
      id: row.id || row.old_id || uid(),
      old_id: row.old_id || null,
      consultantId: row.consultant_id || row.consultantId || null,
      consultantEmail: row.consultant_email || row.consultantEmail || '',
      recipientType: row.recipient_type || row.recipientType || 'consultant',
      recipientEmail: row.recipient_email || row.recipientEmail || '',
      companyName: row.company_name || row.companyName || '',
      companyEmail: row.company_email || row.companyEmail || '',
      companyPhone: row.company_phone || row.companyPhone || null,
      companyId: row.company_id || row.companyId || '',
      message: row.message || '',
      reply: row.reply || '',
      reply_at: row.reply_at || null,
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      read: row.read !== undefined ? !!row.read : (row.status === 'lu' || row.status === 'repondu'),
      status: row.status || (row.read ? 'lu' : 'nouveau'),
      type: row.type || 'message'
    };
  }

  // -- Convert app notification to Supabase row --
  function toDbRow(n) {
    return {
      old_id: String(n.id || ''),
      consultant_id: n.consultantId || null,
      consultant_email: n.consultantEmail || '',
      recipient_type: n.recipientType || 'consultant',
      recipient_email: n.recipientEmail || '',
      company_name: n.companyName || '',
      company_email: n.companyEmail || '',
      company_phone: n.companyPhone || null,
      company_id: n.companyId || '',
      message: n.message || '',
      reply: n.reply || '',
      reply_at: n.reply_at || null,
      read: !!n.read,
      status: n.status || 'nouveau',
      type: n.type || 'message',
      created_at: n.createdAt || new Date().toISOString()
    };
  }

  // -- Main data accessor (returns cache or localStorage) --
  function getAll() {
    return _loaded ? _cache : lsGet();
  }

  // -- Load from Supabase (call once on page load) --
  async function loadFromSupabase(consultantId, consultantEmail) {
    var filters = {};
    // Build OR filter for consultant
    if (consultantId && consultantEmail) {
      filters['or'] = '(consultant_id.eq.' + consultantId + ',consultant_email.eq.' + consultantEmail + ')';
    } else if (consultantId) {
      filters['consultant_id'] = 'eq.' + consultantId;
    } else if (consultantEmail) {
      filters['consultant_email'] = 'eq.' + consultantEmail;
    }

    var rows = await sbFetchNotifications(filters);
    if (rows !== null) {
      _cache = rows.map(normalize);
      _loaded = true;
      // Also update localStorage as cache
      lsSave(_cache);
      console.log('[Notif] Loaded', _cache.length, 'notifications from Supabase');
      return _cache;
    }
    // Fallback to localStorage
    _cache = lsGet();
    _loaded = true;
    return _cache;
  }

  // -- Load messages for an enterprise (by companyEmail) --
  async function loadByCompanyEmail(companyEmail) {
    if (!companyEmail) return [];
    var rows = await sbFetchNotifications({ 'company_email': 'eq.' + companyEmail });
    if (rows !== null) return rows.map(normalize);
    return [];
  }

  // -- Push a new notification --
  async function push(notification) {
    var normalized = {
      id: notification.id || uid(),
      status: notification.status || (notification.read ? 'lu' : 'nouveau'),
      read: !!notification.read,
      type: notification.type || 'message',
      createdAt: notification.createdAt || new Date().toISOString(),
      reply: '',
      reply_at: null
    };
    // Merge all fields
    for (var k in notification) {
      if (notification.hasOwnProperty(k) && normalized[k] === undefined) {
        normalized[k] = notification[k];
      }
    }

    // Try Supabase first
    var dbRow = toDbRow(normalized);
    var inserted = await sbInsertNotif(dbRow);
    if (inserted && inserted.id) {
      normalized.id = inserted.id; // Use Supabase UUID
      normalized.old_id = inserted.old_id;
    }

    // Update cache + localStorage
    _cache.unshift(normalize(normalized));
    lsSave(_cache);
    return normalized;
  }

  function byConsultant(consultantId, consultantEmail) {
    return getAll().filter(function(n) {
      if (consultantId && String(n.consultantId) === String(consultantId)) return true;
      if (consultantEmail && n.consultantEmail === consultantEmail) return true;
      return false;
    });
  }

  function getById(id) {
    return getAll().find(function(n) {
      return String(n.id) === String(id) || String(n.old_id) === String(id);
    }) || null;
  }

  async function update(id, patch) {
    var all = getAll();
    var idx = all.findIndex(function(n) {
      return String(n.id) === String(id) || String(n.old_id) === String(id);
    });
    if (idx < 0) return null;
    for (var k in patch) {
      if (patch.hasOwnProperty(k)) all[idx][k] = patch[k];
    }
    _cache = all;
    lsSave(all);

    // Sync to Supabase
    var dbPatch = {};
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.read !== undefined) dbPatch.read = patch.read;
    if (patch.reply !== undefined) dbPatch.reply = patch.reply;
    if (patch.reply_at !== undefined) dbPatch.reply_at = patch.reply_at;
    if (Object.keys(dbPatch).length > 0) {
      await sbPatchNotif(all[idx].id, dbPatch);
    }
    return all[idx];
  }

  async function setStatus(id, status) {
    var patch = { status: status };
    if (status === 'lu') patch.read = true;
    if (status === 'nouveau') patch.read = false;
    return await update(id, patch);
  }

  async function reply(id, replyText) {
    return await update(id, {
      reply: replyText,
      reply_at: new Date().toISOString(),
      status: 'repondu',
      read: true
    });
  }

  function countsByConsultant(consultantId, consultantEmail) {
    var list = byConsultant(consultantId, consultantEmail);
    return {
      total: list.length,
      nouveau: list.filter(function(n) { return n.status === 'nouveau' || (!n.read && n.status !== 'repondu'); }).length,
      lu: list.filter(function(n) { return n.status === 'lu'; }).length,
      repondu: list.filter(function(n) { return n.status === 'repondu'; }).length
    };
  }

  async function markAllRead(consultantId, consultantEmail) {
    var all = getAll().map(function(n) {
      if ((consultantId && String(n.consultantId) === String(consultantId)) || (consultantEmail && n.consultantEmail === consultantEmail)) {
        if (n.status !== 'repondu') {
          sbPatchNotif(n.id, { status: 'lu', read: true });
          return Object.assign({}, n, { read: true, status: 'lu' });
        }
      }
      return n;
    });
    _cache = all;
    lsSave(all);
  }

  window.ExpertNotifications = {
    getAll: getAll,
    push: push,
    byConsultant: byConsultant,
    getById: getById,
    update: update,
    setStatus: setStatus,
    reply: reply,
    countsByConsultant: countsByConsultant,
    markAllRead: markAllRead,
    loadFromSupabase: loadFromSupabase,
    loadByCompanyEmail: loadByCompanyEmail
  };
})();
