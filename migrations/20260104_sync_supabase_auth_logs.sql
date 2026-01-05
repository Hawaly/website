-- Migration: Sync Supabase Auth Audit Logs with Security Logs
-- Description: Creates a function to sync auth.audit_log_entries with our security_logs table

-- =========================================================
-- 1. Create function to sync auth logs
-- =========================================================
CREATE OR REPLACE FUNCTION sync_auth_audit_to_security_logs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id INTEGER;
  v_email TEXT;
  v_event_type VARCHAR(50);
  v_event_status VARCHAR(20);
BEGIN
  -- Map Supabase auth action to our event types
  CASE NEW.action
    WHEN 'login' THEN
      v_event_type := 'login';
      v_event_status := 'success';
    WHEN 'logout' THEN
      v_event_type := 'logout';
      v_event_status := 'success';
    WHEN 'user_signedup' THEN
      v_event_type := 'login';
      v_event_status := 'success';
    WHEN 'token_refreshed' THEN
      -- Skip token refresh events as they're too frequent
      RETURN NEW;
    WHEN 'password_recovery' THEN
      v_event_type := 'password_reset';
      v_event_status := 'info';
    ELSE
      -- For other events, log them as info
      v_event_type := 'login';
      v_event_status := 'info';
  END CASE;

  -- Get user_id from app_user if exists
  SELECT au.id, au.email INTO v_user_id, v_email
  FROM app_user au
  WHERE au.auth_user_id = NEW.user_id;

  -- Insert into security_logs
  INSERT INTO security_logs (
    user_id,
    auth_user_id,
    event_type,
    event_status,
    email,
    ip_address,
    user_agent,
    device_info,
    metadata,
    created_at
  ) VALUES (
    v_user_id,
    NEW.user_id,
    v_event_type,
    v_event_status,
    COALESCE(v_email, NEW.payload->>'email'),
    (NEW.ip_address)::INET,
    NEW.payload->>'user_agent',
    jsonb_build_object(
      'browser', 'Unknown',
      'os', 'Unknown',
      'device', 'Unknown'
    ),
    jsonb_build_object(
      'action', NEW.action,
      'payload', NEW.payload
    ),
    NEW.created_at
  );

  RETURN NEW;
END;
$$;

-- =========================================================
-- 2. Create trigger on auth.audit_log_entries
-- =========================================================
-- Note: This trigger may require superuser privileges
-- If it fails, you'll need to run it directly in Supabase SQL editor
DROP TRIGGER IF EXISTS trg_sync_auth_audit ON auth.audit_log_entries;

CREATE TRIGGER trg_sync_auth_audit
  AFTER INSERT ON auth.audit_log_entries
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_audit_to_security_logs();

-- =========================================================
-- 3. Backfill existing auth logs (optional)
-- =========================================================
-- Uncomment to import existing auth logs into security_logs
/*
INSERT INTO security_logs (
  auth_user_id,
  event_type,
  event_status,
  email,
  ip_address,
  user_agent,
  metadata,
  created_at
)
SELECT 
  ale.user_id,
  CASE 
    WHEN ale.action = 'login' THEN 'login'
    WHEN ale.action = 'logout' THEN 'logout'
    WHEN ale.action = 'user_signedup' THEN 'login'
    WHEN ale.action = 'password_recovery' THEN 'password_reset'
    ELSE 'login'
  END as event_type,
  CASE 
    WHEN ale.action IN ('login', 'logout', 'user_signedup') THEN 'success'
    ELSE 'info'
  END as event_status,
  ale.payload->>'email' as email,
  (ale.ip_address)::INET,
  ale.payload->>'user_agent' as user_agent,
  jsonb_build_object('action', ale.action, 'payload', ale.payload) as metadata,
  ale.created_at
FROM auth.audit_log_entries ale
WHERE ale.created_at > NOW() - INTERVAL '90 days'
  AND ale.action IN ('login', 'logout', 'user_signedup', 'password_recovery')
  AND NOT EXISTS (
    SELECT 1 FROM security_logs sl 
    WHERE sl.auth_user_id = ale.user_id 
    AND sl.created_at = ale.created_at
  );
*/

COMMENT ON FUNCTION sync_auth_audit_to_security_logs IS 'Syncs Supabase auth.audit_log_entries to security_logs table';
