-- =========================================================
-- VÉRIFICATION UTILISATEUR CLIENT ID 4
-- =========================================================

-- 1. Vérifier que le client ID 4 existe
SELECT 
  '=== CLIENT ID 4 ===' as info,
  id,
  name,
  email,
  company_name,
  phone
FROM public.client 
WHERE id = 4;

-- 2. Vérifier l'utilisateur associé au client ID 4
SELECT 
  '=== APP_USER CLIENT 4 ===' as info,
  u.id,
  u.email,
  u.role_id,
  u.client_id,
  u.is_active,
  u.created_at
FROM public.app_user u
WHERE u.client_id = 4 OR u.email LIKE '%client4%';

-- 3. Vérifier avec jointure (comme dans l'API)
SELECT 
  '=== AVEC JOINTURE ===' as info,
  u.id,
  u.email,
  u.client_id,
  r.id as role_id,
  r.code as role_code,
  r.name as role_name,
  c.id as client_table_id,
  c.name as client_name,
  c.company_name
FROM public.app_user u
LEFT JOIN public.role r ON u.role_id = r.id
LEFT JOIN public.client c ON u.client_id = c.id
WHERE u.client_id = 4;

-- 4. Vérifier tous les utilisateurs clients
SELECT 
  '=== TOUS LES CLIENTS ===' as info,
  u.id,
  u.email,
  u.client_id,
  r.code as role,
  c.name as client_name
FROM public.app_user u
LEFT JOIN public.role r ON u.role_id = r.id
LEFT JOIN public.client c ON u.client_id = c.id
WHERE r.code = 'client'
ORDER BY u.id;

-- 5. Si l'utilisateur n'a PAS de client_id, le corriger
-- DÉCOMMENTER SI NÉCESSAIRE :
/*
UPDATE public.app_user 
SET client_id = 4 
WHERE email = 'client4@example.com' AND client_id IS NULL;
*/
