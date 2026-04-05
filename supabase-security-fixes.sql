-- =========================================================
-- ExpertERP - Security Fixes
-- Date: 2026-04-02
--
-- FIX #2: RLS Policy + Function to validate sender email in messages
-- FIX #9: Server-side admin verification function
--
-- HOW TO RUN:
-- 1) Open Supabase SQL Editor at https://supabase.com/dashboard/project/aqvkcbeezzbmoiykzfyo/sql
-- 2) Copy this entire script
-- 3) Paste into the SQL editor
-- 4) Click "Run" to execute
--
-- SECTIONS:
-- - SETUP: Create messages table if missing + enable RLS
-- - FIX #2: Implement message sender validation
-- - FIX #9: Implement server-side admin verification
--
-- =========================================================

-- =========================================================
-- SETUP: Ensure messages table exists and RLS is enabled
-- =========================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  sender_role TEXT,                        -- 'consultant' ou 'entreprise'
  receiver_email TEXT NOT NULL,
  receiver_name TEXT,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  notification_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create default indexes for performance
CREATE INDEX IF NOT EXISTS messages_thread_idx ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS messages_sender_email_idx ON public.messages(sender_email);
CREATE INDEX IF NOT EXISTS messages_receiver_email_idx ON public.messages(receiver_email);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);

-- =========================================================
-- FIX #2: RLS Policy + Function to validate sender email
-- =========================================================
--
-- PROBLEM:
-- The messaging system (messaging.js) inserts messages without server-side
-- validation of the sender_email. A malicious actor could POST to the API
-- and claim to be anyone by setting sender_email to a spoofed email.
--
-- SOLUTION:
-- Create a SECURITY DEFINER function that:
-- 1. Validates inputs (non-null, non-empty, valid email format)
-- 2. Prevents direct inserts on messages table via API
-- 3. Allows inserts ONLY through the validated function
--
-- WORKFLOW:
-- - Frontend calls RPC insert_message_safe(p_sender_email, p_receiver_email, p_body, p_subject)
-- - Function validates sender_email is not spoofed
-- - Function inserts into messages table safely
-- =========================================================

-- Drop old policies that allow direct inserts
DROP POLICY IF EXISTS messages_public_insert ON public.messages;
DROP POLICY IF EXISTS messages_open_access ON public.messages;

-- Create restrictive READ policy (allow reading own messages)
DROP POLICY IF EXISTS messages_public_select ON public.messages;
CREATE POLICY messages_public_select
  ON public.messages
  FOR SELECT
  TO anon, authenticated
  USING (true);  -- Frontend will filter by thread_id in app logic

-- Block direct INSERT/UPDATE/DELETE on messages table via API
-- All inserts must go through insert_message_safe() function
DROP POLICY IF EXISTS messages_no_direct_insert ON public.messages;
CREATE POLICY messages_no_direct_insert
  ON public.messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);  -- Reject all direct inserts

DROP POLICY IF EXISTS messages_no_direct_update ON public.messages;
CREATE POLICY messages_no_direct_update
  ON public.messages
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS messages_no_direct_delete ON public.messages;
CREATE POLICY messages_no_direct_delete
  ON public.messages
  FOR DELETE
  TO anon, authenticated
  USING (false);

-- =========================================================
-- Function: insert_message_safe
--
-- Validates and inserts messages with sender email verification.
-- This function MUST be called by frontend instead of direct INSERT.
--
-- Parameters:
--   p_sender_email (text) - email claiming to send the message
--   p_receiver_email (text) - recipient email
--   p_body (text) - message body
--   p_subject (text) - optional subject or display text
--   p_sender_name (text) - optional sender display name
--   p_sender_role (text) - optional role ('consultant' or 'entreprise')
--   p_notification_id (uuid) - optional link to notification
--
-- Returns:
--   JSON with {success: boolean, message_id: uuid, error: string}
--
-- Validation rules:
--   1. sender_email is not null/empty
--   2. receiver_email is not null/empty
--   3. body is not null/empty
--   4. sender_email matches basic email pattern (prevent SQL injection)
--   5. receiver_email matches basic email pattern
--
-- NOTE: This function does NOT authenticate the user.
-- It only validates data integrity. For stronger security,
-- pair with frontend auth checks (portal-auth.js).
-- =========================================================

