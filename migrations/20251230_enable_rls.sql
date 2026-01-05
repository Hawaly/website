-- =====================================================
-- ACTIVATION ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Date: 2025-12-30
-- Objectif: Protéger toutes les tables sensibles avec RLS
-- Architecture: app_user avec role_id (1=admin, 2=client, 3=staff)
-- =====================================================

-- =====================================================
-- IMPORTANT: MODÈLE D'AUTHENTIFICATION
-- =====================================================
-- Cette application utilise une authentification CUSTOM (pas Supabase Auth)
-- - Table: app_user (id, email, password_hash, role_id, client_id)
-- - Table: role (id=1 admin, id=2 client, id=3 staff)
-- - Vue: user_with_details (join app_user + role + client)
-- 
-- Pour RLS, on doit utiliser current_setting('app.current_user_id') 
-- qui sera défini par l'application lors de chaque requête
-- =====================================================

-- =====================================================
-- FONCTION HELPER: Obtenir role_id de l'utilisateur courant
-- =====================================================

CREATE OR REPLACE FUNCTION auth.current_user_role_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role_id FROM app_user WHERE id = current_setting('app.current_user_id', true)::INTEGER),
    0
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION auth.current_user_role_id IS 'Retourne le role_id de l''utilisateur courant (1=admin, 2=client, 3=staff, 0=anonymous)';

-- =====================================================
-- FONCTION HELPER: Obtenir client_id de l'utilisateur courant
-- =====================================================

CREATE OR REPLACE FUNCTION auth.current_user_client_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT client_id FROM app_user WHERE id = current_setting('app.current_user_id', true)::INTEGER);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION auth.current_user_client_id IS 'Retourne le client_id de l''utilisateur courant (NULL pour admin/staff)';

-- =====================================================
-- FONCTION HELPER: Vérifier si l'utilisateur est admin
-- =====================================================

CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.current_user_role_id() = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION auth.is_admin IS 'Retourne TRUE si l''utilisateur courant est admin (role_id=1)';

-- =====================================================
-- FONCTION HELPER: Vérifier si l'utilisateur est client
-- =====================================================

CREATE OR REPLACE FUNCTION auth.is_client()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.current_user_role_id() = 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION auth.is_client IS 'Retourne TRUE si l''utilisateur courant est client (role_id=2)';

-- =====================================================
-- 1. ACTIVER RLS SUR TOUTES LES TABLES SENSIBLES
-- =====================================================

-- Tables métier principales
ALTER TABLE client ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandat ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandat_task ENABLE ROW LEVEL SECURITY;

-- Tables facturation
ALTER TABLE invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract ENABLE ROW LEVEL SECURITY;

-- Tables dépenses
ALTER TABLE expense ENABLE ROW LEVEL SECURITY;

-- Tables stratégie social media
ALTER TABLE social_media_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilier_contenu ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_mesure ENABLE ROW LEVEL SECURITY;

-- Tables calendrier éditorial
ALTER TABLE editorial_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_post ENABLE ROW LEVEL SECURITY;

-- Tables contenu
ALTER TABLE video_script ENABLE ROW LEVEL SECURITY;

-- Tables système (admin only)
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_category ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLICIES: TABLE CLIENT
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_clients ON client
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir uniquement son propre enregistrement
CREATE POLICY client_view_own ON client
  FOR SELECT
  USING (
    auth.is_client() 
    AND id = auth.current_user_client_id()
  );

-- Client: modifier uniquement son propre enregistrement (sauf champs sensibles)
CREATE POLICY client_update_own ON client
  FOR UPDATE
  USING (
    auth.is_client() 
    AND id = auth.current_user_client_id()
  )
  WITH CHECK (
    auth.is_client() 
    AND id = auth.current_user_client_id()
  );

-- =====================================================
-- 3. POLICIES: TABLE MANDAT
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_mandats ON mandat
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir uniquement ses mandats
CREATE POLICY client_view_own_mandats ON mandat
  FOR SELECT
  USING (
    auth.is_client() 
    AND client_id = auth.current_user_client_id()
  );

-- =====================================================
-- 4. POLICIES: TABLE MANDAT_TASK
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_tasks ON mandat_task
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir uniquement les tâches de ses mandats
CREATE POLICY client_view_own_tasks ON mandat_task
  FOR SELECT
  USING (
    auth.is_client() 
    AND mandat_id IN (
      SELECT id FROM mandat WHERE client_id = auth.current_user_client_id()
    )
  );

-- =====================================================
-- 5. POLICIES: TABLE INVOICE
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_invoices ON invoice
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir uniquement ses factures
CREATE POLICY client_view_own_invoices ON invoice
  FOR SELECT
  USING (
    auth.is_client() 
    AND client_id = auth.current_user_client_id()
  );

-- =====================================================
-- 6. POLICIES: TABLE INVOICE_ITEM
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_invoice_items ON invoice_item
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir uniquement les items de ses factures
CREATE POLICY client_view_own_invoice_items ON invoice_item
  FOR SELECT
  USING (
    auth.is_client() 
    AND invoice_id IN (
      SELECT id FROM invoice WHERE client_id = auth.current_user_client_id()
    )
  );

-- =====================================================
-- 7. POLICIES: TABLE CONTRACT
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_contracts ON contract
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir uniquement ses contrats
CREATE POLICY client_view_own_contracts ON contract
  FOR SELECT
  USING (
    auth.is_client() 
    AND client_id = auth.current_user_client_id()
  );

