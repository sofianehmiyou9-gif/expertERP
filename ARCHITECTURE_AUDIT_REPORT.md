# ExpertERPHUB Cross-File Architecture Audit Report

## Executive Summary

The ExpertERPHUB project exhibits a **monolithic HTML + inline JavaScript architecture** with significant duplicated logic across files. The codebase contains ~15,000 lines across 11 HTML files with minimal modularization. Critical issues include:

- **4 duplicate implementations** of core utilities (sha256Hex, sbFetch, parseNotes, normalizeStatus)
- **No shared data layer** — Supabase REST calls duplicated across multiple files
- **Inconsistent patterns** for session management, i18n, and Supabase operations
- **Large unstructured script blocks** in HTML files (1000+ lines in dashboard files)
- **Script loading order dependencies** that are fragile and undocumented

**Severity Assessment:** HIGH — The current architecture makes maintenance difficult, introduces bugs from copy-paste inconsistencies, and creates security risks from duplicated credential handling.

---

## FINDING 1: DUPLICATED SUPABASE CONFIGURATION & HELPERS

### Files Involved
- dashboard-entreprise.html (lines 862–903)
- dashboard-consultant.html (lines 858–900)
- reset-password.html (lines 65–124)
- index.html (lines 2918-2919 imports config.js, but duplicate SB_URL/SB_KEY in scripts)
- config.js (single source — but NOT always used)
- notifications.js (redefines config access)

### Severity
**CRITICAL**

### Description

**Supabase URL and Key** are hardcoded or re-accessed in multiple places:

```javascript
// In dashboard-entreprise.html line 863:
const SB_URL = window.ExpertConfig ? ExpertConfig.SB_URL : 'https://aqvkcbeezzbmoiykzfyo.supabase.co';
const SB_KEY = window.ExpertConfig ? ExpertConfig.SB_KEY : 'sb_publishable_3ZOOWdx35IRT6UocT_s9PQ_hI0Yrbim';

// IDENTICAL in dashboard-consultant.html, reset-password.html, index.html
```

This creates:
1. **Fallback credentials in 4 files** — if one is compromised, the secret key is exposed in multiple places
2. **No consistency guarantee** — files may load config.js at different times
3. **Script load order issues** — if config.js fails to load, fallback keys are used silently

**Supabase REST helpers** (sbFetch, sbInsert, sbUpdate) are also duplicated:
- dashboard-entreprise.html: defines sbFetch, sbInsert, sbUpdate (lines ~950-1010)
- dashboard-consultant.html: defines sbFetch, sbUpdate (lines ~950-1000)
- reset-password.html: defines sbSelect, sbUpdate (lines 115–138)
- notifications.js: defines sbFetchNotifications, sbInsertNotif, sbPatchNotif (lines 36–93)

Each implementation has **slightly different signatures and error handling**, creating maintenance burden.

### Refactoring Suggestion

**Create a new file: `/supabase-client.js`**

