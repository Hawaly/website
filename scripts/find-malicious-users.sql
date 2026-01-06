-- =========================================================
-- SCRIPT DE DÉTECTION DES COMPTES MALVEILLANTS
-- Date: 2026-01-06
-- =========================================================

-- 1. Tous les utilisateurs créés récemment (ajuster la date)
SELECT 
  id,
  email,
  role_id,
  is_active,
  created_at,
  auth_user_id,
  'Utilisateur récent' as flag
FROM app_user
WHERE created_at > '2025-12-01'  -- Ajuster selon vos besoins
ORDER BY created_at DESC;

-- 2. Tous les admins (vérifier qu'ils sont légitimes)
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.is_active,
  u.auth_user_id,
  r.code as role,
  r.name as role_name,
  'Admin' as flag
FROM app_user u
JOIN role r ON u.role_id = r.id
WHERE r.code = 'admin'
ORDER BY u.created_at DESC;

-- 3. Utilisateurs avec des emails suspects
SELECT 
  id,
  email,
  role_id,
  created_at,
  is_active,
  'Email suspect' as flag
FROM app_user
WHERE 
  email LIKE '%hack%'
  OR email LIKE '%test%'
  OR email LIKE '%evil%'
  OR email LIKE '%temp%'
  OR email LIKE '%fake%'
  OR email LIKE '%bot%'
ORDER BY created_at DESC;

-- 4. Utilisateurs sans client_id mais avec role client (suspect)
SELECT 
  u.id,
  u.email,
  u.role_id,
  u.client_id,
  u.created_at,
  r.code as role,
  'Client sans client_id' as flag
FROM app_user u
JOIN role r ON u.role_id = r.id
WHERE r.code = 'client' AND u.client_id IS NULL
ORDER BY u.created_at DESC;

-- 5. Vérifier les logs de sécurité pour activités suspectes
SELECT 
  sl.id,
  sl.user_id,
  sl.email,
  sl.event_type,
  sl.event_status,
  sl.ip_address,
  sl.created_at,
  u.email as user_email,
  r.code as user_role
FROM security_logs sl
LEFT JOIN app_user u ON sl.user_id = u.id
LEFT JOIN role r ON u.role_id = r.id
WHERE 
  sl.event_type IN ('login', 'login_failed')
  AND sl.created_at > NOW() - INTERVAL '7 days'
ORDER BY sl.created_at DESC
LIMIT 100;

-- 6. Connexions réussies depuis des IPs inhabituelles
SELECT DISTINCT
  sl.ip_address,
  COUNT(*) as login_count,
  ARRAY_AGG(DISTINCT sl.email) as emails,
  MIN(sl.created_at) as first_login,
  MAX(sl.created_at) as last_login
FROM security_logs sl
WHERE 
  sl.event_type = 'login'
  AND sl.event_status = 'success'
  AND sl.created_at > NOW() - INTERVAL '30 days'
GROUP BY sl.ip_address
ORDER BY login_count DESC;

-- =========================================================
-- COMMANDES POUR SUPPRIMER UN UTILISATEUR MALVEILLANT
-- =========================================================

-- ATTENTION: Vérifier l'ID avant d'exécuter!
-- Remplacer XXX par l'ID de l'utilisateur à supprimer

-- Étape 1: Vérifier l'utilisateur
-- SELECT * FROM app_user WHERE id = XXX;

-- Étape 2: Récupérer son auth_user_id
-- SELECT auth_user_id FROM app_user WHERE id = XXX;

-- Étape 3: Supprimer de app_user
-- DELETE FROM app_user WHERE id = XXX;

-- Étape 4: Supprimer de Supabase Auth (via dashboard ou API)
-- await supabaseAdmin.auth.admin.deleteUser('auth_user_id')

-- =========================================================
-- ANALYSE DES PATTERNS D'ATTAQUE
-- =========================================================

-- Tentatives de login échouées avant connexion réussie (brute force?)
SELECT 
  email,
  COUNT(*) as failed_attempts,
  MIN(created_at) as first_attempt,
  MAX(created_at) as last_attempt,
  ARRAY_AGG(DISTINCT ip_address::text) as ips_used
FROM security_logs
WHERE 
  event_type = 'login_failed'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY email
HAVING COUNT(*) > 5
ORDER BY failed_attempts DESC;

-- Utilisateurs qui se sont connectés juste après leur création (suspect)
SELECT 
  u.id,
  u.email,
  u.created_at as account_created,
  MIN(sl.created_at) as first_login,
  EXTRACT(EPOCH FROM (MIN(sl.created_at) - u.created_at)) / 60 as minutes_between,
  r.code as role
FROM app_user u
LEFT JOIN security_logs sl ON sl.user_id = u.id AND sl.event_type = 'login'
LEFT JOIN role r ON u.role_id = r.id
WHERE u.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email, u.created_at, r.code
HAVING MIN(sl.created_at) IS NOT NULL
  AND EXTRACT(EPOCH FROM (MIN(sl.created_at) - u.created_at)) / 60 < 5
ORDER BY minutes_between ASC;
