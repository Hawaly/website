-- =========================================================
-- PATCH DE SÉCURITÉ D'URGENCE - INJECTION SQL
-- Date: 2026-01-06
-- Criticité: MAXIMALE
-- =========================================================

-- 1. Ajouter la colonne pour forcer le reset de mot de passe
ALTER TABLE app_user 
ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN DEFAULT false;

-- 2. Forcer TOUS les utilisateurs à réinitialiser leur mot de passe
UPDATE app_user 
SET 
  must_reset_password = true,
  updated_at = NOW()
WHERE 1=1;

-- 3. Créer une table de blacklist pour les IPs malveillantes
CREATE TABLE IF NOT EXISTS ip_blacklist (
  id BIGSERIAL PRIMARY KEY,
  ip_address INET NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(255),
  is_permanent BOOLEAN DEFAULT false
);

CREATE INDEX idx_ip_blacklist_ip ON ip_blacklist(ip_address);
CREATE INDEX idx_ip_blacklist_blocked_until ON ip_blacklist(blocked_until);

-- 4. Créer une table pour tracker les tentatives d'injection SQL
CREATE TABLE IF NOT EXISTS sql_injection_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip_address INET NOT NULL,
  email VARCHAR(255),
  payload TEXT NOT NULL,
  user_agent TEXT,
  detected_patterns TEXT[],
  severity VARCHAR(20) DEFAULT 'high',
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sql_injection_ip ON sql_injection_attempts(ip_address);
CREATE INDEX idx_sql_injection_detected_at ON sql_injection_attempts(detected_at DESC);

-- 5. Fonction pour vérifier si une IP est blacklistée
CREATE OR REPLACE FUNCTION is_ip_blacklisted(p_ip_address INET)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM ip_blacklist 
    WHERE ip_address = p_ip_address
      AND (is_permanent = true 
           OR blocked_until IS NULL 
           OR blocked_until > NOW())
  );
END;
$$;

-- 6. Fonction pour blacklister une IP
CREATE OR REPLACE FUNCTION blacklist_ip(
  p_ip_address INET,
  p_reason TEXT,
  p_duration_hours INTEGER DEFAULT 24,
  p_is_permanent BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_blocked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  IF p_is_permanent THEN
    v_blocked_until := NULL;
  ELSE
    v_blocked_until := NOW() + (p_duration_hours || ' hours')::INTERVAL;
  END IF;

  INSERT INTO ip_blacklist (
    ip_address,
    reason,
    blocked_until,
    is_permanent
  ) VALUES (
    p_ip_address,
    p_reason,
    v_blocked_until,
    p_is_permanent
  )
  ON CONFLICT (ip_address) 
  DO UPDATE SET
    reason = EXCLUDED.reason,
    blocked_until = EXCLUDED.blocked_until,
    is_permanent = EXCLUDED.is_permanent,
    blocked_at = NOW();
END;
$$;

-- 7. Trigger pour logger les modifications sur app_user
CREATE TABLE IF NOT EXISTS app_user_audit (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER,
  action VARCHAR(10),
  old_data JSONB,
  new_data JSONB,
  changed_by VARCHAR(255),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET
);

CREATE OR REPLACE FUNCTION audit_app_user_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO app_user_audit (
      user_id,
      action,
      old_data,
      new_data,
      changed_by,
      ip_address
    ) VALUES (
      NEW.id,
      TG_OP,
      to_jsonb(OLD),
      to_jsonb(NEW),
      current_setting('app.current_user', true),
      inet_client_addr()
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO app_user_audit (
      user_id,
      action,
      old_data,
      changed_by,
      ip_address
    ) VALUES (
      OLD.id,
      TG_OP,
      to_jsonb(OLD),
      current_setting('app.current_user', true),
      inet_client_addr()
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_app_user_trigger ON app_user;
CREATE TRIGGER audit_app_user_trigger
AFTER UPDATE OR DELETE ON app_user
FOR EACH ROW EXECUTE FUNCTION audit_app_user_changes();

-- 8. Renforcer les politiques RLS
ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own data" ON app_user;
DROP POLICY IF EXISTS "Admins can view all users" ON app_user;
DROP POLICY IF EXISTS "No direct updates to app_user" ON app_user;

-- Nouvelles politiques strictes
CREATE POLICY "Users can only view their own data"
ON app_user FOR SELECT
USING (
  auth.uid()::TEXT = auth_user_id::TEXT
  OR EXISTS (
    SELECT 1 FROM app_user admin
    WHERE admin.auth_user_id::TEXT = auth.uid()::TEXT
    AND admin.role_id = 1
  )
);

CREATE POLICY "Only system can insert users"
ON app_user FOR INSERT
WITH CHECK (false);

CREATE POLICY "Only system can update users"
ON app_user FOR UPDATE
USING (false);

CREATE POLICY "Only system can delete users"
ON app_user FOR DELETE
USING (false);

-- 9. Créer une vue sécurisée pour les utilisateurs
CREATE OR REPLACE VIEW safe_user_view AS
SELECT 
  id,
  email,
  role_id,
  client_id,
  is_active,
  created_at,
  last_login
FROM app_user
WHERE auth.uid()::TEXT = auth_user_id::TEXT
   OR EXISTS (
     SELECT 1 FROM app_user admin
     WHERE admin.auth_user_id::TEXT = auth.uid()::TEXT
     AND admin.role_id = 1
   );

-- 10. Nettoyer les sessions existantes (forcer re-login)
TRUNCATE TABLE user_session;

-- 11. Ajouter des contraintes de validation sur les emails
ALTER TABLE app_user 
ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE app_user 
ADD CONSTRAINT check_email_length 
CHECK (LENGTH(email) <= 255);

-- 12. Créer un index pour améliorer les performances des recherches
CREATE INDEX IF NOT EXISTS idx_app_user_auth_user_id ON app_user(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_app_user_email_lower ON app_user(LOWER(email));

-- 13. Notification pour les admins
INSERT INTO security_notifications (
  user_id,
  notification_type,
  title,
  message,
  severity
)
SELECT 
  id,
  'unusual_activity',
  'ALERTE SÉCURITÉ: Patch d''urgence appliqué',
  'Une attaque par injection SQL a été détectée et bloquée. Tous les utilisateurs doivent réinitialiser leur mot de passe. Veuillez vérifier les logs de sécurité.',
  'critical'
FROM app_user
WHERE role_id = 1;

-- =========================================================
-- IMPORTANT: Actions manuelles requises après ce script
-- =========================================================
-- 1. Changer IMMÉDIATEMENT toutes les clés API Supabase
-- 2. Activer l'audit log dans le dashboard Supabase
-- 3. Configurer les alertes de sécurité
-- 4. Notifier tous les utilisateurs du reset obligatoire
-- 5. Vérifier les backups de la base de données
-- =========================================================

COMMENT ON TABLE ip_blacklist IS 'Table de blocage des IPs malveillantes suite à l''attaque';
COMMENT ON TABLE sql_injection_attempts IS 'Log des tentatives d''injection SQL détectées';
COMMENT ON TABLE app_user_audit IS 'Audit trail pour toutes les modifications sur app_user';
