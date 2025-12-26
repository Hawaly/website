-- =========================================================
-- CORRECTION RAPIDE CLIENT ID 4
-- =========================================================

-- 1. Voir l'état actuel de l'utilisateur
SELECT 
  '=== AVANT CORRECTION ===' as info,
  id,
  email,
  role_id,
  client_id,
  is_active
FROM public.app_user 
WHERE email = 'client4@example.com';

-- 2. CORRECTION : Assurer que client_id = 4
UPDATE public.app_user 
SET 
  client_id = 4,
  role_id = 2,
  is_active = true
WHERE email = 'client4@example.com';

-- 3. Vérifier après correction
SELECT 
  '=== APRÈS CORRECTION ===' as info,
  u.id,
  u.email,
  u.role_id,
  u.client_id,
  u.is_active,
  r.code as role_code,
  r.name as role_name,
  c.name as client_name,
  c.company_name
FROM public.app_user u
LEFT JOIN public.role r ON u.role_id = r.id
LEFT JOIN public.client c ON u.client_id = c.id
WHERE u.email = 'client4@example.com';

-- 4. Si l'utilisateur n'existe pas du tout, le créer
INSERT INTO public.app_user (email, password_hash, role_id, client_id, is_active)
SELECT 
  'client4@example.com',
  '$2a$10$5vJqMhmYLZCxJzPe5wDmzOjKwDVoGUaXMsJXtmLbJqGqPckZ3Y3Aq',
  2,
  4,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.app_user WHERE email = 'client4@example.com'
);

-- 5. Vérification finale avec tous les détails
SELECT 
  '=== VÉRIFICATION FINALE ===' as info,
  u.id as user_id,
  u.email,
  u.role_id,
  r.id as role_table_id,
  r.code as role_code,
  u.client_id,
  c.id as client_table_id,
  c.name as client_name,
  u.is_active
FROM public.app_user u
LEFT JOIN public.role r ON u.role_id = r.id
LEFT JOIN public.client c ON u.client_id = c.id
WHERE u.email = 'client4@example.com';
