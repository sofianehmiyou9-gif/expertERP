-- Migration: mark_thread_read RPC function
-- Purpose: Bypass RLS to allow marking messages as read via SECURITY DEFINER
-- Applied: 2026-04-06

CREATE OR REPLACE FUNCTION mark_thread_read(p_thread_id text, p_receiver_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE messages
  SET read = true
  WHERE thread_id = p_thread_id
    AND receiver_email = lower(p_receiver_email)
    AND read = false;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION mark_thread_read(text, text) TO anon;
GRANT EXECUTE ON FUNCTION mark_thread_read(text, text) TO authenticated;