```javascript
(function () {
  'use strict';

  function cfg() {
    return window.ExpertConfig || {};
  }
  function sbUrl() { return cfg().SB_URL || ''; }
  function sbKey() { return cfg().SB_KEY || ''; }
  function hasSB() { return !!(sbUrl() && sbKey()); }

  function sbHeaders(extra = {}) {
    return Object.assign({
      'apikey': sbKey(),
      'Authorization': 'Bearer ' + sbKey(),
      'Content-Type': 'application/json'
    }, extra);
  }

  // Generic REST fetch
  async function sbFetch(table, query = {}) {
    const params = new URLSearchParams(query);
    const response = await fetch(`${sbUrl()}/rest/v1/${table}?${params}`, {
      headers: sbHeaders()
    });
    if (!response.ok) throw new Error(`Supabase fetch failed: ${response.status}`);
    return response.json();
  }

  // Generic REST select with where clause
  async function sbSelect(table, query) {
    const response = await fetch(`${sbUrl()}/rest/v1/${table}?${query}`, {
      headers: sbHeaders()
    });
    if (!response.ok) throw new Error('Supabase select failed');
    return response.json();
  }

  // POST insert
  async function sbInsert(table, data) {
    const response = await fetch(`${sbUrl()}/rest/v1/${table}`, {
      method: 'POST',
      headers: sbHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Supabase insert failed');
    return response.json();
  }

  // PATCH update
  async function sbUpdate(table, id, data) {
    const response = await fetch(`${sbUrl()}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Supabase update failed');
    return response.ok;
  }

  // DELETE
  async function sbDelete(table, id) {
    const response = await fetch(`${sbUrl()}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: sbHeaders()
    });
    return response.ok;
  }

  window.ExpertSupabaseClient = {
    sbFetch,
    sbSelect,
    sbInsert,
    sbUpdate,
    sbDelete,
    hasSB
  };
})();
```

**Update HTML files to load this before other scripts:**
```html
<script src="config.js"></script>
<script src="supabase-client.js"></script>
```

**Remove all duplicate sbFetch/sbInsert/sbUpdate definitions from HTML files.**

---

## FINDING 2: UTILITY FUNCTIONS DUPLICATED ACROSS FILES

### Files Involved
- `utils.js` (lines 1–92) — defines safe(), formatDate(), isAdminEmail(), checkAdminAccess()
- `inscription-consultant.js` (lines 9–16) — redefines escapeHtml() identical to safe()
- `dashboard-entreprise.html` (inline) — redefines parseNotes(), normalizeStatus()
- `dashboard-consultant.html` (inline) — redefines parseNotes(), normalizeToken()
- `consultant.html` (inline) — redefines parseNotes()
- `reset-password.html` (inline) — redefines safeJsonParse()
- `index.html` (inline) — redefines sha256Hex()

### Severity
**HIGH**

### Description

**parseNotes()** appears in 4 separate locations:
- dashboard-entreprise.html
- dashboard-consultant.html
- consultant.html
- notifications.js

Implementation is consistent, but having 4 copies means:
1. Bug fixes must happen in 4 places
2. Risk of divergent behavior
3. Increases bundle size

**escapeHtml() vs safe()** are functionally identical:
```javascript
// inscription-consultant.js
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// utils.js already has safe() that does the same thing
```

### Refactoring Suggestion

**Create a new file: `/helpers.js`**

```javascript
(function () {
  'use strict';

  function parseNotes(raw) {
    if (!raw) return {};
    if (typeof raw === 'object') return raw;
    try { return JSON.parse(raw); } catch (e) { return {}; }
  }

  function safeJsonParse(raw, fallback = {}) {
    if (!raw) return fallback;
    if (typeof raw === 'object') return raw;
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }

  function normalizeStatus(value) {
    const raw = String(value || '').trim().toLowerCase();
    const basic = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (basic === 'approuve') return 'approuve';
    if (basic === 'refuse') return 'refuse';
    if (basic === 'en_attente') return 'en_attente';
    if (basic === 'en_mission') return 'en_mission';
    return basic;
  }

  function normalizeToken(v) {
    return String(v || '').trim().toLowerCase();
  }

  function normalizeRole(role) {
    const value = String(role || '').toLowerCase();
    if (value === 'company') return 'entreprise';
    return value;
  }

  window.ExpertHelpers = {
    parseNotes,
    safeJsonParse,
    normalizeStatus,
    normalizeToken,
    normalizeRole
  };
})();
```

**Update utils.js export to include these, OR create helpers.js and load it after utils.js:**
```html
<script src="config.js"></script>
<script src="utils.js"></script>
<script src="helpers.js"></script>
```

**Remove all inline parseNotes() and similar definitions from HTML files.**

---

## FINDING 3: SHA256 HASHING FUNCTION DUPLICATED

### Files Involved
- dashboard-entreprise.html
- dashboard-consultant.html
- reset-password.html
- index.html

### Severity
**HIGH**

### Description

The `sha256Hex()` function is implemented identically in 4 places:

```javascript
async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(String(text || ''));
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
```

This is a **security-sensitive operation** — password hashing. Having 4 copies:
1. Increases maintenance burden
2. Creates inconsistency risk (one file gets patched, others don't)
3. Should be in a centralized, verified location

### Refactoring Suggestion

**Create a new file: `/crypto-utils.js`**

```javascript
(function () {
  'use strict';

  async function sha256Hex(text) {
    const bytes = new TextEncoder().encode(String(text || ''));
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  window.ExpertCrypto = { sha256Hex };
})();
```

**Load before any file that uses it:**
```html
<script src="config.js"></script>
<script src="crypto-utils.js"></script>
<script src="dashboard-consultant.html"></script>
```

---

## FINDING 4: SESSION MANAGEMENT LOGIC SPREAD ACROSS FILES

### Files Involved
- portal-auth.js (session storage, getDashboardUrl)
- reset-password.html (persistPortalSession function inline)
- dashboard-consultant.html (initAuth, authenticate, persistPortalSession logic inline)

### Severity
**HIGH**

### Description

**Session persistence** is inconsistently handled:

1. **portal-auth.js** defines:
   - getSession(), setSession(), clearSession()
   - Uses localStorage key: 'experterp_portal_session'
   - TTL: 8 hours

2. **reset-password.html** has inline logic to update password but no session sync
   - Does not call ExpertPortalAuth to update session after password change

3. **dashboard-consultant.html** has inline persistPortalSession():
   ```javascript
   function persistPortalSession(email) {
     if (window.ExpertPortalAuth && email) {
       ExpertPortalAuth.setSession({ role: 'consultant', email: email });
     }
   }
   ```
   This duplicates logic already in portal-auth.js

**Risk:** Multiple code paths modify localStorage, creating inconsistency.

### Refactoring Suggestion

**Extend portal-auth.js** with helper functions:

```javascript
// Add to portal-auth.js
function persistSession(role, email, extra) {
  return setSession({ role, email, ...extra });
}

function clearAndLogout() {
  clearSession();
  window.location.href = 'index.html';
}

// Export these new helpers
window.ExpertPortalAuth.persistSession = persistSession;
window.ExpertPortalAuth.clearAndLogout = clearAndLogout;
```

**Remove all inline persistPortalSession() definitions** and use `ExpertPortalAuth.persistSession()` instead.

---

## FINDING 5: I18N LOGIC INCONSISTENCY

### Files Involved
- i18n.js (single source)
- dashboard-entreprise.html (uses applyI18n, but defines setLanguage inline)
- dashboard-consultant.html (uses applyI18n, but defines setLanguage inline)

### Severity
**MEDIUM**

### Description

**i18n.js provides** getLang(), setLang(), t(), applyByDataAttr()

**But dashboard files define inline:**
```javascript
function setLanguage(lang) {
  ExpertI18n.setLang(lang);
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('lang-' + lang);
  if (btn) btn.classList.add('active');
  applyI18n();
}

function applyI18n() {
  const t = (k) => ExpertI18n.t(k);
  // ... updates 20+ DOM elements
}
```

This is **NOT in i18n.js**, forcing each dashboard to:
1. Reimplement setLanguage with DOM element management
2. Reimplement applyI18n with hardcoded element IDs
3. Maintain consistency manually

### Refactoring Suggestion

**Extend i18n.js** to handle UI state management:

```javascript
// Add to i18n.js after the DICT definition:

function setLanguageAndApply(lang) {
  setLang(lang);
  
  // Update active language button
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('lang-' + lang);
  if (btn) btn.classList.add('active');
  
  // Trigger any registered callback
  if (window.onLanguageChange) window.onLanguageChange(lang);
}

window.ExpertI18n.setLanguageAndApply = setLanguageAndApply;
```

**In dashboard files**, use:
```javascript
ExpertI18n.setLanguageAndApply('fr');
```

Instead of separate `setLanguage()` and `applyI18n()` calls.

---

## FINDING 6: INCONSISTENT SCRIPT LOADING ORDER

### Files Involved
- All HTML files

### Severity
**MEDIUM**

### Description

Script loading order varies across files and is **undocumented**:

**index.html (lines 2918–2922):**
```html
<script src="config.js"></script>
<script src="utils.js"></script>
<script src="notifications.js"></script>
<script src="portal-auth.js"></script>
```

**consultant.html (lines 511–515):**
```html
<script src="config.js"></script>
<script src="portal-auth.js"></script>
<script src="utils.js"></script>
<script src="i18n.js"></script>
<script src="notifications.js"></script>
```

**dashboard-entreprise.html (lines 858–861):**
```html
<script src="config.js"></script>
<script src="utils.js"></script>
<script src="i18n.js"></script>
<script src="portal-auth.js"></script>
```

**Issues:**
1. **No documented dependencies** — unclear why order differs
2. **portal-auth loads AFTER utils in index.html**, but BEFORE in consultant.html
3. **Risk of breakage** — if a script references another in wrong order, errors occur silently

### Refactoring Suggestion

**Create a dependency manifest** (comment in config.js):
```html
<!-- LOAD ORDER (dependencies documented):
     1. config.js (defines ExpertConfig)
     2. utils.js (depends on ExpertConfig)
     3. portal-auth.js (no dependencies)
     4. i18n.js (no dependencies)
     5. helpers.js (depends on config)
     6. crypto-utils.js (no dependencies)
     7. supabase-client.js (depends on config.js)
     8. notifications.js (depends on supabase-client)
     9. [page-specific scripts] (depend on all above)
     10. cookie-consent.js (no dependencies, loads last)
-->
```

**Standardize all HTML files to this order** to eliminate ambiguity.

---

## FINDING 7: LARGE MONOLITHIC SCRIPT BLOCKS IN HTML

### Files Involved
- dashboard-entreprise.html (lines 862–2200+, ~1300 lines inline)
- dashboard-consultant.html (lines 858–2350+, ~1500 lines inline)
- index.html (lines 2918–5300+, ~2400 lines inline)

### Severity
**HIGH**

### Description

**Example: dashboard-entreprise.html**

Contains an **1300+ line inline script** that includes:
- Resource loading and rendering (loadResources)
- CSV import logic (parseCSVLine, processCSVFile)
- Status normalization (normalizeStatus)
- Form handlers (initQuickAddResourceForm)
- Rate formatting (formatRateRange)
- Photo/avatar generation
- Resource edit modal logic
- Visibility toggle (public/b2b)
- Company profile editing
- KPI rendering

All mixed together with no separation of concerns.

### Problems
1. **Not reusable** — code is locked in HTML files
2. **Not testable** — can't unit test without headless browser
3. **Maintenance nightmare** — 1300 lines to navigate
4. **No code organization** — related functions scattered throughout

### Refactoring Suggestion

**Extract dashboard logic into separate files:**

Create `/dashboard-entreprise.js` with:
```javascript
(function () {
  'use strict';

  let currentEmail = null;
  let currentCompany = null;
  let _allLoadedResources = [];

  async function loadResources() {
    const resources = await ExpertSupabaseClient.sbFetch('consultants', { select: '*' });
    // ... logic here
  }

  async function saveResourceEdit(resourceId, updates) {
    // ... logic here
  }

  async function handleCSVImport(file) {
    // ... logic here
  }

  window.ExpertDashboardEntreprise = {
    loadResources,
    saveResourceEdit,
    handleCSVImport,
    initUI: function() {
      // Initialize event listeners, load data
    }
  };
})();
```

**In the HTML file, replace 1300 lines with:**
```html
<script src="dashboard-entreprise.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    ExpertDashboardEntreprise.initUI();
  });
</script>
```

**Repeat for dashboard-consultant.html and index.html.**

---

## FINDING 8: GLOBAL VARIABLE POLLUTION

### Files Involved
- Multiple inline scripts

### Severity
**MEDIUM**

### Description

Global variables defined in multiple files without namespace:
- `currentEmail` (dashboard-consultant.html, dashboard-entreprise.html)
- `currentConsultant` (dashboard-consultant.html)
- `currentCompany` (dashboard-entreprise.html)
- `_allLoadedResources` (dashboard-entreprise.html)

If multiple dashboard files are loaded in same page (or in iframes), **namespace collision** occurs.

### Refactoring Suggestion

**Use namespaced objects:**

Instead of:
```javascript
let currentEmail = null;
let currentConsultant = null;
```

Use:
```javascript
window.ExpertDashboardState = window.ExpertDashboardState || {
  currentEmail: null,
  currentConsultant: null,
  currentCompany: null,
  allResources: []
};
```

Access via `ExpertDashboardState.currentEmail` instead of `currentEmail`.

---

## FINDING 9: MISSING ERROR HANDLING & LOGGING

### Files Involved
- All Supabase REST calls
- All async functions

### Severity
**MEDIUM**

### Description

**No centralized error handling:**

```javascript
// In notifications.js
async function sbFetchNotifications(filters) {
  if (!hasSB()) return null;
  try {
    var r = await fetch(...);
    if (!r.ok) { console.warn('[Notif] Supabase fetch failed:', r.status); return null; }
    return await r.json();
  } catch (e) {
    console.warn('[Notif] Supabase fetch error:', e);
    return null;
  }
}
```

**But in dashboard files:**
```javascript
// Different error handling pattern
async function sbFetch(table, query = {}) {
  const params = new URLSearchParams(query);
  const response = await fetch(...);
  return response.json(); // No error handling at all
}
```

### Refactoring Suggestion

**Create `/error-handler.js`:**

```javascript
(function () {
  'use strict';

  function logError(context, error, severity = 'warn') {
    const msg = `[${context}] ${error.message || String(error)}`;
    console[severity](msg);
    
    // Could also send to monitoring service (Sentry, LogRocket, etc.)
    if (window.ExpertErrorReporter) {
      window.ExpertErrorReporter.log({ context, error, severity });
    }
  }

  async function withErrorHandler(promise, context = 'ExpertERP') {
    try {
      return await promise;
    } catch (error) {
      logError(context, error, 'error');
      throw error; // Re-throw so caller can decide
    }
  }

  window.ExpertErrorHandler = { logError, withErrorHandler };
})();
```

---

## FINDING 10: NO SEPARATION OF CONCERNS IN LARGE FILES

### Files Involved
- reset-password.html (inline script handles: token parsing, Supabase calls, password hashing, UI updates all in one file)

### Severity
**MEDIUM**

### Description

reset-password.html mixes:
1. **Authentication logic** (token validation, password reset)
2. **UI logic** (showing/hiding form fields, messages)
3. **Crypto** (sha256Hex)
4. **API calls** (to Supabase auth and data tables)

All in one 250-line inline script with no structure.

### Refactoring Suggestion

Extract into `/password-reset.js`:
```javascript
(function () {
  'use strict';

  const PasswordReset = {
    token: '',
    
    async validateToken(tokenOrCode) {
      // Token validation logic
    },
    
    async updatePassword(password) {
      // Password update logic
    },
    
    renderUI(state) {
      // UI updates
    },
    
    init() {
      // Initialization
    }
  };

  window.ExpertPasswordReset = PasswordReset;
})();
```

---

## PRIORITY REFACTORING PLAN

### Phase 1: CRITICAL (Weeks 1–2)
**Impact: Eliminate security risks and major duplications**

1. **Create `/supabase-client.js`** — Centralize all Supabase REST calls
   - Effort: 2–3 hours
   - Impact: Remove duplicates in 4 files, reduce credentials exposure

2. **Create `/crypto-utils.js`** — Centralize sha256Hex
   - Effort: 30 minutes
   - Impact: Single source for password hashing

3. **Update all HTML files** to use new modules
   - Effort: 3–4 hours
   - Impact: Reduce bundle size, improve consistency

### Phase 2: HIGH (Weeks 3–4)
**Impact: Improve maintainability and reduce duplication**

1. **Create `/helpers.js`** — Centralize utility functions (parseNotes, normalizeStatus, etc.)
   - Effort: 2 hours
   - Impact: Single source for normalization logic, easier testing

2. **Extend `/i18n.js`** — Add UI state management functions
   - Effort: 1–2 hours
   - Impact: Eliminate setLanguage/applyI18n duplication in dashboards

3. **Extend `/portal-auth.js`** — Add session persistence helpers
   - Effort: 1 hour
   - Impact: Remove inline persistPortalSession() code

### Phase 3: MEDIUM (Weeks 5–7)
**Impact: Major architectural improvement**

1. **Extract dashboard logic into separate files:**
   - `/dashboard-entreprise.js` (extract 1300 lines from HTML)
   - `/dashboard-consultant.js` (extract 1500 lines from HTML)
   - `/index-page.js` (extract 2400 lines from HTML)
   - Effort: 4–6 hours
   - Impact: Reusable, testable code; 50% reduction in HTML file sizes

2. **Create error handling infrastructure** (`/error-handler.js`)
   - Effort: 2 hours
   - Impact: Consistent error handling and logging

3. **Namespace global variables** into ExpertDashboardState, etc.
   - Effort: 2 hours
   - Impact: Prevent namespace collisions

### Phase 4: LOW (Weeks 8–10)
**Impact: Polish and optimization**

1. **Document script dependencies** (create LOADING_ORDER.md)
   - Effort: 1 hour
   - Impact: Clear dependency graph for new developers

2. **Extract password reset logic** (`/password-reset.js`)
   - Effort: 1–2 hours
   - Impact: Reusable component for password flow

3. **Add unit tests** for extracted utilities
   - Effort: 4–6 hours
   - Impact: Regression prevention

---

## PROPOSED NEW FILE STRUCTURE

```
ExpertERPHUB/
├── index.html
├── consultant.html
├── dashboard-consultant.html
├── dashboard-entreprise.html
├── dashboard-admin.html
├── reset-password.html
├── recovery.html
├── inscription-consultant.html
├── [static pages: conditions.html, privacy.html, mentions.html]
│
├── config.js                    [EXISTING] Supabase credentials
├── utils.js                     [EXISTING] safe(), formatDate(), isAdminEmail()
├── i18n.js                      [EXTENDED] Add setLanguageAndApply()
├── portal-auth.js               [EXTENDED] Add persistSession(), clearAndLogout()
├── cookie-consent.js            [EXISTING] Cookie banner
├── notifications.js             [REFACTORED] Use supabase-client.js
├── inscription-consultant.js    [EXISTING] Use shared helpers
│
├── supabase-client.js           [NEW] Centralized Supabase REST client
├── crypto-utils.js              [NEW] sha256Hex() and related crypto
├── helpers.js                   [NEW] parseNotes(), normalizeStatus(), etc.
├── error-handler.js             [NEW] Centralized error handling & logging
├── password-reset.js            [NEW] Password reset flow logic
│
├── dashboard-consultant.js      [NEW] Extract from consultant.html
├── dashboard-entreprise.js      [NEW] Extract from entreprise.html
├── index-page.js                [NEW] Extract from index.html
│
└── tests/
    ├── supabase-client.test.js
    ├── helpers.test.js
    ├── crypto-utils.test.js
    └── ...
```

---

## ESTIMATED IMPACT

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Duplicate Functions** | 4 (sha256, sbFetch, parseNotes, normalizeStatus) | 0 | 100% |
| **Lines in HTML Files** | ~15,000 | ~7,000 | 53% reduction |
| **Hardcoded Supabase Keys** | 4 locations | 1 location | 75% reduction |
| **Script Loading Complexity** | Undocumented | Documented | 100% clarity |
| **Testable Code** | <10% | >80% | Major improvement |
| **Maintenance Burden** | Very High | Low | 60% reduction |

---

## SECURITY NOTES

1. **API Key Exposure:** Current hardcoded fallback keys in 4 files should be moved to environment variables or a secure config loader.
2. **Password Hashing:** Centralizing sha256Hex() makes it easier to audit and improve (e.g., add salt/pepper in future).
3. **Session Storage:** Clear documented session management reduces risk of session hijacking.

---

## RECOMMENDATIONS FOR IMMEDIATE ACTION

1. **Create LOADING_ORDER.md** — Document current dependencies
2. **Create supabase-client.js** — Remove fallback key duplication (CRITICAL)
3. **Create crypto-utils.js** — Single source for password hashing
4. **Update notifications.js** — Use new supabase-client.js instead of inline helpers
5. **Plan Phase 2** — Schedule dashboard extraction work

