-- =========================================================
-- PATCH DE SÉCURITÉ D'URGENCE - INJECTION SQL (SUPABASE AUTH)
-- Date: 2026-01-06
-- Criticité: MAXIMALE
-- =========================================================

-- 1. Ajouter des colonnes de sécurité à auth.users via raw_user_meta_data
-- Note: Supabase utilise raw_user_meta_data pour stocker des données custom
CREATE OR REPLACE FUNCTION force_password_reset_all_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Forcer le reset pour tous les utilisateurs
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    '{"must_reset_password": true, "security_alert": "2026-01-06 SQL Injection Attack"}'::jsonb,
  updated_at = NOW();
END;
$$;

-- Exécuter la fonction
SELECT force_password_reset_all_users();

-- 2. Créer une table de blacklist pour les IPs malveillantes
CREATE TABLE IF NOT EXISTS public.ip_blacklist (
  id BIGSERIAL PRIMARY KEY,
  ip_address INET NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(255),
  is_permanent BOOLEAN DEFAULT false
);

CREATE INDEX idx_ip_blacklist_ip ON public.ip_blacklist(ip_address);
CREATE INDEX idx_ip_blacklist_blocked_until ON public.ip_blacklist(blocked_until);

-- 3. Créer une table pour tracker les tentatives d'injection SQL
CREATE TABLE IF NOT EXISTS public.sql_injection_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip_address INET NOT NULL,
  email VARCHAR(255),
  payload TEXT NOT NULL,
  user_agent TEXT,
  detected_patterns TEXT[],
  severity VARCHAR(20) DEFAULT 'high',
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sql_injection_ip ON public.sql_injection_attempts(ip_address);
CREATE INDEX idx_sql_injection_detected_at ON public.sql_injection_attempts(detected_at DESC);

-- 4. Table d'audit pour auth.users
CREATE TABLE IF NOT EXISTS public.auth_users_audit (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(10),
  old_data JSONB,
  new_data JSONB,
  changed_by VARCHAR(255),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET
);

