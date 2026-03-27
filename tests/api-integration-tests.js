/**
 * ExpertERPHub - API Integration Tests
 * Tests the Supabase REST API with various endpoints and scenarios
 * Run with: node tests/api-integration-tests.js
 *
 * NOTE: This file is designed to run from your local machine or CI/CD environment
 * since direct external API calls may be blocked by proxy restrictions.
 */

'use strict';

/* ── Color codes for terminal output ── */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/* ── Configuration ── */
const SB_URL = 'https://aqvkcbeezzbmoiykzfyo.supabase.co';
const SB_ANON_KEY = 'sb_publishable_3ZOOWdx35IRT6UocT_s9PQ_hI0Yrbim';

/* ── Test counters ── */
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/* ── Utility functions ── */

/**
 * Helper to make API calls to Supabase REST API
 * @param {string} table - Table name (e.g., 'consultants')
 * @param {object} options - Request options
 * @returns {Promise<{status: number, data: any, ok: boolean}>}
 */
async function apiCall(table, options = {}) {
  const {
    method = 'GET',
    query = {},
    body = null,
    headers = {},
    includeApiKey = true
  } = options;

  let url = `${SB_URL}/rest/v1/${table}`;

  // Add query parameters
  if (Object.keys(query).length > 0) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      params.append(key, value);
    }
    url += '?' + params.toString();
  }

  const fetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  // Add authentication headers if requested
  if (includeApiKey) {
    fetchOptions.headers['apikey'] = SB_ANON_KEY;
    fetchOptions.headers['Authorization'] = `Bearer ${SB_ANON_KEY}`;
  }

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    return {
      status: response.status,
      ok: response.ok,
      data: data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      data: { error: error.message }
    };
  }
}

/**
 * Assert helper
 * @param {string} testName - Name of the test
 * @param {boolean} condition - Test condition (true = pass)
 * @param {string} message - Optional failure message
 */
function assert(testName, condition, message = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`${colors.green}✓ PASS${colors.reset} ${testName}`);
  } else {
    failedTests++;
    console.log(`${colors.red}✗ FAIL${colors.reset} ${testName}`);
    if (message) {
      console.log(`  ${colors.yellow}→${colors.reset} ${message}`);
    }
  }
}

/**
 * Print section header
 * @param {string} title - Section title
 */
function printSection(title) {
  console.log(`\n${colors.cyan}${'─'.repeat(70)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'─'.repeat(70)}${colors.reset}\n`);
}

/* ════════════════════════════════════════════════════════════════════════════════ */
/* ── TEST SUITE ── */
/* ════════════════════════════════════════════════════════════════════════════════ */

