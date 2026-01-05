-- Migration: Security Logs and Audit Trail
-- Description: Creates tables and functions to track login events and security activities

-- =========================================================
-- 1. Create security_logs table
-- =========================================================
CREATE TABLE IF NOT EXISTS security_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES app_user(id) ON DELETE SET NULL,
  auth_user_id UUID,
  event_type VARCHAR(50) NOT NULL,
  event_status VARCHAR(20) NOT NULL DEFAULT 'success',
  email VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  location_info JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_event_type CHECK (event_type IN ('login', 'logout', 'login_failed', 'password_reset', 'password_change', 'account_locked', 'account_unlocked', 'role_changed', 'permission_changed')),
  CONSTRAINT valid_event_status CHECK (event_status IN ('success', 'failure', 'warning', 'info'))
);

-- Create indexes for better query performance
CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX idx_security_logs_auth_user_id ON security_logs(auth_user_id);
CREATE INDEX idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX idx_security_logs_email ON security_logs(email);
CREATE INDEX idx_security_logs_ip_address ON security_logs(ip_address);

-- =========================================================
-- 2. Create security_notifications table
-- =========================================================
CREATE TABLE IF NOT EXISTS security_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
  security_log_id BIGINT REFERENCES security_logs(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_notification_type CHECK (notification_type IN ('suspicious_login', 'new_device', 'new_location', 'multiple_failed_attempts', 'account_locked', 'unusual_activity')),
  CONSTRAINT valid_severity CHECK (severity IN ('info', 'warning', 'critical'))
);

-- Create indexes
CREATE INDEX idx_security_notifications_user_id ON security_notifications(user_id);
CREATE INDEX idx_security_notifications_is_read ON security_notifications(is_read);
CREATE INDEX idx_security_notifications_created_at ON security_notifications(created_at DESC);
CREATE INDEX idx_security_notifications_severity ON security_notifications(severity);

-- =========================================================
-- 3. Create login_attempts tracking table
-- =========================================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address INET,
  attempt_status VARCHAR(20) NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_attempt_status CHECK (attempt_status IN ('success', 'failed', 'locked'))
);

-- Create indexes
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_last_attempt ON login_attempts(last_attempt_at DESC);

-- =========================================================
-- 4. Create function to log security events
-- =========================================================
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id INTEGER DEFAULT NULL,
  p_auth_user_id UUID DEFAULT NULL,
  p_event_type VARCHAR DEFAULT 'login',
  p_event_status VARCHAR DEFAULT 'success',
  p_email VARCHAR DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_info JSONB DEFAULT '{}',
  p_location_info JSONB DEFAULT '{}',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id BIGINT;