-- 5. Fonction pour vérifier si une IP est blacklistée
CREATE OR REPLACE FUNCTION is_ip_blacklisted(p_ip_address INET)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.ip_blacklist 
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

  INSERT INTO public.ip_blacklist (
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

-- 7. Trigger pour auditer les changements sur auth.users
CREATE OR REPLACE FUNCTION audit_auth_users_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Ne pas logger les changements de last_sign_in_at pour éviter le spam
    IF OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at 
       AND OLD.email = NEW.email 
       AND OLD.encrypted_password = NEW.encrypted_password THEN
      RETURN NEW;
    END IF;
    
    INSERT INTO public.auth_users_audit (
      user_id,
      action,
      old_data,
      new_data,
      changed_by,
      ip_address
    ) VALUES (
      NEW.id,
      TG_OP,
      jsonb_build_object(
        'email', OLD.email,
        'role', OLD.role,
        'raw_user_meta_data', OLD.raw_user_meta_data
      ),
      jsonb_build_object(
        'email', NEW.email,
        'role', NEW.role,
        'raw_user_meta_data', NEW.raw_user_meta_data
      ),
      current_setting('app.current_user', true),
      inet_client_addr()
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.auth_users_audit (
      user_id,
      action,
      old_data,
      changed_by,
      ip_address
    ) VALUES (
      OLD.id,
      TG_OP,
      jsonb_build_object(
        'email', OLD.email,
        'role', OLD.role,
        'raw_user_meta_data', OLD.raw_user_meta_data
      ),
      current_setting('app.current_user', true),
      inet_client_addr()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Créer le trigger seulement s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'audit_auth_users_trigger'
  ) THEN
    CREATE TRIGGER audit_auth_users_trigger
    AFTER UPDATE OR DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION audit_auth_users_changes();
  END IF;
END $$;

-- 8. Politiques RLS pour les tables de sécurité
ALTER TABLE public.ip_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_injection_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_users_audit ENABLE ROW LEVEL SECURITY;

-- Politique pour ip_blacklist (lecture seule pour les admins)
CREATE POLICY "Only admins can view ip_blacklist"
ON public.ip_blacklist FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Politique pour sql_injection_attempts (lecture seule pour les admins)
CREATE POLICY "Only admins can view sql_injection_attempts"
ON public.sql_injection_attempts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Politique pour auth_users_audit (lecture seule pour les admins)
CREATE POLICY "Only admins can view auth_users_audit"
ON public.auth_users_audit FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- 9. Fonction pour vérifier les tentatives de login suspectes
CREATE OR REPLACE FUNCTION check_login_attempts(
  p_email VARCHAR,
  p_ip_address INET
)
RETURNS TABLE(
  is_blocked BOOLEAN,
  attempts_count INTEGER,
  block_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempts_count INTEGER;
  v_is_ip_blocked BOOLEAN;
BEGIN
  -- Vérifier si l'IP est blacklistée
  v_is_ip_blocked := is_ip_blacklisted(p_ip_address);
  
  IF v_is_ip_blocked THEN
    RETURN QUERY SELECT 
      true::BOOLEAN as is_blocked,
      0::INTEGER as attempts_count,
      'IP address is blacklisted'::TEXT as block_reason;
    RETURN;
  END IF;
  
  -- Compter les tentatives échouées récentes
  SELECT COUNT(*)::INTEGER INTO v_attempts_count
  FROM public.security_logs
  WHERE email = p_email
    AND event_type = 'login_failed'
    AND created_at > NOW() - INTERVAL '15 minutes';
  
  -- Bloquer après 5 tentatives
  IF v_attempts_count >= 5 THEN
    -- Blacklister l'IP pour 1 heure
    PERFORM blacklist_ip(
      p_ip_address,
      'Too many failed login attempts for ' || p_email,
      1,
      false
    );
    
    RETURN QUERY SELECT 
      true::BOOLEAN as is_blocked,
      v_attempts_count as attempts_count,
      'Too many failed attempts'::TEXT as block_reason;
  ELSE
    RETURN QUERY SELECT 
      false::BOOLEAN as is_blocked,
      v_attempts_count as attempts_count,
      NULL::TEXT as block_reason;
  END IF;
END;
$$;

-- 10. Vue pour monitorer la sécurité
CREATE OR REPLACE VIEW security_monitoring AS
SELECT 
  'failed_logins' as metric_type,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence
FROM public.security_logs
WHERE event_type = 'login_failed'
  AND created_at > NOW() - INTERVAL '1 hour'
UNION ALL
SELECT 
  'blocked_ips' as metric_type,
  COUNT(*) as count,
  MAX(blocked_at) as last_occurrence
FROM public.ip_blacklist
WHERE blocked_until > NOW() OR is_permanent = true
UNION ALL
SELECT 
  'sql_injections' as metric_type,
  COUNT(*) as count,
  MAX(detected_at) as last_occurrence
FROM public.sql_injection_attempts
WHERE detected_at > NOW() - INTERVAL '24 hours';

-- 11. Notification pour les admins
DO $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Créer une notification pour chaque admin
  FOR admin_record IN 
    SELECT id, email 
    FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  LOOP
    INSERT INTO public.security_notifications (
      user_id,
      notification_type,
      title,
      message,
      severity
    ) VALUES (
      admin_record.id::INTEGER,
      'unusual_activity',
      'ALERTE SÉCURITÉ: Patch d''urgence appliqué',
      'Une attaque par injection SQL a été détectée et bloquée. Tous les utilisateurs doivent réinitialiser leur mot de passe. Veuillez vérifier les logs de sécurité.',
      'critical'
    );
  END LOOP;
END $$;

-- 12. Fonction pour valider les entrées (à utiliser dans les fonctions RPC)
CREATE OR REPLACE FUNCTION validate_input(
  p_input TEXT,
  p_input_type VARCHAR DEFAULT 'general'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  sql_patterns TEXT[] := ARRAY[
    '(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)',
    '(--)|(;)|(\/\*)|(xp_)|(sp_)',
    '(OR\s+\d+\s*=\s*\d+)',
    '(AND\s+\d+\s*=\s*\d+)',
    '(EXEC|EXECUTE|CAST|DECLARE)',
    '(SCRIPT|JAVASCRIPT)',
    '(<script|<iframe|javascript:)',
    '(LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE)'
  ];
  pattern TEXT;
BEGIN
  -- Vérifier chaque pattern
  FOREACH pattern IN ARRAY sql_patterns
  LOOP
    IF p_input ~* pattern THEN
      -- Logger la tentative
      INSERT INTO public.sql_injection_attempts (
        email,
        payload,
        detected_patterns,
        severity
      ) VALUES (
        p_input_type,
        p_input,
        ARRAY[pattern],
        'high'
      );
      
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$;

-- =========================================================
-- IMPORTANT: Actions manuelles requises après ce script
-- =========================================================
-- 1. Redémarrer Supabase pour appliquer les triggers
-- 2. Changer TOUTES les clés API dans le dashboard Supabase
-- 3. Activer "Enable Email Confirmations" dans Authentication > Settings
-- 4. Configurer les Rate Limits dans le dashboard
-- 5. Activer l'audit log dans Settings > Logs
-- 6. Notifier tous les utilisateurs du reset obligatoire
-- 7. Mettre à jour le code pour vérifier must_reset_password
-- =========================================================

COMMENT ON TABLE public.ip_blacklist IS 'Table de blocage des IPs malveillantes suite à l''attaque SQL injection';
COMMENT ON TABLE public.sql_injection_attempts IS 'Log des tentatives d''injection SQL détectées';
COMMENT ON TABLE public.auth_users_audit IS 'Audit trail pour toutes les modifications sur auth.users';
COMMENT ON FUNCTION validate_input IS 'Valide les entrées pour détecter les injections SQL';
