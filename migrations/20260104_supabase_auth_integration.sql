-- =========================================================
-- SUPABASE AUTH INTEGRATION
-- Lier app_user à Supabase Auth pour RLS fonctionnel
-- Date: 2026-01-04
-- =========================================================
-- Cette migration prépare la DB pour utiliser Supabase Auth
-- tout en conservant le schéma RBAC existant (app_user/role/client).
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

-- Foreign key vers auth.users (recommandé)
-- Note: nécessite que auth.users existe (Supabase oui)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'app_user_auth_user_fk'
  ) THEN
    ALTER TABLE public.app_user
      ADD CONSTRAINT app_user_auth_user_fk
      FOREIGN KEY (auth_user_id) 
      REFERENCES auth.users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

COMMENT ON COLUMN public.app_user.auth_user_id IS 
  'UUID du user Supabase Auth (auth.users.id). NULL = user legacy non migré.';

-- =========================================================
-- 2) CRÉER SCHÉMA auth SI N'EXISTE PAS
-- =========================================================

CREATE SCHEMA IF NOT EXISTS auth;

-- =========================================================
-- 3) FONCTIONS HELPERS BASÉES SUR auth.uid()
-- =========================================================

-- Récupère l'ID de app_user basé sur le JWT Supabase
CREATE OR REPLACE FUNCTION auth.current_app_user_id()
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

COMMENT ON FUNCTION auth.current_app_user_id() IS
  'Retourne l''ID de app_user lié au user Supabase authentifié (via JWT).';

-- Récupère le role_id de l'utilisateur courant
CREATE OR REPLACE FUNCTION auth.current_user_role_id()
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

COMMENT ON FUNCTION auth.current_user_role_id() IS
  'Retourne le role_id de l''utilisateur authentifié (0 si non trouvé).';

-- Récupère le client_id de l'utilisateur courant
CREATE OR REPLACE FUNCTION auth.current_user_client_id()
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

COMMENT ON FUNCTION auth.current_user_client_id() IS
  'Retourne le client_id de l''utilisateur authentifié (NULL pour admin/staff).';

-- Vérifie si l'utilisateur est admin
CREATE OR REPLACE FUNCTION auth.is_admin()
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

COMMENT ON FUNCTION auth.is_admin() IS
  'Retourne TRUE si l''utilisateur authentifié a le rôle admin.';

-- Vérifie si l'utilisateur est client
CREATE OR REPLACE FUNCTION auth.is_client()
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

COMMENT ON FUNCTION auth.is_client() IS
  'Retourne TRUE si l''utilisateur authentifié a le rôle client.';

-- =========================================================
-- 4) FONCTION HELPER POUR MIGRATION PROGRESSIVE
-- =========================================================

-- Vérifie si un utilisateur est authentifié (JWT présent)
CREATE OR REPLACE FUNCTION auth.is_authenticated()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

COMMENT ON FUNCTION auth.is_authenticated() IS
  'Retourne TRUE si un JWT Supabase est présent dans la requête.';

COMMIT;

-- =========================================================
-- NOTES DE MIGRATION
-- =========================================================
-- 
-- Après avoir exécuté ce script :
--
-- 1. Les fonctions auth.* sont maintenant basées sur auth.uid()
-- 2. L'ancien système avec current_setting('app.current_user_id') 
--    ne fonctionnera plus
-- 3. Il faut migrer l'authentification UI vers Supabase Auth
--
-- ÉTAPES SUIVANTES :
-- 
-- A) Créer les users Supabase pour les app_user existants
-- B) Lier les comptes: UPDATE app_user SET auth_user_id = '...'
-- C) Migrer le login/signup vers Supabase Auth
-- D) Appliquer le script RLS (celui proposé initialement)
--
-- =========================================================
