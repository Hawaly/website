-- =========================================================
-- ENABLE RLS WITH SUPABASE AUTH
-- Active RLS sur toutes les tables avec policies compatibles
-- Date: 2026-01-04
-- =========================================================
-- ⚠️ PRÉREQUIS: Avoir exécuté 20260104_supabase_auth_integration_fixed.sql
-- ⚠️ IMPORTANT: Auth UI doit être migrée vers Supabase Auth
-- ⚠️ NOTE: Utilise public.is_admin() au lieu de auth.is_admin()
-- =========================================================

BEGIN;

-- =========================================================
-- 1) ENABLE RLS SUR TOUTES LES TABLES
-- =========================================================

ALTER TABLE IF EXISTS public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expense ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expense_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoice_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mandat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.video_script ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.role ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.social_media_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contrat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mandat_task ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoice ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meeting_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pipeline_history ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.pitch_deck_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pitch_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pitch_deck_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pitch_deck_templates ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.video_task_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.video_figurant ENABLE ROW LEVEL SECURITY;

-- Tables supplémentaires
ALTER TABLE IF EXISTS public.editorial_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.editorial_post ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.persona ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pilier_contenu ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kpi ENABLE ROW LEVEL SECURITY;

-- Force RLS même pour le propriétaire de la table
-- (service_role key bypass toujours RLS grâce à BYPASSRLS attribute)
ALTER TABLE IF EXISTS public.audit_log FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expense FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expense_category FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoice_item FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mandat FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.video_script FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.role FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.social_media_strategy FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_session FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_log FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_user FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contrat FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mandat_task FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoice FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.activities FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prospects FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contacts FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meetings FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meeting_minutes FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pipeline_history FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.pitch_deck_assets FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pitch_decks FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pitch_deck_versions FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pitch_deck_templates FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.video_task_details FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.video_figurant FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.editorial_calendar FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.editorial_post FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.persona FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pilier_contenu FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kpi FORCE ROW LEVEL SECURITY;

-- =========================================================
-- 2) POLICIES ADMIN (ACCÈS TOTAL)
-- =========================================================

DO $$
DECLARE
  p_name text;
  t_name text;
  tables_array text[] := ARRAY[
    'audit_log','expense','expense_category','invoice_item','mandat','video_script',
    'role','social_media_strategy','user_session','activity_log','app_user','client',
    'company_settings','contrat','mandat_task','invoice',
    'activities','prospects','contacts','meetings','meeting_minutes','pipeline_history',
    'pitch_deck_assets','pitch_decks','pitch_deck_versions','pitch_deck_templates',
    'video_task_details','video_figurant',
    'editorial_calendar','editorial_post','persona','pilier_contenu','kpi'
  ];
BEGIN
  FOREACH t_name IN ARRAY tables_array
  LOOP
    p_name := 'admin_all_' || t_name;

    -- Vérifier que la table existe
    IF to_regclass('public.' || t_name) IS NOT NULL THEN
      -- Supprimer la policy si elle existe déjà
      IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='public' AND tablename=t_name AND policyname=p_name
      ) THEN
        EXECUTE format('DROP POLICY %I ON public.%I;', p_name, t_name);
      END IF;
      
      -- Créer la policy admin
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());',
        p_name, t_name
      );
    END IF;
  END LOOP;
END $$;

-- =========================================================
-- 3) POLICIES CLIENT (LECTURE DONNÉES PROPRES)
-- =========================================================

-- Table client: accès à son propre record
DO $$
BEGIN
  IF to_regclass('public.client') IS NOT NULL THEN
    -- Drop si existe
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client' AND policyname='client_select_own_client') THEN
      DROP POLICY client_select_own_client ON public.client;
    END IF;
    
    CREATE POLICY client_select_own_client ON public.client
      FOR SELECT USING (
        public.is_client() 
        AND id = public.current_user_client_id()
      );
  END IF;
END $$;

-- Table mandat: accès aux mandats du client
DO $$
BEGIN
  IF to_regclass('public.mandat') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mandat' AND policyname='client_select_own_mandats') THEN
      DROP POLICY client_select_own_mandats ON public.mandat;
    END IF;
    
    CREATE POLICY client_select_own_mandats ON public.mandat
      FOR SELECT USING (
        public.is_client() 
        AND client_id = public.current_user_client_id()
      );
  END IF;
END $$;

-- Table mandat_task: accès via mandat
DO $$
BEGIN
  IF to_regclass('public.mandat_task') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mandat_task' AND policyname='client_select_own_mandat_tasks') THEN
      DROP POLICY client_select_own_mandat_tasks ON public.mandat_task;
    END IF;
    
    CREATE POLICY client_select_own_mandat_tasks ON public.mandat_task
      FOR SELECT USING (
        public.is_client()
        AND EXISTS (
          SELECT 1 FROM public.mandat m
          WHERE m.id = mandat_task.mandat_id
            AND m.client_id = public.current_user_client_id()
        )
      );
  END IF;
END $$;