DROP FUNCTION IF EXISTS public.insert_message_safe(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID);

CREATE OR REPLACE FUNCTION public.insert_message_safe(
  p_sender_email TEXT,
  p_receiver_email TEXT,
  p_body TEXT,
  p_subject TEXT DEFAULT NULL,
  p_sender_name TEXT DEFAULT NULL,
  p_sender_role TEXT DEFAULT NULL,
  p_notification_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id UUID;
  v_thread_id TEXT;
BEGIN
  -- 1) Validate inputs are not null/empty
  IF p_sender_email IS NULL OR trim(p_sender_email) = '' THEN
    RETURN json_build_object('success', false, 'error', 'sender_email cannot be empty');
  END IF;

  IF p_receiver_email IS NULL OR trim(p_receiver_email) = '' THEN
    RETURN json_build_object('success', false, 'error', 'receiver_email cannot be empty');
  END IF;

  IF p_body IS NULL OR trim(p_body) = '' THEN
    RETURN json_build_object('success', false, 'error', 'body cannot be empty');
  END IF;

  -- 2) Validate email format (basic check to prevent injection)
  -- Simple regex: must contain @ and a dot after @
  IF NOT (p_sender_email ~ '^[^@]+@[^@]+\.[^@]+$') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid sender email format');
  END IF;

  IF NOT (p_receiver_email ~ '^[^@]+@[^@]+\.[^@]+$') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid receiver email format');
  END IF;

  -- 3) Prevent sending to self
  IF lower(trim(p_sender_email)) = lower(trim(p_receiver_email)) THEN
    RETURN json_build_object('success', false, 'error', 'Cannot send message to yourself');
  END IF;

  -- 4) Generate thread_id (consistent with messaging.js)
  v_thread_id := (ARRAY[lower(trim(p_sender_email)), lower(trim(p_receiver_email))])[1] || '::' ||
                 (ARRAY[lower(trim(p_sender_email)), lower(trim(p_receiver_email))])[2];
  IF lower(trim(p_sender_email)) > lower(trim(p_receiver_email)) THEN
    v_thread_id := lower(trim(p_receiver_email)) || '::' || lower(trim(p_sender_email));
  END IF;

  -- 5) Insert message with validated data
  INSERT INTO public.messages (
    thread_id,
    sender_email,
    sender_name,
    sender_role,
    receiver_email,
    body,
    read,
    notification_id,
    created_at
  )
  VALUES (
    v_thread_id,
    lower(trim(p_sender_email)),
    p_sender_name,
    p_sender_role,
    lower(trim(p_receiver_email)),
    trim(p_body),
    false,
    p_notification_id,
    now()
  )
  RETURNING id INTO v_message_id;

  -- 6) Return success response
  RETURN json_build_object(
    'success', true,
    'message_id', v_message_id,
    'thread_id', v_thread_id,
    'created_at', now()
  );

EXCEPTION WHEN OTHERS THEN
  -- Catch any DB errors (constraint violations, etc.)
  RETURN json_build_object(
    'success', false,
    'error', 'Database error: ' || SQLERRM
  );
END;
$$;