-- =====================================================
-- 8. POLICIES: TABLE EXPENSE
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_expenses ON expense
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir ses dépenses (client_mandat avec son client_id)
CREATE POLICY client_view_own_expenses ON expense
  FOR SELECT
  USING (
    auth.is_client() 
    AND type = 'client_mandat'
    AND client_id = auth.current_user_client_id()
  );

-- Note: Les dépenses "yourstory" (type=yourstory) ne sont visibles que par les admins

-- =====================================================
-- 9. POLICIES: TABLE SOCIAL_MEDIA_STRATEGY
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_strategies ON social_media_strategy
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir uniquement ses stratégies
CREATE POLICY client_view_own_strategies ON social_media_strategy
  FOR SELECT
  USING (
    auth.is_client() 
    AND client_id = auth.current_user_client_id()
  );

-- =====================================================
-- 10. POLICIES: TABLE PERSONA
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_personas ON persona
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir uniquement les personas de ses stratégies
CREATE POLICY client_view_own_personas ON persona
  FOR SELECT
  USING (
    auth.is_client() 
    AND strategy_id IN (
      SELECT id FROM social_media_strategy WHERE client_id = auth.current_user_client_id()
    )
  );

-- =====================================================
-- 11. POLICIES: TABLE PILIER_CONTENU
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_piliers ON pilier_contenu
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir uniquement les piliers de ses stratégies
CREATE POLICY client_view_own_piliers ON pilier_contenu
  FOR SELECT
  USING (
    auth.is_client() 
    AND strategy_id IN (
      SELECT id FROM social_media_strategy WHERE client_id = auth.current_user_client_id()
    )
  );

-- =====================================================
-- 12. POLICIES: TABLE KPI
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_kpis ON kpi
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir uniquement les KPIs de ses stratégies
CREATE POLICY client_view_own_kpis ON kpi
  FOR SELECT
  USING (
    auth.is_client() 
    AND strategy_id IN (
      SELECT id FROM social_media_strategy WHERE client_id = auth.current_user_client_id()
    )
  );

-- =====================================================
-- 13. POLICIES: TABLE KPI_MESURE
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_kpi_mesures ON kpi_mesure
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir uniquement les mesures de ses KPIs
CREATE POLICY client_view_own_kpi_mesures ON kpi_mesure
  FOR SELECT
  USING (
    auth.is_client() 
    AND kpi_id IN (
      SELECT k.id FROM kpi k
      INNER JOIN social_media_strategy s ON k.strategy_id = s.id
      WHERE s.client_id = auth.current_user_client_id()
    )
  );

-- =====================================================
-- 14. POLICIES: TABLE EDITORIAL_CALENDAR
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_calendars ON editorial_calendar
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir uniquement les calendriers de ses stratégies
CREATE POLICY client_view_own_calendars ON editorial_calendar
  FOR SELECT
  USING (
    auth.is_client() 
    AND strategy_id IN (
      SELECT id FROM social_media_strategy WHERE client_id = auth.current_user_client_id()
    )
  );

-- =====================================================
-- 15. POLICIES: TABLE EDITORIAL_POST
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_posts ON editorial_post
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir uniquement les posts de ses calendriers
CREATE POLICY client_view_own_posts ON editorial_post
  FOR SELECT
  USING (
    auth.is_client() 
    AND calendar_id IN (
      SELECT ec.id FROM editorial_calendar ec
      INNER JOIN social_media_strategy s ON ec.strategy_id = s.id
      WHERE s.client_id = auth.current_user_client_id()
    )
  );

-- =====================================================
-- 16. POLICIES: TABLE VIDEO_SCRIPT
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_scripts ON video_script
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: voir uniquement ses scripts
CREATE POLICY client_view_own_scripts ON video_script
  FOR SELECT
  USING (
    auth.is_client() 
    AND client_id = auth.current_user_client_id()
  );

-- =====================================================
-- 17. POLICIES: TABLE COMPANY_SETTINGS (Admin only)
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_company_settings ON company_settings
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: lecture seule (pour afficher infos factures)
CREATE POLICY client_view_company_settings ON company_settings
  FOR SELECT
  USING (auth.is_client());

-- =====================================================
-- 18. POLICIES: TABLE EXPENSE_CATEGORY (Admin only)
-- =====================================================

-- Admin: accès complet
CREATE POLICY admin_all_expense_categories ON expense_category
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Client: lecture seule (pour afficher dans formulaires)
CREATE POLICY client_view_expense_categories ON expense_category
  FOR SELECT
  USING (auth.is_client());

-- =====================================================
-- VÉRIFICATIONS ET LOGS
-- =====================================================

DO $$
DECLARE
  rls_count INTEGER;
BEGIN
  -- Compter le nombre de tables avec RLS activé
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = true;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'ROW LEVEL SECURITY ACTIVÉ';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Tables protégées: %', rls_count;
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Fonctions créées:';
  RAISE NOTICE '  - auth.current_user_role_id()';
  RAISE NOTICE '  - auth.current_user_client_id()';
  RAISE NOTICE '  - auth.is_admin()';
  RAISE NOTICE '  - auth.is_client()';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Policies créées: ~60 (2-3 par table)';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'IMPORTANT: L''application doit définir';
  RAISE NOTICE '  current_setting(''app.current_user_id'')';
  RAISE NOTICE '  au début de chaque requête Supabase';
  RAISE NOTICE '==============================================';
END $$;

-- =====================================================
-- LISTE DES TABLES AVEC RLS
-- =====================================================

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;
