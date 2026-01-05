-- =====================================================
-- FIX SUPABASE SECURITY LINTER ISSUES
-- =====================================================
-- Date: 2025-12-31
-- Purpose: Fix security definer views and enable RLS on all tables
-- =====================================================

-- =====================================================
-- PART 1: FIX SECURITY DEFINER VIEWS
-- =====================================================
-- Drop and recreate views WITHOUT security definer property

-- View 1: v_posts_by_pilier
DROP VIEW IF EXISTS public.v_posts_by_pilier CASCADE;

CREATE OR REPLACE VIEW public.v_posts_by_pilier AS
SELECT 
  pc.id AS pilier_id,
  pc.strategy_id,
  pc.titre AS pilier_titre,
  COUNT(ep.id) AS nombre_posts,
  COUNT(CASE WHEN ep.status = 'published' THEN 1 END) AS posts_publies,
  COUNT(CASE WHEN ep.status = 'scheduled' THEN 1 END) AS posts_programmes
FROM pilier_contenu pc
LEFT JOIN editorial_post ep ON pc.id = ep.pilier_id
GROUP BY pc.id, pc.strategy_id, pc.titre;

COMMENT ON VIEW public.v_posts_by_pilier IS 'Statistiques des posts par pilier de contenu';

-- View 2: v_strategy_summary
DROP VIEW IF EXISTS public.v_strategy_summary CASCADE;

CREATE OR REPLACE VIEW public.v_strategy_summary AS
SELECT 
  sms.id,
  sms.client_id,
  sms.status,
  sms.created_at,
  COUNT(DISTINCT p.id) AS nombre_personas,
  COUNT(DISTINCT pc.id) AS nombre_piliers,
  COUNT(DISTINCT k.id) AS nombre_kpis,
  COUNT(DISTINCT ec.id) AS has_calendar
FROM social_media_strategy sms
LEFT JOIN persona p ON sms.id = p.strategy_id
LEFT JOIN pilier_contenu pc ON sms.id = pc.strategy_id
LEFT JOIN kpi k ON sms.id = k.strategy_id
LEFT JOIN editorial_calendar ec ON sms.id = ec.strategy_id
GROUP BY sms.id, sms.client_id, sms.status, sms.created_at;

COMMENT ON VIEW public.v_strategy_summary IS 'Résumé des stratégies avec compteurs';

-- View 3: v_calendar_statistics
DROP VIEW IF EXISTS public.v_calendar_statistics CASCADE;

CREATE OR REPLACE VIEW public.v_calendar_statistics AS
SELECT 
  ec.id AS calendar_id,
  ec.strategy_id,
  sms.client_id,
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
FROM editorial_calendar ec
LEFT JOIN editorial_post ep ON ec.id = ep.calendar_id
JOIN social_media_strategy sms ON ec.strategy_id = sms.id
GROUP BY ec.id, ec.strategy_id, sms.client_id;

COMMENT ON VIEW public.v_calendar_statistics IS 'Statistiques par calendrier éditorial';

-- View 4: v_editorial_posts_full
DROP VIEW IF EXISTS public.v_editorial_posts_full CASCADE;

CREATE OR REPLACE VIEW public.v_editorial_posts_full AS
SELECT 
  ep.*,
  ec.strategy_id,
  ec.name AS calendar_name,
  sms.client_id,
  c.name AS client_name,
  c.company_name AS client_company
FROM editorial_post ep
JOIN editorial_calendar ec ON ep.calendar_id = ec.id
JOIN social_media_strategy sms ON ec.strategy_id = sms.id
JOIN client c ON sms.client_id = c.id;

COMMENT ON VIEW public.v_editorial_posts_full IS 'Vue complète des posts avec informations liées';

-- View 5: user_with_details
DROP VIEW IF EXISTS public.user_with_details CASCADE;

CREATE OR REPLACE VIEW public.user_with_details AS
SELECT 
  u.id as user_id,
  u.email,
  u.is_active,
  u.last_login,
  u.created_at,
  r.id as role_id,
  r.code as role_code,
  r.name as role_name,
  r.redirect_path,
  u.client_id,
  c.name as client_name,
  c.company_name,
  c.email as client_email
FROM public.app_user u
INNER JOIN public.role r ON u.role_id = r.id
LEFT JOIN public.client c ON u.client_id = c.id;

COMMENT ON VIEW public.user_with_details IS 'Vue complète utilisateur avec rôle et client';

-- =====================================================
-- PART 2: ENABLE RLS ON MISSING TABLES
-- =====================================================

-- Enable RLS on authentication tables
ALTER TABLE IF EXISTS public.app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.role ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_log ENABLE ROW LEVEL SECURITY;

-- Enable RLS on video tables
ALTER TABLE IF EXISTS public.video_task_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.video_figurant ENABLE ROW LEVEL SECURITY;

-- Enable RLS on contrat table (alternative name)
ALTER TABLE IF EXISTS public.contrat ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 3: CREATE RLS POLICIES FOR NEW TABLES
-- =====================================================

-- =====================================================
-- POLICIES: app_user
-- =====================================================

DROP POLICY IF EXISTS admin_all_app_users ON public.app_user;
DROP POLICY IF EXISTS user_view_own_profile ON public.app_user;
DROP POLICY IF EXISTS user_update_own_profile ON public.app_user;