-- Table invoice: accès aux factures du client
DO $$
BEGIN
  IF to_regclass('public.invoice') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='invoice' AND policyname='client_select_own_invoices') THEN
      DROP POLICY client_select_own_invoices ON public.invoice;
    END IF;
    
    CREATE POLICY client_select_own_invoices ON public.invoice
      FOR SELECT USING (
        public.is_client() 
        AND client_id = public.current_user_client_id()
      );
  END IF;
END $$;

-- Table invoice_item: accès via invoice
DO $$
BEGIN
  IF to_regclass('public.invoice_item') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='invoice_item' AND policyname='client_select_own_invoice_items') THEN
      DROP POLICY client_select_own_invoice_items ON public.invoice_item;
    END IF;
    
    CREATE POLICY client_select_own_invoice_items ON public.invoice_item
      FOR SELECT USING (
        public.is_client()
        AND EXISTS (
          SELECT 1 FROM public.invoice i
          WHERE i.id = invoice_item.invoice_id
            AND i.client_id = public.current_user_client_id()
        )
      );
  END IF;
END $$;

-- Table contrat: accès aux contrats du client
DO $$
BEGIN
  IF to_regclass('public.contrat') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contrat' AND policyname='client_select_own_contrats') THEN
      DROP POLICY client_select_own_contrats ON public.contrat;
    END IF;
    
    CREATE POLICY client_select_own_contrats ON public.contrat
      FOR SELECT USING (
        public.is_client() 
        AND client_id = public.current_user_client_id()
      );
  END IF;
END $$;

-- Table social_media_strategy: accès aux stratégies du client
DO $$
BEGIN
  IF to_regclass('public.social_media_strategy') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='social_media_strategy' AND policyname='client_select_own_strategies') THEN
      DROP POLICY client_select_own_strategies ON public.social_media_strategy;
    END IF;
    
    CREATE POLICY client_select_own_strategies ON public.social_media_strategy
      FOR SELECT USING (
        public.is_client() 
        AND client_id = public.current_user_client_id()
      );
  END IF;
END $$;

-- Table editorial_calendar: accès via strategy
DO $$
BEGIN
  IF to_regclass('public.editorial_calendar') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='editorial_calendar' AND policyname='client_select_own_calendars') THEN
      DROP POLICY client_select_own_calendars ON public.editorial_calendar;
    END IF;
    
    CREATE POLICY client_select_own_calendars ON public.editorial_calendar
      FOR SELECT USING (
        public.is_client()
        AND EXISTS (
          SELECT 1 FROM public.social_media_strategy s
          WHERE s.id = editorial_calendar.strategy_id
            AND s.client_id = public.current_user_client_id()
        )
      );
  END IF;
END $$;

-- Table editorial_post: accès via calendar -> strategy
DO $$
BEGIN
  IF to_regclass('public.editorial_post') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='editorial_post' AND policyname='client_select_own_posts') THEN
      DROP POLICY client_select_own_posts ON public.editorial_post;
    END IF;
    
    CREATE POLICY client_select_own_posts ON public.editorial_post
      FOR SELECT USING (
        public.is_client()
        AND EXISTS (
          SELECT 1
          FROM public.editorial_calendar c
          JOIN public.social_media_strategy s ON s.id = c.strategy_id
          WHERE c.id = editorial_post.calendar_id
            AND s.client_id = public.current_user_client_id()
        )
      );
  END IF;
END $$;

-- Table video_script: accès multi-sources
DO $$
BEGIN
  IF to_regclass('public.video_script') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='video_script' AND policyname='client_select_own_video_scripts') THEN
      DROP POLICY client_select_own_video_scripts ON public.video_script;
    END IF;
    
    CREATE POLICY client_select_own_video_scripts ON public.video_script
      FOR SELECT USING (
        public.is_client()
        AND (
          (client_id IS NOT NULL AND client_id = public.current_user_client_id())
          OR (mandat_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.mandat m
            WHERE m.id = video_script.mandat_id
              AND m.client_id = public.current_user_client_id()
          ))
          OR (editorial_post_id IS NOT NULL AND EXISTS (
            SELECT 1
            FROM public.editorial_post p
            JOIN public.editorial_calendar c ON c.id = p.calendar_id
            JOIN public.social_media_strategy s ON s.id = c.strategy_id
            WHERE p.id = video_script.editorial_post_id
              AND s.client_id = public.current_user_client_id()
          ))
        )
      );
  END IF;
END $$;

-- =========================================================
-- 4) POLICIES SPÉCIALES
-- =========================================================

-- Table role: lecture pour tous les authentifiés
DO $$
BEGIN
  IF to_regclass('public.role') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='role' AND policyname='authenticated_read_roles') THEN
      DROP POLICY authenticated_read_roles ON public.role;
    END IF;
    
    CREATE POLICY authenticated_read_roles ON public.role
      FOR SELECT USING (public.is_authenticated());
  END IF;
END $$;