async function runTests() {
  console.log(`${colors.blue}${'═'.repeat(70)}${colors.reset}`);
  console.log(`${colors.blue}ExpertERPHub - API Integration Test Suite${colors.reset}`);
  console.log(`${colors.blue}Supabase REST API Testing${colors.reset}`);
  console.log(`${colors.blue}${'═'.repeat(70)}${colors.reset}\n`);

  /* ── TEST 1: GET /rest/v1/consultants ── */
  printSection('TEST 1: GET /rest/v1/consultants - List All Consultants');

  const consultantsRes = await apiCall('consultants');
  assert(
    'Should retrieve consultants list',
    consultantsRes.ok && Array.isArray(consultantsRes.data),
    consultantsRes.ok ? '' : `HTTP ${consultantsRes.status}: ${JSON.stringify(consultantsRes.data).substring(0, 100)}`
  );

  if (consultantsRes.ok && Array.isArray(consultantsRes.data)) {
    assert(
      'Consultants list should be an array',
      Array.isArray(consultantsRes.data),
      ''
    );

    assert(
      'Consultants list should have expected fields',
      consultantsRes.data.length === 0 || (
        'id' in consultantsRes.data[0] &&
        'prenom' in consultantsRes.data[0] &&
        'nom' in consultantsRes.data[0]
      ),
      `Expected fields: id, prenom, nom. Got: ${Object.keys(consultantsRes.data[0] || {}).join(', ')}`
    );

    console.log(`${colors.cyan}ℹ Found ${consultantsRes.data.length} consultant(s)${colors.reset}\n`);
  }

  /* ── TEST 2: GET /rest/v1/consultants with email filter ── */
  printSection('TEST 2: GET /rest/v1/consultants - Filter by Email');

  const emailFilterRes = await apiCall('consultants', {
    query: { 'email': 'eq.test@example.com' }
  });

  assert(
    'Should handle email filter without error',
    emailFilterRes.ok || emailFilterRes.status === 200,
    `HTTP ${emailFilterRes.status}`
  );

  assert(
    'Should return array with email filter',
    Array.isArray(emailFilterRes.data),
    `Expected array, got: ${typeof emailFilterRes.data}`
  );

  /* ── TEST 3: GET /rest/v1/consultants with ERP filter ── */
  printSection('TEST 3: GET /rest/v1/consultants - Filter by ERP');

  const erpFilterRes = await apiCall('consultants', {
    query: { 'erp_specialite': 'eq.SAP' }
  });

  assert(
    'Should handle ERP filter without error',
    erpFilterRes.ok || erpFilterRes.status === 200,
    `HTTP ${erpFilterRes.status}`
  );

  assert(
    'Should return array with ERP filter',
    Array.isArray(erpFilterRes.data),
    `Expected array, got: ${typeof erpFilterRes.data}`
  );

  /* ── TEST 4: GET /rest/v1/entreprises ── */
  printSection('TEST 4: GET /rest/v1/entreprises - List All Companies');

  const entreprisesRes = await apiCall('entreprises');

  assert(
    'Should retrieve entreprises list',
    entreprisesRes.ok && Array.isArray(entreprisesRes.data),
    entreprisesRes.ok ? '' : `HTTP ${entreprisesRes.status}`
  );

  if (entreprisesRes.ok && Array.isArray(entreprisesRes.data)) {
    assert(
      'Entreprises list should be an array',
      Array.isArray(entreprisesRes.data),
      ''
    );
    console.log(`${colors.cyan}ℹ Found ${entreprisesRes.data.length} company/companies${colors.reset}\n`);
  }

  /* ── TEST 5: Security - Sensitive Fields in notes_admin ── */
  printSection('TEST 5: Security - Sensitive Fields Access Control');

  const securityCheckRes = await apiCall('consultants');

  if (securityCheckRes.ok && Array.isArray(securityCheckRes.data) && securityCheckRes.data.length > 0) {
    const firstConsultant = securityCheckRes.data[0];

    // Check if sensitive field auth_password_sha256 exists
    const hasAuthPasswordField = 'auth_password_sha256' in firstConsultant;

    assert(
      'Anon key should NOT have access to auth_password_sha256 field',
      !hasAuthPasswordField,
      hasAuthPasswordField ? 'SECURITY ISSUE: auth_password_sha256 is accessible via anon key!' : 'Field properly restricted'
    );

    // Check notes_admin field
    if ('notes_admin' in firstConsultant) {
      const notesAdmin = firstConsultant.notes_admin;
      console.log(`${colors.cyan}ℹ notes_admin field present (type: ${typeof notesAdmin})${colors.reset}\n`);

      // If notes_admin is an object and contains auth_password_sha256
      if (typeof notesAdmin === 'object' && notesAdmin !== null) {
        const hasPasswordInNotes = 'auth_password_sha256' in notesAdmin;
        assert(
          'notes_admin should not contain auth_password_sha256 via anon key',
          !hasPasswordInNotes,
          hasPasswordInNotes ? 'SECURITY ISSUE: Password hash in notes_admin!' : 'Properly restricted'
        );
      }
    }
  } else {
    console.log(`${colors.yellow}⚠ Skipped: No consultants available for security check${colors.reset}\n`);
  }

  /* ── TEST 6: POST /rest/v1/consultants - Insert Permission Test ── */
  printSection('TEST 6: POST /rest/v1/consultants - Insert Permission Test');

  const testConsultant = {
    prenom: 'TestConsultant',
    nom: 'APITest',
    email: `test_${Date.now()}@api-test.local`,
    statut: 'en_attente'
  };

  const insertRes = await apiCall('consultants', {
    method: 'POST',
    body: testConsultant,
    headers: { 'Prefer': 'return=representation' }
  });

  const canInsert = insertRes.status === 201 || (insertRes.ok && Array.isArray(insertRes.data));
  const cannotInsert = insertRes.status === 403 || (insertRes.data && insertRes.data.message && insertRes.data.message.includes('permission'));

  assert(
    'POST should either succeed or be denied with 403 (permission check)',
    canInsert || cannotInsert,
    canInsert ? 'Insert allowed (expected behavior for this anon key)' :
    cannotInsert ? 'Insert denied (expected behavior for restricted anon key)' :
    `Unexpected HTTP ${insertRes.status}: ${JSON.stringify(insertRes.data).substring(0, 80)}`
  );

  let insertedId = null;
  if (canInsert && insertRes.data && Array.isArray(insertRes.data) && insertRes.data.length > 0) {
    insertedId = insertRes.data[0].id;
    console.log(`${colors.cyan}ℹ Successfully inserted test record with ID: ${insertedId}${colors.reset}\n`);
  } else if (insertRes.data && insertRes.data.id) {
    insertedId = insertRes.data.id;
  }

  /* ── TEST 7: PATCH /rest/v1/consultants - Update Permission Test ── */
  printSection('TEST 7: PATCH /rest/v1/consultants - Update Permission Test');

  if (insertedId) {
    const updateRes = await apiCall('consultants', {
      method: 'PATCH',
      query: { 'id': `eq.${insertedId}` },
      body: { statut: 'approuve' },
      headers: { 'Prefer': 'return=minimal' }
    });

    const canUpdate = updateRes.ok || updateRes.status === 204 || updateRes.status === 200;
    const cannotUpdate = updateRes.status === 403;

    assert(
      'PATCH should either succeed or be denied with 403 (permission check)',
      canUpdate || cannotUpdate,
      canUpdate ? 'Update allowed' :
      cannotUpdate ? 'Update denied (permission restricted)' :
      `Unexpected HTTP ${updateRes.status}`
    );
  } else {
    console.log(`${colors.yellow}⚠ Skipped: No valid record ID to test update${colors.reset}\n`);
  }

  /* ── TEST 8: Unauthenticated Requests ── */
  printSection('TEST 8: Unauthenticated Requests - Should Be Rejected');

  const unauthRes = await apiCall('consultants', {
    includeApiKey: false
  });

  const isRejected = unauthRes.status === 401 || unauthRes.status === 403 || !unauthRes.ok;

  assert(
    'Unauthenticated request should be rejected',
    isRejected,
    isRejected ? `Correctly rejected with HTTP ${unauthRes.status}` : `Unexpectedly allowed (HTTP ${unauthRes.status})`
  );

  /* ── TEST 9: Invalid API Key ── */
  printSection('TEST 9: Invalid API Key - Should Be Rejected');

  const invalidKeyRes = await apiCall('consultants', {
    headers: {
      'apikey': 'invalid_key_12345',
      'Authorization': 'Bearer invalid_key_12345'
    },
    includeApiKey: false
  });

  const isInvalidKeyRejected = invalidKeyRes.status === 401 || invalidKeyRes.status === 403 || !invalidKeyRes.ok;

  assert(
    'Invalid API key should be rejected',
    isInvalidKeyRejected,
    isInvalidKeyRejected ? `Correctly rejected with HTTP ${invalidKeyRes.status}` : `Unexpectedly allowed (HTTP ${invalidKeyRes.status})`
  );

  /* ── TEST 10: Query Parameter Syntax ── */
  printSection('TEST 10: Query Parameter Syntax - Filter Operations');

  const filterOpsRes = await apiCall('consultants', {
    query: { 'statut': 'eq.approuve' }
  });

  assert(
    'Filter with eq. operator should be valid',
    filterOpsRes.ok || filterOpsRes.status === 200,
    `HTTP ${filterOpsRes.status}`
  );

  assert(
    'Filter should return array result',
    Array.isArray(filterOpsRes.data),
    `Expected array, got: ${typeof filterOpsRes.data}`
  );

  /* ── TEST 11: Response Headers ── */
  printSection('TEST 11: Response Headers - Content-Type Validation');

  // Note: We can't directly inspect response headers with fetch().json(),
  // but we can verify response structure
  assert(
    'Successful responses should return valid JSON',
    consultantsRes.ok && typeof consultantsRes.data === 'object',
    ''
  );

  /* ── TEST 12: Error Handling ── */
  printSection('TEST 12: Error Handling - Invalid Table Name');

  const invalidTableRes = await apiCall('nonexistent_table_xyz');

  const isErrorHandled = invalidTableRes.status === 404 || !invalidTableRes.ok;

  assert(
    'Invalid table should return error',
    isErrorHandled,
    isErrorHandled ? `Correctly handled with HTTP ${invalidTableRes.status}` : `Unexpected response: ${JSON.stringify(invalidTableRes.data).substring(0, 60)}`
  );

  /* ════════════════════════════════════════════════════════════════════════════════ */
  /* ── SUMMARY ── */
  /* ════════════════════════════════════════════════════════════════════════════════ */

  printSection('Test Summary');

  const totalPercent = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  const passColor = passedTests === totalTests ? colors.green : colors.yellow;

  console.log(`Total Tests:  ${totalTests}`);
  console.log(`${colors.green}Passed:       ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed:       ${failedTests}${colors.reset}`);
  console.log(`${passColor}Pass Rate:    ${totalPercent}%${colors.reset}\n`);

  if (failedTests === 0) {
    console.log(`${colors.green}${'═'.repeat(70)}${colors.reset}`);
    console.log(`${colors.green}✓ ALL TESTS PASSED${colors.reset}`);
    console.log(`${colors.green}${'═'.repeat(70)}${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${'═'.repeat(70)}${colors.reset}`);
    console.log(`${colors.red}✗ ${failedTests} TEST(S) FAILED${colors.reset}`);
    console.log(`${colors.red}${'═'.repeat(70)}${colors.reset}\n`);
    process.exit(1);
  }
}

/* ── Run tests ── */
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(2);
});
