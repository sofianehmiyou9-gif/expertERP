(function () {
  const KEY = "experterp_notifications";

  function uid() {
    return "n_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  }

  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveAll(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function push(notification) {
    const all = getAll();
    const normalized = {
      id: notification.id || uid(),
      status: notification.status || (notification.read ? "lu" : "nouveau"),
      read: !!notification.read,
      type: notification.type || "message",
      createdAt: notification.createdAt || new Date().toISOString(),
      ...notification
    };
    all.unshift(normalized);
    saveAll(all);
    return normalized;
  }

  function byConsultant(consultantId, consultantEmail) {
    return getAll().filter((n) => {
      if (consultantId && String(n.consultantId) === String(consultantId)) return true;
      if (consultantEmail && n.consultantEmail === consultantEmail) return true;
      return false;
    });
  }

  function getById(id) {
    return getAll().find((n) => String(n.id) === String(id)) || null;
  }

  function update(id, patch) {
    const all = getAll();
    const idx = all.findIndex((n) => String(n.id) === String(id));
    if (idx < 0) return null;
    all[idx] = { ...all[idx], ...patch };
    saveAll(all);
    return all[idx];
  }

  function setStatus(id, status) {
    const patch = { status: status };
    if (status === "lu") patch.read = true;
    if (status === "nouveau") patch.read = false;
    return update(id, patch);
  }

  function countsByConsultant(consultantId, consultantEmail) {
    const list = byConsultant(consultantId, consultantEmail);
    return {
      total: list.length,
      nouveau: list.filter((n) => n.status === "nouveau" || !n.read).length,
      lu: list.filter((n) => n.status === "lu").length,
      repondu: list.filter((n) => n.status === "repondu").length
    };
  }

  function markAllRead(consultantId, consultantEmail) {
    const all = getAll().map((n) => {
      if ((consultantId && String(n.consultantId) === String(consultantId)) || (consultantEmail && n.consultantEmail === consultantEmail)) {
        return { ...n, read: true, status: n.status === "repondu" ? "repondu" : "lu" };
      }
      return n;
    });
    saveAll(all);
  }

  function removeByConsultant(consultantId, consultantEmail) {
    const all = getAll();
    const filtered = all.filter((n) => {
      const byId = consultantId && String(n.consultantId) === String(consultantId);
      const byEmail = consultantEmail && n.consultantEmail === consultantEmail;
      return !(byId || byEmail);
    });
    saveAll(filtered);
  }

  window.ExpertNotifications = {
    getAll: getAll,
    push: push,
    byConsultant: byConsultant,
    getById: getById,
    update: update,
    setStatus: setStatus,
    countsByConsultant: countsByConsultant,
    markAllRead: markAllRead,
    removeByConsultant: removeByConsultant
  };
})();