-- Table app_user: utilisateur peut lire son propre profil
DO $$
BEGIN
  IF to_regclass('public.app_user') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='app_user' AND policyname='user_read_own_profile') THEN
      DROP POLICY user_read_own_profile ON public.app_user;
    END IF;
    
    CREATE POLICY user_read_own_profile ON public.app_user
      FOR SELECT USING (
        public.is_authenticated() 
        AND id = public.current_app_user_id()
      );
  END IF;
END $$;

-- =========================================================
-- 5) RECREATE VIEWS WITH security_invoker = true
-- =========================================================

-- Drop vues existantes avant de les recréer
DROP VIEW IF EXISTS public.user_with_details CASCADE;
DROP VIEW IF EXISTS public.v_editorial_posts_full CASCADE;
DROP VIEW IF EXISTS public.v_calendar_statistics CASCADE;
DROP VIEW IF EXISTS public.v_strategy_summary CASCADE;
DROP VIEW IF EXISTS public.v_posts_by_pilier CASCADE;

-- Recréer les vues avec security_invoker = true
CREATE VIEW public.user_with_details
WITH (security_invoker = true) AS
SELECT 
  u.id as user_id, u.email, u.is_active, u.last_login, u.created_at,
  u.auth_user_id,
  r.id as role_id, r.code as role_code, r.name as role_name, r.redirect_path,
  u.client_id, c.name as client_name, c.company_name, c.email as client_email
FROM public.app_user u
INNER JOIN public.role r ON u.role_id = r.id
LEFT JOIN public.client c ON u.client_id = c.id;

CREATE VIEW public.v_editorial_posts_full
WITH (security_invoker = true) AS
SELECT 
  ep.*, ec.strategy_id, ec.name AS calendar_name,
  sms.client_id, c.name AS client_name, c.company_name AS client_company
FROM public.editorial_post ep
JOIN public.editorial_calendar ec ON ep.calendar_id = ec.id
JOIN public.social_media_strategy sms ON ec.strategy_id = sms.id
JOIN public.client c ON sms.client_id = c.id;

CREATE VIEW public.v_calendar_statistics
WITH (security_invoker = true) AS
SELECT 
  ec.id AS calendar_id, ec.strategy_id, sms.client_id,
  COUNT(ep.id) AS total_posts,
  COUNT(CASE WHEN ep.status = 'draft' THEN 1 END) AS draft_posts,
  COUNT(CASE WHEN ep.status = 'scheduled' THEN 1 END) AS scheduled_posts,
  COUNT(CASE WHEN ep.status = 'published' THEN 1 END) AS published_posts,
  COUNT(CASE WHEN ep.status = 'cancelled' THEN 1 END) AS cancelled_posts,
  SUM(ep.likes) AS total_likes,
  SUM(ep.comments) AS total_comments,
  SUM(ep.shares) AS total_shares,
  SUM(ep.views) AS total_views,
  AVG(ep.engagement_rate) AS avg_engagement_rate
FROM public.editorial_calendar ec
LEFT JOIN public.editorial_post ep ON ec.id = ep.calendar_id
JOIN public.social_media_strategy sms ON ec.strategy_id = sms.id
GROUP BY ec.id, ec.strategy_id, sms.client_id;

CREATE VIEW public.v_strategy_summary
WITH (security_invoker = true) AS
SELECT 
  sms.id, sms.client_id, sms.status, sms.created_at,
  COUNT(DISTINCT p.id) AS nombre_personas,
  COUNT(DISTINCT pc.id) AS nombre_piliers,
  COUNT(DISTINCT k.id) AS nombre_kpis,
  COUNT(DISTINCT ec.id) AS has_calendar
FROM public.social_media_strategy sms
LEFT JOIN public.persona p ON sms.id = p.strategy_id
LEFT JOIN public.pilier_contenu pc ON sms.id = pc.strategy_id
LEFT JOIN public.kpi k ON sms.id = k.strategy_id
LEFT JOIN public.editorial_calendar ec ON sms.id = ec.strategy_id
GROUP BY sms.id, sms.client_id, sms.status, sms.created_at;

CREATE VIEW public.v_posts_by_pilier
WITH (security_invoker = true) AS
SELECT 
  pc.id AS pilier_id, pc.strategy_id, pc.titre AS pilier_titre,
  COUNT(ep.id) AS nombre_posts,
  COUNT(CASE WHEN ep.status = 'published' THEN 1 END) AS posts_publies,
  COUNT(CASE WHEN ep.status = 'scheduled' THEN 1 END) AS posts_programmes
FROM public.pilier_contenu pc
LEFT JOIN public.editorial_post ep ON pc.id = ep.pilier_id
GROUP BY pc.id, pc.strategy_id, pc.titre;

COMMIT;

-- =========================================================
-- VÉRIFICATIONS POST-MIGRATION
-- =========================================================
-- 
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname='public' 
-- ORDER BY tablename;
--
-- SELECT schemaname, tablename, policyname, permissive, cmd 
-- FROM pg_policies 
-- WHERE schemaname='public' 
-- ORDER BY tablename, policyname;
--
-- =========================================================