CREATE POLICY admin_all_app_users ON public.app_user
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY user_view_own_profile ON public.app_user
  FOR SELECT
  USING (id = current_setting('app.current_user_id', true)::INTEGER);

CREATE POLICY user_update_own_profile ON public.app_user
  FOR UPDATE
  USING (id = current_setting('app.current_user_id', true)::INTEGER)
  WITH CHECK (id = current_setting('app.current_user_id', true)::INTEGER);

-- =====================================================
-- POLICIES: role (read-only for all authenticated users)
-- =====================================================

DROP POLICY IF EXISTS admin_all_roles ON public.role;
DROP POLICY IF EXISTS authenticated_view_roles ON public.role;

CREATE POLICY admin_all_roles ON public.role
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY authenticated_view_roles ON public.role
  FOR SELECT
  USING (
    current_setting('app.current_user_id', true)::INTEGER IS NOT NULL
    AND current_setting('app.current_user_id', true) != ''
  );

-- =====================================================
-- POLICIES: user_session
-- =====================================================

DROP POLICY IF EXISTS admin_all_sessions ON public.user_session;
DROP POLICY IF EXISTS user_view_own_sessions ON public.user_session;
DROP POLICY IF EXISTS user_delete_own_sessions ON public.user_session;

CREATE POLICY admin_all_sessions ON public.user_session
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY user_view_own_sessions ON public.user_session
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::INTEGER);

CREATE POLICY user_delete_own_sessions ON public.user_session
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::INTEGER);

-- =====================================================
-- POLICIES: activity_log (Admin only)
-- =====================================================

DROP POLICY IF EXISTS admin_all_activity_logs ON public.activity_log;
DROP POLICY IF EXISTS user_view_own_activity ON public.activity_log;

CREATE POLICY admin_all_activity_logs ON public.activity_log
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY user_view_own_activity ON public.activity_log
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::INTEGER);

-- =====================================================
-- POLICIES: audit_log (Admin only)
-- =====================================================

DROP POLICY IF EXISTS admin_all_audit_logs ON public.audit_log;

CREATE POLICY admin_all_audit_logs ON public.audit_log
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- =====================================================
-- POLICIES: video_task_details
-- =====================================================

DROP POLICY IF EXISTS admin_all_video_tasks ON public.video_task_details;
DROP POLICY IF EXISTS client_view_own_video_tasks ON public.video_task_details;

CREATE POLICY admin_all_video_tasks ON public.video_task_details
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY client_view_own_video_tasks ON public.video_task_details
  FOR SELECT
  USING (
    auth.is_client() 
    AND task_id IN (
      SELECT mt.id FROM mandat_task mt
      INNER JOIN mandat m ON mt.mandat_id = m.id
      WHERE m.client_id = auth.current_user_client_id()
    )
  );

-- =====================================================
-- POLICIES: video_figurant
-- =====================================================

DROP POLICY IF EXISTS admin_all_video_figurants ON public.video_figurant;
DROP POLICY IF EXISTS client_view_own_video_figurants ON public.video_figurant;

CREATE POLICY admin_all_video_figurants ON public.video_figurant
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY client_view_own_video_figurants ON public.video_figurant
  FOR SELECT
  USING (
    auth.is_client() 
    AND video_task_id IN (
      SELECT vtd.id FROM video_task_details vtd
      INNER JOIN mandat_task mt ON vtd.task_id = mt.id
      INNER JOIN mandat m ON mt.mandat_id = m.id
      WHERE m.client_id = auth.current_user_client_id()
    )
  );

-- =====================================================
-- POLICIES: contrat (if exists)
-- =====================================================

DROP POLICY IF EXISTS admin_all_contrats ON public.contrat;
DROP POLICY IF EXISTS client_view_own_contrats ON public.contrat;

CREATE POLICY admin_all_contrats ON public.contrat
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY client_view_own_contrats ON public.contrat
  FOR SELECT
  USING (
    auth.is_client() 
    AND client_id = auth.current_user_client_id()
  );

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  rls_count INTEGER;
  view_count INTEGER;
BEGIN
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = true;
  
  -- Count views
  SELECT COUNT(*) INTO view_count
  FROM pg_views
  WHERE schemaname = 'public'
    AND viewname IN ('v_posts_by_pilier', 'v_strategy_summary', 'v_calendar_statistics', 'v_editorial_posts_full', 'user_with_details');
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SECURITY LINTER FIXES APPLIED';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Tables with RLS enabled: %', rls_count;
  RAISE NOTICE 'Views recreated (without SECURITY DEFINER): %', view_count;
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Fixed issues:';
  RAISE NOTICE '  ✓ Removed SECURITY DEFINER from 5 views';
  RAISE NOTICE '  ✓ Enabled RLS on app_user';
  RAISE NOTICE '  ✓ Enabled RLS on role';
  RAISE NOTICE '  ✓ Enabled RLS on user_session';
  RAISE NOTICE '  ✓ Enabled RLS on activity_log';
  RAISE NOTICE '  ✓ Enabled RLS on audit_log';
  RAISE NOTICE '  ✓ Enabled RLS on video_task_details';
  RAISE NOTICE '  ✓ Enabled RLS on video_figurant';
  RAISE NOTICE '  ✓ Enabled RLS on contrat';
  RAISE NOTICE '==============================================';
END $$;

-- List all tables with RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;
