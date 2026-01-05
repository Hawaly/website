-- =========================================================
-- SERVICE PACKAGES SYSTEM
-- Système de forfaits/packs avec templates personnalisés
-- Date: 2026-01-05
-- =========================================================

BEGIN;

-- =========================================================
-- 1. TABLE: service_package
-- Définit les différents packs de services
-- =========================================================
CREATE TABLE IF NOT EXISTS public.service_package (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  tagline VARCHAR(200), -- Ex: "Stratégie marketing complète + 10 posts par mois"
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CHF',
  billing_frequency VARCHAR(20) DEFAULT 'one_time', -- one_time, monthly, yearly
  
  -- Visual/Marketing
  color VARCHAR(50), -- Ex: "from-orange-600 to-orange-500"
  icon VARCHAR(50), -- Lucide icon name
  badge VARCHAR(50), -- Ex: "MEILLEURE VALEUR", "POPULAIRE"
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true, -- Visible sur site public
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by INTEGER REFERENCES public.app_user(id),
  
  CONSTRAINT valid_billing_frequency CHECK (
    billing_frequency IN ('one_time', 'monthly', 'yearly', 'quarterly')
  )
);

-- =========================================================
-- 2. TABLE: package_feature
-- Features/Inclusions d'un pack (ce qui est inclus)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.package_feature (
  id SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL REFERENCES public.service_package(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- Lucide icon name
  is_highlighted BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 3. TABLE: package_task_template
-- Templates de tâches automatiques pour un pack
-- =========================================================
CREATE TABLE IF NOT EXISTS public.package_task_template (
  id SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL REFERENCES public.service_package(id) ON DELETE CASCADE,
  
  -- Task details
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'production', -- production, admin, revision, meeting, delivery
  status VARCHAR(50) DEFAULT 'todo', -- todo, in_progress, done, blocked
  
  -- Timing
  days_after_start INTEGER DEFAULT 0, -- Jours après début du mandat
  estimated_hours DECIMAL(5,2),
  due_date_offset INTEGER, -- Jours après création pour deadline
  
  -- Assignment
  assigned_to_role VARCHAR(50), -- admin, designer, producer, etc.
  priority INTEGER DEFAULT 1, -- 1=basse, 2=moyenne, 3=haute
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_task_type CHECK (
    type IN ('production', 'admin', 'revision', 'meeting', 'delivery', 'creative', 'technical', 'other')
  ),
  CONSTRAINT valid_task_status CHECK (
    status IN ('todo', 'in_progress', 'done', 'blocked', 'cancelled')
  )
);

-- =========================================================
-- 4. TABLE: package_mandat_template
-- Template de contenu pour les mandats selon le pack
-- =========================================================
CREATE TABLE IF NOT EXISTS public.package_mandat_template (
  id SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL UNIQUE REFERENCES public.service_package(id) ON DELETE CASCADE,
  
  -- Default mandat content
  title_template VARCHAR(200), -- Ex: "Mandat Marketing - {client_name} - {package_name}"
  description_template TEXT, -- Description par défaut du mandat
  objectives TEXT, -- Objectifs du mandat
  deliverables TEXT, -- Livrables attendus
  timeline_description TEXT, -- Description du timeline
  
  -- Default values
  default_duration_days INTEGER, -- Durée par défaut en jours
  default_status VARCHAR(50) DEFAULT 'draft',
  
  -- Contract clauses specific to package
  contract_clauses JSONB, -- Clauses spécifiques au forfait
  terms_and_conditions TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 5. TABLE: package_invoice_template
-- Template de facturation selon le pack
-- =========================================================
CREATE TABLE IF NOT EXISTS public.package_invoice_template (
  id SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL UNIQUE REFERENCES public.service_package(id) ON DELETE CASCADE,
  
  -- Invoice line items
  line_item_description VARCHAR(500), -- Description de la ligne de facturation
  unit_price DECIMAL(10,2),
  quantity INTEGER DEFAULT 1,
  
  -- Payment terms
  payment_terms_days INTEGER DEFAULT 30, -- Net 30
  payment_schedule VARCHAR(50) DEFAULT 'upfront', -- upfront, milestone, monthly
  deposit_percentage DECIMAL(5,2), -- Pourcentage d'acompte
  
  -- Invoice notes
  invoice_notes TEXT,
  payment_instructions TEXT,
  
  -- Tax settings
  is_taxable BOOLEAN DEFAULT true,
  tax_rate DECIMAL(5,2) DEFAULT 7.70, -- TVA suisse
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_payment_schedule CHECK (
    payment_schedule IN ('upfront', 'milestone', 'monthly', 'quarterly', 'on_delivery')
  )
);

-- =========================================================
-- 6. TABLE: client_package
-- Lien entre clients et packs souscrits
-- =========================================================
CREATE TABLE IF NOT EXISTS public.client_package (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES public.client(id) ON DELETE CASCADE,
  package_id INTEGER NOT NULL REFERENCES public.service_package(id) ON DELETE RESTRICT,
  
  -- Purchase details
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  purchased_price DECIMAL(10,2) NOT NULL, -- Prix au moment de l'achat
  
  -- Subscription info (if recurring)
  start_date DATE,
  end_date DATE,
  renewal_date DATE,
  is_recurring BOOLEAN DEFAULT false,
  auto_renew BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled, expired
  
  -- Related mandat
  mandat_id INTEGER REFERENCES public.mandat(id),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by INTEGER REFERENCES public.app_user(id),
  
  CONSTRAINT valid_package_status CHECK (
    status IN ('active', 'completed', 'cancelled', 'expired', 'paused')
  )
);

-- =========================================================
-- 7. INDEXES
-- =========================================================
CREATE INDEX idx_service_package_slug ON public.service_package(slug);
CREATE INDEX idx_service_package_active ON public.service_package(is_active);
CREATE INDEX idx_service_package_visible ON public.service_package(is_visible);
CREATE INDEX idx_service_package_featured ON public.service_package(is_featured);

CREATE INDEX idx_package_feature_package ON public.package_feature(package_id);
CREATE INDEX idx_package_task_template_package ON public.package_task_template(package_id);
CREATE INDEX idx_client_package_client ON public.client_package(client_id);
CREATE INDEX idx_client_package_package ON public.client_package(package_id);
CREATE INDEX idx_client_package_status ON public.client_package(status);

-- =========================================================
-- 8. TRIGGERS: updated_at
-- =========================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_package_updated_at
  BEFORE UPDATE ON public.service_package
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_feature_updated_at
  BEFORE UPDATE ON public.package_feature
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_task_template_updated_at
  BEFORE UPDATE ON public.package_task_template
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_mandat_template_updated_at
  BEFORE UPDATE ON public.package_mandat_template
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_invoice_template_updated_at
  BEFORE UPDATE ON public.package_invoice_template
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_package_updated_at
  BEFORE UPDATE ON public.client_package
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================
-- 9. SEED DATA: Packs initiaux
-- =========================================================
INSERT INTO public.service_package (
  name, slug, description, tagline, price, currency, 
  color, icon, badge, is_featured, display_order, is_active, is_visible
) VALUES
(
  'Pack de 10 Posts',
  'pack-10-posts',
  'Stratégie marketing complète + 10 posts par mois (6 vidéos + 4 carrousels)',
  'Stratégie marketing complète + 10 posts par mois (6 vidéos + 4 carrousels)',
  2000.00,
  'CHF',
  'from-orange-600 to-orange-500',
  'Zap',
  'MEILLEURE VALEUR',
  true,
  1,
  true,
  true
),
(
  'Business Booster',
  'business-booster',
  'Stratégie marketing ciblée + 6 vidéos percutantes pour booster votre croissance',
  'Stratégie marketing ciblée + 6 vidéos percutantes pour booster votre croissance',
  1400.00,
  'CHF',
  'from-blue-600 to-blue-500',
  'TrendingUp',
  'POPULAIRE',
  false,
  2,
  true,
  true
),
(
  'Pack Starter',
  'pack-starter',
  'Pack d''entrée de gamme pour démarrer votre présence digitale',
  'Idéal pour les petites entreprises qui débutent',
  800.00,
  'CHF',
  'from-green-600 to-green-500',
  'Rocket',
  NULL,
  false,
  3,
  true,
  true
)
RETURNING id;

-- =========================================================
-- 10. SEED DATA: Features pour Pack de 10 Posts
-- =========================================================
INSERT INTO public.package_feature (package_id, title, description, icon, is_highlighted, display_order)
SELECT 
  id,
  unnest(ARRAY[
    'Stratégie marketing personnalisée',
    'Analyse de votre cible & positionnement',
    'Production de 6 vidéos professionnelles',
    'Création de 4 carrousels engageants',
    'Proposition de 15 concepts créatifs',
    'Rédaction de scripts optimisés SEO',
    'Activation d''un acteur professionnel',
    'Tournage et montage complet en interne',
    'Modifications illimitées jusqu''à satisfaction',
    'Publication et suivi des performances'
  ]),
  NULL,
  'CheckCircle',
  false,
  generate_series(1, 10)
FROM public.service_package WHERE slug = 'pack-10-posts';

-- =========================================================
-- 11. SEED DATA: Features pour Business Booster
-- =========================================================
INSERT INTO public.package_feature (package_id, title, description, icon, is_highlighted, display_order)
SELECT 
  id,
  unnest(ARRAY[
    'Stratégie marketing sur mesure',
    'Analyse de votre audience cible',
    'Production de 6 vidéos optimisées',
    'Proposition de 15 concepts créatifs',
    'Rédaction de scripts orientés conversion',
    'Activation d''un acteur professionnel',
    'Tournage et montage premium',
    'Modifications illimitées',
    'Publication clé en main'
  ]),
  NULL,
  'CheckCircle',
  false,
  generate_series(1, 9)
FROM public.service_package WHERE slug = 'business-booster';

COMMIT;

-- =========================================================
-- VÉRIFICATIONS POST-MIGRATION
-- =========================================================
-- 
-- SELECT * FROM public.service_package ORDER BY display_order;
-- SELECT * FROM public.package_feature ORDER BY package_id, display_order;
-- 
-- =========================================================
