-- =========================================================
-- SUPABASE AUTH INTEGRATION (FIXED)
-- Lier app_user à Supabase Auth pour RLS fonctionnel
-- Date: 2026-01-04
-- =========================================================
-- Version corrigée: fonctions dans public au lieu de auth
-- =========================================================

BEGIN;

-- =========================================================
-- 1) AJOUTER COLONNE auth_user_id DANS app_user
-- =========================================================

ALTER TABLE public.app_user
  ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- Index pour performance (lookup par auth.uid())
CREATE INDEX IF NOT EXISTS idx_app_user_auth_user_id 
  ON public.app_user(auth_user_id);

-- Contrainte d'unicité: un user Supabase = un seul app_user
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_user_auth_user_id_unique 
  ON public.app_user(auth_user_id) 
  WHERE auth_user_id IS NOT NULL;

-- Foreign key vers auth.users (si possible)
-- Note: peut échouer si auth.users n'est pas accessible
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.app_user
      ADD CONSTRAINT app_user_auth_user_fk
      FOREIGN KEY (auth_user_id) 
      REFERENCES auth.users(id)
      ON DELETE SET NULL;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- Contrainte existe déjà
    WHEN undefined_table THEN
      RAISE NOTICE 'Table auth.users non accessible, FK non créée';
  END;
END $$;

COMMENT ON COLUMN public.app_user.auth_user_id IS 
  'UUID du user Supabase Auth (auth.users.id). NULL = user legacy non migré.';

-- =========================================================
-- 2) FONCTIONS HELPERS DANS PUBLIC (au lieu de auth)
-- =========================================================

-- Récupère l'ID de app_user basé sur le JWT Supabase
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT u.id
  FROM public.app_user u
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.current_app_user_id() IS
  'Retourne l''ID de app_user lié au user Supabase authentifié (via JWT).';

-- Récupère le role_id de l'utilisateur courant
CREATE OR REPLACE FUNCTION public.current_user_role_id()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(u.role_id, 0)
  FROM public.app_user u
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.current_user_role_id() IS
  'Retourne le role_id de l''utilisateur authentifié (0 si non trouvé).';

-- Récupère le client_id de l'utilisateur courant
CREATE OR REPLACE FUNCTION public.current_user_client_id()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT u.client_id
  FROM public.app_user u
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.current_user_client_id() IS
  'Retourne le client_id de l''utilisateur authentifié (NULL pour admin/staff).';

-- Vérifie si l'utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.app_user u
    JOIN public.role r ON u.role_id = r.id
    WHERE u.auth_user_id = auth.uid()
      AND r.code = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'Retourne TRUE si l''utilisateur authentifié a le rôle admin.';

-- Vérifie si l'utilisateur est client
CREATE OR REPLACE FUNCTION public.is_client()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.app_user u
    JOIN public.role r ON u.role_id = r.id
    WHERE u.auth_user_id = auth.uid()
      AND r.code = 'client'
  );
$$;

COMMENT ON FUNCTION public.is_client() IS
  'Retourne TRUE si l''utilisateur authentifié a le rôle client.';

-- =========================================================
-- 3) FONCTION HELPER POUR MIGRATION PROGRESSIVE
-- =========================================================

-- Vérifie si un utilisateur est authentifié (JWT présent)
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

COMMENT ON FUNCTION public.is_authenticated() IS
  'Retourne TRUE si un JWT Supabase est présent dans la requête.';

COMMIT;

-- =========================================================
-- NOTES DE MIGRATION
-- =========================================================
-- 
-- Après avoir exécuté ce script :
--
-- 1. Les fonctions sont créées dans public.* au lieu de auth.*
-- 2. Les policies RLS doivent utiliser public.is_admin() 
--    au lieu de auth.is_admin()
-- 3. Le script RLS a été mis à jour en conséquence
--
-- ÉTAPES SUIVANTES :
-- 
-- A) Exécuter ce script (20260104_supabase_auth_integration_fixed.sql)
-- B) Exécuter le script RLS mis à jour
-- C) Migrer Auth UI vers Supabase Auth
-- D) Créer/lier les users
--
-- =========================================================