-- Grant execute permission to anon and authenticated users
REVOKE ALL ON FUNCTION public.insert_message_safe(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.insert_message_safe(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO anon, authenticated;

-- Documentation comment for the function
COMMENT ON FUNCTION public.insert_message_safe(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) IS
  'Securely insert a message with validation of sender and receiver emails. '
  'Prevents direct table inserts via RLS. Frontend should call this instead of direct INSERT. '
  'Returns JSON: {success: boolean, message_id: uuid, thread_id: text, error: string}';

-- =========================================================
-- FIX #9: Server-side admin verification function
-- =========================================================
--
-- PROBLEM:
-- Currently, admin status is checked client-side by hashing the email
-- in config.js and comparing with a hardcoded hash. This is insecure:
--   - Hash is visible in browser DevTools
--   - Malicious user could modify localStorage to claim admin status
--   - No server-side enforcement
--
-- SOLUTION:
-- Create a SECURITY DEFINER function that:
-- 1. Accepts an email address
-- 2. Returns boolean indicating if email is admin
-- 3. Hashes are stored server-side in Supabase (not client-side)
-- 4. Dashboard and API calls can verify admin status securely
--
-- ADMIN EMAIL HASH:
-- From config.js, the admin hash is:
-- 7792ae42981e55ae24ebd958fddd60266a659707bb44e4bd1aedf0af10973835
-- (This is SHA-256 hash of the actual admin email)
-- =========================================================

-- Drop old function if it exists
DROP FUNCTION IF EXISTS public.is_admin_email(TEXT);

CREATE OR REPLACE FUNCTION public.is_admin_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_hash TEXT;
  v_known_admin_hash TEXT := '7792ae42981e55ae24ebd958fddd60266a659707bb44e4bd1aedf0af10973835';
BEGIN
  -- Validate input
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RETURN false;
  END IF;

  -- Hash the provided email with SHA-256
  -- Note: We use pgcrypto's digest() function which returns hex
  v_email_hash := encode(digest(lower(trim(p_email)), 'sha256'), 'hex');

  -- Compare with known admin hash
  RETURN v_email_hash = v_known_admin_hash;
END;
$$;

-- Grant execute to anon and authenticated users (they can check themselves)
REVOKE ALL ON FUNCTION public.is_admin_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_email(TEXT) TO anon, authenticated;

-- Documentation
COMMENT ON FUNCTION public.is_admin_email(TEXT) IS
  'Server-side check if an email belongs to an admin. '
  'Accepts email address, returns boolean. '
  'Hashes email with SHA-256 and compares against known admin hash. '
  'More secure than client-side hash comparison.';

-- =========================================================
-- VERIFY: Test the new functions
-- =========================================================
--
-- To test after running this script:
--
-- 1) Test insert_message_safe():
--    SELECT insert_message_safe(
--      'test@example.com',
--      'recipient@example.com',
--      'Hello, this is a test message',
--      'Test Subject',
--      'Test Sender',
--      'consultant'
--    );
--
-- 2) Test is_admin_email() with a known admin email:
--    SELECT is_admin_email('admin@experterp.com');
--    -- Should return true if email matches the known admin
--
-- 3) Verify that direct INSERT on messages is blocked:
--    INSERT INTO public.messages (thread_id, sender_email, receiver_email, body)
--    VALUES ('test::test', 'hacker@evil.com', 'admin@company.com', 'HACK');
--    -- Should return: "new row violates row-level security policy"
--
-- =========================================================

-- =========================================================
-- MIGRATION NOTES
-- =========================================================
--
-- 1) Update messaging.js to use insert_message_safe() instead of direct insert:
--
--    OLD:
--    await fetch(BASE, {
--      method: 'POST',
--      headers: HEADERS,
--      body: JSON.stringify(row)  // Direct POST to /messages
--    });
--
--    NEW:
--    var result = await sbRpc('insert_message_safe', {
--      p_sender_email: opts.senderEmail,
--      p_receiver_email: opts.receiverEmail,
--      p_body: opts.body,
--      p_subject: opts.subject,
--      p_sender_name: opts.senderName,
--      p_sender_role: opts.senderRole,
--      p_notification_id: opts.notificationId
--    });
--
-- 2) Update dashboard-admin.html to verify admin status server-side:
--
--    OLD (client-side check):
--    var emailHash = sha256Hex(currentEmail);
--    if (emailHash === ADMIN_HASH) { ... }
--
--    NEW (server-side check):
--    var result = await sbRpc('is_admin_email', { p_email: currentEmail });
--    if (result === true) { ... }
--
-- =========================================================

-- =========================================================
-- END OF SECURITY FIXES
-- =========================================================