BEGIN
  INSERT INTO security_logs (
    user_id,
    auth_user_id,
    event_type,
    event_status,
    email,
    ip_address,
    user_agent,
    device_info,
    location_info,
    metadata
  ) VALUES (
    p_user_id,
    p_auth_user_id,
    p_event_type,
    p_event_status,
    p_email,
    p_ip_address,
    p_user_agent,
    p_device_info,
    p_location_info,
    p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- =========================================================
-- 5. Create function to detect suspicious activity
-- =========================================================
CREATE OR REPLACE FUNCTION detect_suspicious_login(
  p_user_id INTEGER,
  p_ip_address INET,
  p_device_info JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_suspicious BOOLEAN := FALSE;
  v_recent_ips TEXT[];
  v_recent_locations TEXT[];
BEGIN
  -- Check if IP address is new for this user in last 30 days
  SELECT ARRAY_AGG(DISTINCT host(ip_address)::TEXT)
  INTO v_recent_ips
  FROM security_logs
  WHERE user_id = p_user_id
    AND event_type = 'login'
    AND event_status = 'success'
    AND created_at > NOW() - INTERVAL '30 days'
    AND ip_address != p_ip_address;
  
  -- If user has previous logins and current IP is not in recent IPs
  IF v_recent_ips IS NOT NULL AND ARRAY_LENGTH(v_recent_ips, 1) > 0 THEN
    IF NOT (host(p_ip_address)::TEXT = ANY(v_recent_ips)) THEN
      v_is_suspicious := TRUE;
    END IF;
  END IF;
  
  RETURN v_is_suspicious;
END;
$$;

-- =========================================================
-- 6. Create function to create security notification
-- =========================================================
CREATE OR REPLACE FUNCTION create_security_notification(
  p_user_id INTEGER,
  p_security_log_id BIGINT,
  p_notification_type VARCHAR,
  p_title VARCHAR,
  p_message TEXT,
  p_severity VARCHAR DEFAULT 'info'
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id BIGINT;
BEGIN
  INSERT INTO security_notifications (
    user_id,
    security_log_id,
    notification_type,
    title,
    message,
    severity
  ) VALUES (
    p_user_id,
    p_security_log_id,
    p_notification_type,
    p_title,
    p_message,
    p_severity
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- =========================================================
-- 7. Create view for security dashboard
-- =========================================================
CREATE OR REPLACE VIEW security_dashboard_view AS
SELECT 
  sl.id,
  sl.user_id,
  sl.auth_user_id,
  sl.event_type,
  sl.event_status,
  sl.email,
  sl.ip_address,
  sl.user_agent,
  sl.device_info,
  sl.location_info,
  sl.metadata,
  sl.created_at,
  u.email as user_email,
  r.name as role_name,
  r.code as role_code,
  c.name as client_name,
  CASE 
    WHEN sl.created_at > NOW() - INTERVAL '5 minutes' THEN 'just now'
    WHEN sl.created_at > NOW() - INTERVAL '1 hour' THEN 'recently'
    WHEN sl.created_at > NOW() - INTERVAL '24 hours' THEN 'today'
    ELSE 'older'
  END as time_category
FROM security_logs sl
LEFT JOIN app_user u ON sl.user_id = u.id
LEFT JOIN role r ON u.role_id = r.id
LEFT JOIN client c ON u.client_id = c.id
ORDER BY sl.created_at DESC;

-- =========================================================
-- 8. Enable RLS on security tables
-- =========================================================
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_logs
CREATE POLICY "Admins can view all security logs"
  ON security_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_user
      WHERE id = (current_setting('app.user_id', true)::INTEGER)
      AND role_id = 1
    )
  );

CREATE POLICY "System can insert security logs"
  ON security_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for security_notifications
CREATE POLICY "Users can view their own notifications"
  ON security_notifications FOR SELECT
  USING (user_id = (current_setting('app.user_id', true)::INTEGER));

CREATE POLICY "Admins can view all notifications"
  ON security_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_user
      WHERE id = (current_setting('app.user_id', true)::INTEGER)
      AND role_id = 1
    )
  );

CREATE POLICY "System can insert notifications"
  ON security_notifications FOR INSERT
  WITH CHECK (true);

-- RLS Policies for login_attempts
CREATE POLICY "Admins can view login attempts"
  ON login_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_user
      WHERE id = (current_setting('app.user_id', true)::INTEGER)
      AND role_id = 1
    )
  );

CREATE POLICY "System can manage login attempts"
  ON login_attempts FOR ALL
  WITH CHECK (true);

-- =========================================================
-- 9. Grant necessary permissions
-- =========================================================
GRANT SELECT ON security_logs TO authenticated;
GRANT SELECT ON security_notifications TO authenticated;
GRANT SELECT ON security_dashboard_view TO authenticated;
GRANT SELECT ON login_attempts TO authenticated;

GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;
GRANT EXECUTE ON FUNCTION detect_suspicious_login TO authenticated;
GRANT EXECUTE ON FUNCTION create_security_notification TO authenticated;

-- =========================================================
-- 10. Create sample data (optional - for testing)
-- =========================================================
-- Uncomment to create sample security logs
-- INSERT INTO security_logs (user_id, event_type, event_status, email, ip_address, user_agent)
-- SELECT 
--   id,
--   'login',
--   'success',
--   email,
--   '127.0.0.1'::INET,
--   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
-- FROM app_user
-- WHERE role_id = 1
-- LIMIT 1;

COMMENT ON TABLE security_logs IS 'Stores all security-related events and audit trail';
COMMENT ON TABLE security_notifications IS 'Stores security notifications for users';
COMMENT ON TABLE login_attempts IS 'Tracks login attempts and potential brute force attacks';
COMMENT ON FUNCTION log_security_event IS 'Function to log security events with metadata';
COMMENT ON FUNCTION detect_suspicious_login IS 'Detects suspicious login patterns';
COMMENT ON FUNCTION create_security_notification IS 'Creates security notifications for users';
