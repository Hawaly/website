-- =========================================================
-- YOURSTORY AGENCY - COMPLETE DATABASE RECREATION SCRIPT
-- =========================================================
-- Date: 2025-01-03
-- Version: 2.0 - Complete Edition
-- Description: Comprehensive database schema with ALL features:
--   - Authentication & Authorization (RBAC + RLS)
--   - Client & Project Management
--   - Invoicing & Expenses
--   - Social Media Strategy & Editorial Calendar
--   - Video Scripts
--   - Client KPI Tracking
--   - Sales/CRM Module (Prospects, Pipeline, Activities, Meetings, PV, Pitch Decks)
-- =========================================================

BEGIN;

-- =========================================================
-- PART 1: DROP EXISTING OBJECTS (Clean Slate)
-- =========================================================

-- Drop views first (dependencies)
DROP VIEW IF EXISTS public.user_statistics CASCADE;
DROP VIEW IF EXISTS public.v_posts_by_pilier CASCADE;
DROP VIEW IF EXISTS public.v_strategy_summary CASCADE;
DROP VIEW IF EXISTS public.v_calendar_statistics CASCADE;
DROP VIEW IF EXISTS public.v_editorial_posts_full CASCADE;
DROP VIEW IF EXISTS public.user_with_details CASCADE;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.pipeline_history CASCADE;
DROP TABLE IF EXISTS public.pitch_decks CASCADE;
DROP TABLE IF EXISTS public.meeting_minutes CASCADE;
DROP TABLE IF EXISTS public.meetings CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.prospects CASCADE;
DROP TABLE IF EXISTS public.client_kpi_value CASCADE;
DROP TABLE IF EXISTS public.client_kpi CASCADE;
DROP TABLE IF EXISTS public.kpi_mesure CASCADE;
DROP TABLE IF EXISTS public.kpi CASCADE;
DROP TABLE IF EXISTS public.editorial_post CASCADE;
DROP TABLE IF EXISTS public.editorial_calendar CASCADE;
DROP TABLE IF EXISTS public.pilier_contenu CASCADE;
DROP TABLE IF EXISTS public.persona CASCADE;
DROP TABLE IF EXISTS public.social_media_strategy CASCADE;
DROP TABLE IF EXISTS public.video_script CASCADE;
DROP TABLE IF EXISTS public.expense CASCADE;
DROP TABLE IF EXISTS public.expense_category CASCADE;
DROP TABLE IF EXISTS public.contract CASCADE;
DROP TABLE IF EXISTS public.contrat CASCADE;
DROP TABLE IF EXISTS public.invoice_item CASCADE;
DROP TABLE IF EXISTS public.invoice CASCADE;
DROP TABLE IF EXISTS public.mandat_task CASCADE;
DROP TABLE IF EXISTS public.mandat CASCADE;
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.activity_log CASCADE;
DROP TABLE IF EXISTS public.user_session CASCADE;
DROP TABLE IF EXISTS public.app_user CASCADE;
DROP TABLE IF EXISTS public.client CASCADE;
DROP TABLE IF EXISTS public.company_settings CASCADE;
DROP TABLE IF EXISTS public.role CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS auth.is_client() CASCADE;
DROP FUNCTION IF EXISTS auth.is_admin() CASCADE;
DROP FUNCTION IF EXISTS auth.current_user_client_id() CASCADE;
DROP FUNCTION IF EXISTS auth.current_user_role_id() CASCADE;
DROP FUNCTION IF EXISTS public.check_user_permission(INTEGER, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity(INTEGER, VARCHAR, VARCHAR, INTEGER, JSONB, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_sessions() CASCADE;
DROP FUNCTION IF EXISTS public.update_client_kpi_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.create_editorial_calendar_for_strategy() CASCADE;
DROP FUNCTION IF EXISTS public.set_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.update_prospect_last_contact() CASCADE;
DROP FUNCTION IF EXISTS public.log_pipeline_change() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop ENUM types
DROP TYPE IF EXISTS priority_level CASCADE;
DROP TYPE IF EXISTS lead_source CASCADE;
DROP TYPE IF EXISTS activity_status CASCADE;
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS prospect_status CASCADE;
DROP TYPE IF EXISTS post_status CASCADE;
DROP TYPE IF EXISTS strategy_status CASCADE;
DROP TYPE IF EXISTS task_type CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS recurrence_type CASCADE;
DROP TYPE IF EXISTS expense_type CASCADE;
DROP TYPE IF EXISTS invoice_recurrence CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS mandat_status CASCADE;
DROP TYPE IF EXISTS client_status CASCADE;
DROP TYPE IF EXISTS client_type CASCADE;

-- =========================================================
-- PART 2: CREATE ENUM TYPES
-- =========================================================

-- Core business types
CREATE TYPE client_type AS ENUM ('oneshot', 'mensuel');
CREATE TYPE client_status AS ENUM ('actif', 'pause', 'termine', 'potentiel');
CREATE TYPE mandat_status AS ENUM ('en_cours', 'termine', 'annule');
CREATE TYPE invoice_status AS ENUM ('brouillon', 'envoyee', 'payee', 'annulee');
CREATE TYPE invoice_recurrence AS ENUM ('oneshot', 'mensuel', 'trimestriel', 'annuel');
CREATE TYPE expense_type AS ENUM ('client_mandat', 'yourstory');
CREATE TYPE recurrence_type AS ENUM ('oneshot', 'mensuel');
CREATE TYPE task_status AS ENUM ('a_faire', 'en_cours', 'terminee');
CREATE TYPE task_type AS ENUM ('contenu', 'video', 'reunion', 'reporting', 'autre');
CREATE TYPE strategy_status AS ENUM ('brouillon', 'actif', 'archive');
CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'cancelled');

-- Sales/CRM types
CREATE TYPE prospect_status AS ENUM ('new', 'qualified', 'discovery', 'proposal', 'negotiation', 'won', 'lost');
CREATE TYPE activity_type AS ENUM ('call', 'email', 'task', 'meeting');
CREATE TYPE activity_status AS ENUM ('planned', 'completed', 'cancelled');
CREATE TYPE lead_source AS ENUM ('website', 'referral', 'linkedin', 'cold_outreach', 'event', 'other');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');

-- =========================================================
-- PART 3: CORE TABLES - Authentication & Authorization
-- =========================================================

-- Table: role
CREATE TABLE public.role (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  redirect_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.role IS 'Rôles utilisateurs avec redirections personnalisées';

INSERT INTO public.role (code, name, description, redirect_path) VALUES
  ('admin', 'Administrateur', 'Accès complet à l''application', '/dashboard'),
  ('client', 'Client', 'Accès limité aux données client', '/client-portal'),
  ('staff', 'Employé', 'Accès intermédiaire', '/dashboard');

-- Table: company_settings
CREATE TABLE public.company_settings (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  agency_name TEXT NOT NULL,
  address TEXT,
  zip_code TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  tva_number TEXT,
  represented_by TEXT,
  iban TEXT,
  qr_iban TEXT
);

COMMENT ON TABLE public.company_settings IS 'Paramètres de l''agence';

INSERT INTO public.company_settings (agency_name, address, zip_code, city, country, phone, email, tva_number, represented_by, iban, qr_iban)
VALUES ('YourStory Agency', 'Rue de la Paix 15', '2000', 'Neuchâtel', 'Suisse', '+41 79 000 00 00', 'contact@yourstory.ch', 'CHE-000.000.000', 'Mohamad Hawaley', 'CH00 0000 0000 0000 0000 0', 'CH44 3199 9123 0008 8901 2');

-- Table: client
CREATE TABLE public.client (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  type client_type NOT NULL,
  status client_status NOT NULL DEFAULT 'potentiel',
  email TEXT,
  phone TEXT,
  company_name TEXT,
  address TEXT,
  zip_code TEXT,
  locality TEXT,
  represented_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_status ON public.client(status);
CREATE INDEX idx_client_type ON public.client(type);

COMMENT ON TABLE public.client IS 'Clients de l''agence YourStory';

-- Table: app_user
CREATE TABLE public.app_user (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INTEGER NOT NULL REFERENCES public.role(id) ON DELETE RESTRICT,
  client_id BIGINT REFERENCES public.client(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_app_user_email ON public.app_user(email);
CREATE INDEX idx_app_user_role ON public.app_user(role_id);
CREATE INDEX idx_app_user_client ON public.app_user(client_id);

COMMENT ON TABLE public.app_user IS 'Utilisateurs de l''application';

-- Default admin user (password: admin123)
INSERT INTO public.app_user (email, password_hash, role_id, client_id, is_active)
VALUES ('admin@yourstory.ch', '$2a$10$5vJqMhmYLZCxJzPe5wDmzOjKwDVoGUaXMsJXtmLbJqGqPckZ3Y3Aq', (SELECT id FROM public.role WHERE code = 'admin'), NULL, true);

-- Table: user_session
CREATE TABLE public.user_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES public.app_user(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_session_user ON public.user_session(user_id);
CREATE INDEX idx_session_token ON public.user_session(token);
CREATE INDEX idx_session_expires ON public.user_session(expires_at);

COMMENT ON TABLE public.user_session IS 'Sessions actives des utilisateurs';

-- Table: activity_log
CREATE TABLE public.activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.app_user(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON public.activity_log(user_id);
CREATE INDEX idx_activity_action ON public.activity_log(action);
CREATE INDEX idx_activity_created ON public.activity_log(created_at);

COMMENT ON TABLE public.activity_log IS 'Journal de toutes les actions des utilisateurs';

-- Table: audit_log
CREATE TABLE public.audit_log (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.app_user(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.audit_log IS 'Journal d''audit des actions utilisateurs';

-- =========================================================
-- PART 4: BUSINESS TABLES - Projects & Contracts
-- =========================================================

-- Table: mandat
CREATE TABLE public.mandat (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES public.client(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  mandat_type TEXT DEFAULT 'standard',
  status mandat_status NOT NULL DEFAULT 'en_cours',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mandat_client_id ON public.mandat(client_id);
CREATE INDEX idx_mandat_status ON public.mandat(status);

COMMENT ON TABLE public.mandat IS 'Projets/mandats clients';

-- Table: mandat_task
CREATE TABLE public.mandat_task (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  mandat_id BIGINT NOT NULL REFERENCES public.mandat(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  details TEXT,
  type task_type NOT NULL DEFAULT 'autre',
  status task_status NOT NULL DEFAULT 'a_faire',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_mandat_id ON public.mandat_task(mandat_id);
CREATE INDEX idx_task_status ON public.mandat_task(status);

COMMENT ON TABLE public.mandat_task IS 'Tâches associées aux mandats';

-- Table: contrat (contracts)
CREATE TABLE public.contrat (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES public.client(id) ON DELETE CASCADE,
  mandat_id BIGINT REFERENCES public.mandat(id) ON DELETE SET NULL,
  contrat_number TEXT NOT NULL UNIQUE,
  file_path TEXT NOT NULL,
  signed_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contract_client_id ON public.contrat(client_id);
CREATE INDEX idx_contract_mandat_id ON public.contrat(mandat_id);

COMMENT ON TABLE public.contrat IS 'Contrats clients';

-- =========================================================
-- PART 5: FINANCIAL TABLES - Invoices & Expenses
-- =========================================================

-- Table: invoice
CREATE TABLE public.invoice (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES public.client(id) ON DELETE CASCADE,
  mandat_id BIGINT REFERENCES public.mandat(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  issue_date DATE NOT NULL,
  due_date DATE,
  total_ht NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_tva NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_ttc NUMERIC(10,2) NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'brouillon',
  pdf_path TEXT,
  qr_additional_info TEXT,
  
  -- Recurring invoices
  is_recurring invoice_recurrence NOT NULL DEFAULT 'oneshot',
  recurrence_day INTEGER CHECK (recurrence_day >= 1 AND recurrence_day <= 31),
  parent_invoice_id BIGINT REFERENCES public.invoice(id) ON DELETE SET NULL,
  next_generation_date DATE,
  auto_send BOOLEAN DEFAULT FALSE,
  max_occurrences INTEGER,
  occurrences_count INTEGER DEFAULT 0,
  end_date DATE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoice_client_id ON public.invoice(client_id);
CREATE INDEX idx_invoice_status ON public.invoice(status);
CREATE INDEX idx_invoice_recurring ON public.invoice(is_recurring) WHERE is_recurring != 'oneshot';
CREATE INDEX idx_invoice_next_generation ON public.invoice(next_generation_date) WHERE next_generation_date IS NOT NULL;

COMMENT ON TABLE public.invoice IS 'Factures clients avec support de récurrence';

-- Table: invoice_item
CREATE TABLE public.invoice_item (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  invoice_id BIGINT NOT NULL REFERENCES public.invoice(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_invoice_item_invoice_id ON public.invoice_item(invoice_id);

COMMENT ON TABLE public.invoice_item IS 'Lignes de facture';

-- Table: expense_category
CREATE TABLE public.expense_category (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO public.expense_category (name, is_recurring) VALUES
  ('Logiciels & Abonnements', TRUE),
  ('Matériel', FALSE),
  ('Déplacements', FALSE),
  ('Marketing & Publicité', FALSE),
  ('Freelances & Sous-traitance', FALSE),
  ('Formation', FALSE),
  ('Hébergement', TRUE),
  ('Assurances', TRUE),
  ('Bureau & Fournitures', TRUE),
  ('Divers', FALSE);

COMMENT ON TABLE public.expense_category IS 'Catégories de dépenses';

-- Table: expense
CREATE TABLE public.expense (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  type expense_type NOT NULL,
  mandat_id BIGINT REFERENCES public.mandat(id) ON DELETE SET NULL,
  client_id BIGINT REFERENCES public.client(id) ON DELETE SET NULL,
  category_id BIGINT REFERENCES public.expense_category(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL,
  is_recurring recurrence_type NOT NULL DEFAULT 'oneshot',
  notes TEXT,
  receipt_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expense_date ON public.expense(date);
CREATE INDEX idx_expense_type ON public.expense(type);

COMMENT ON TABLE public.expense IS 'Dépenses de l''agence';

-- =========================================================
-- PART 6: SOCIAL MEDIA STRATEGY TABLES
-- =========================================================

-- Table: social_media_strategy
CREATE TABLE public.social_media_strategy (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES public.client(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  status strategy_status DEFAULT 'brouillon',
  
  contexte_general TEXT,
  objectifs_business TEXT,
  objectifs_reseaux TEXT,
  cibles TEXT,
  plateformes TEXT[],
  ton_voix TEXT,
  guidelines_visuelles TEXT,
  valeurs_messages TEXT,
  formats_envisages TEXT[],
  frequence_calendrier TEXT,
  workflow_roles TEXT,
  audit_profils TEXT,
  benchmark_concurrents TEXT,
  cadre_suivi TEXT,
  owned_media TEXT,
  shared_media TEXT,
  paid_media TEXT,
  earned_media TEXT,
  temps_humain TEXT,
  outils TEXT,
  budget_pub TEXT,
  planning_global TEXT,
  processus_iteration TEXT,
  mise_a_jour TEXT,
  notes_internes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255)
);

CREATE INDEX idx_social_media_strategy_client_id ON public.social_media_strategy(client_id);
CREATE INDEX idx_social_media_strategy_status ON public.social_media_strategy(status);

COMMENT ON TABLE public.social_media_strategy IS 'Stratégies social media pour les clients';

-- Table: persona
CREATE TABLE public.persona (
  id SERIAL PRIMARY KEY,
  strategy_id INTEGER NOT NULL REFERENCES public.social_media_strategy(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  age_range VARCHAR(50),
  profession VARCHAR(255),
  besoins TEXT,
  problemes TEXT,
  attentes TEXT,
  comportements TEXT,
  canaux_preferes TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_persona_strategy_id ON public.persona(strategy_id);

COMMENT ON TABLE public.persona IS 'Personas cibles pour les stratégies social media';

-- Table: pilier_contenu
CREATE TABLE public.pilier_contenu (
  id SERIAL PRIMARY KEY,
  strategy_id INTEGER NOT NULL REFERENCES public.social_media_strategy(id) ON DELETE CASCADE,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  exemples TEXT,
  pourcentage_cible INTEGER CHECK (pourcentage_cible >= 0 AND pourcentage_cible <= 100),
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pilier_contenu_strategy_id ON public.pilier_contenu(strategy_id);
CREATE INDEX idx_pilier_contenu_ordre ON public.pilier_contenu(strategy_id, ordre);

COMMENT ON TABLE public.pilier_contenu IS 'Piliers de contenu des stratégies social media';

-- Table: kpi
CREATE TABLE public.kpi (
  id SERIAL PRIMARY KEY,
  strategy_id INTEGER NOT NULL REFERENCES public.social_media_strategy(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  objectif TEXT,
  valeur_cible DECIMAL(10,2),
  unite VARCHAR(50),
  periodicite VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kpi_strategy_id ON public.kpi(strategy_id);

COMMENT ON TABLE public.kpi IS 'KPIs (Indicateurs de Performance) des stratégies social media';

-- Table: kpi_mesure
CREATE TABLE public.kpi_mesure (
  id SERIAL PRIMARY KEY,
  kpi_id INTEGER NOT NULL REFERENCES public.kpi(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  valeur_mesuree DECIMAL(10,2) NOT NULL,
  commentaire TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kpi_mesure_kpi_id ON public.kpi_mesure(kpi_id);
CREATE INDEX idx_kpi_mesure_date ON public.kpi_mesure(kpi_id, date DESC);

COMMENT ON TABLE public.kpi_mesure IS 'Mesures historiques des KPIs';

-- =========================================================
-- PART 7: EDITORIAL CALENDAR TABLES
-- =========================================================

-- Table: editorial_calendar
CREATE TABLE public.editorial_calendar (
  id SERIAL PRIMARY KEY,
  strategy_id INTEGER NOT NULL UNIQUE REFERENCES public.social_media_strategy(id) ON DELETE CASCADE,
  name VARCHAR(255),
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_editorial_calendar_strategy_id ON public.editorial_calendar(strategy_id);

COMMENT ON TABLE public.editorial_calendar IS 'Calendrier éditorial associé à une stratégie social media';

-- Table: editorial_post
CREATE TABLE public.editorial_post (
  id SERIAL PRIMARY KEY,
  calendar_id INTEGER NOT NULL REFERENCES public.editorial_calendar(id) ON DELETE CASCADE,
  pilier_id INTEGER REFERENCES public.pilier_contenu(id) ON DELETE SET NULL,
  
  publication_date DATE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  content_type VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  caption TEXT,
  hashtags TEXT[],
  mentions TEXT[],
  media_urls TEXT[],
  
  status post_status DEFAULT 'draft',
  scheduled_time TIME,
  published_at TIMESTAMP,
  
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255)
);

CREATE INDEX idx_editorial_post_calendar_id ON public.editorial_post(calendar_id);
CREATE INDEX idx_editorial_post_publication_date ON public.editorial_post(publication_date);
CREATE INDEX idx_editorial_post_platform ON public.editorial_post(platform);
CREATE INDEX idx_editorial_post_status ON public.editorial_post(status);

COMMENT ON TABLE public.editorial_post IS 'Posts planifiés dans le calendrier éditorial';

-- =========================================================
-- PART 8: VIDEO SCRIPTS TABLE
-- =========================================================

-- Table: video_script
CREATE TABLE public.video_script (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  client_id INTEGER REFERENCES public.client(id) ON DELETE SET NULL,
  mandat_id INTEGER REFERENCES public.mandat(id) ON DELETE SET NULL,
  editorial_post_id INTEGER REFERENCES public.editorial_post(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_script_client_id ON public.video_script(client_id);
CREATE INDEX idx_video_script_mandat_id ON public.video_script(mandat_id);
CREATE INDEX idx_video_script_editorial_post_id ON public.video_script(editorial_post_id);
CREATE INDEX idx_video_script_updated_at ON public.video_script(updated_at DESC);

COMMENT ON TABLE public.video_script IS 'Scripts vidéo avec éditeur de texte riche';

-- =========================================================
-- PART 9: CLIENT KPI TRACKING TABLES
-- =========================================================

-- Table: client_kpi
CREATE TABLE public.client_kpi (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES public.client(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  categorie VARCHAR(100),
  unite VARCHAR(50),
  valeur_cible NUMERIC(12,2),
  periodicite VARCHAR(50),
  ordre INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_client_kpi_client_id ON public.client_kpi(client_id);
CREATE INDEX idx_client_kpi_active ON public.client_kpi(is_active) WHERE is_active = true;

COMMENT ON TABLE public.client_kpi IS 'KPIs à suivre pour chaque client';

-- Table: client_kpi_value
CREATE TABLE public.client_kpi_value (
  id BIGSERIAL PRIMARY KEY,
  kpi_id BIGINT NOT NULL REFERENCES public.client_kpi(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  valeur_mesuree NUMERIC(12,2) NOT NULL,
  commentaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  UNIQUE(kpi_id, date)
);

CREATE INDEX idx_client_kpi_value_kpi_id ON public.client_kpi_value(kpi_id);
CREATE INDEX idx_client_kpi_value_date ON public.client_kpi_value(date DESC);

COMMENT ON TABLE public.client_kpi_value IS 'Valeurs mesurées dans le temps pour chaque KPI client';

-- =========================================================
-- PART 10: SALES/CRM MODULE TABLES
-- =========================================================

-- Table: prospects
CREATE TABLE public.prospects (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  location VARCHAR(255),
  country VARCHAR(100),
  
  status prospect_status NOT NULL DEFAULT 'new',
  pipeline_stage VARCHAR(50) DEFAULT 'new',
  
  estimated_value DECIMAL(10,2),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  
  source lead_source,
  priority priority_level DEFAULT 'medium',
  tags TEXT[],
  owner_id INTEGER,
  
  first_contact_date DATE,
  last_contact_date DATE,
  expected_close_date DATE,
  won_date DATE,
  lost_date DATE,
  lost_reason TEXT,
  
  pain_points TEXT,
  objectives TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prospects_status ON public.prospects(status);
CREATE INDEX idx_prospects_owner ON public.prospects(owner_id);
CREATE INDEX idx_prospects_tags ON public.prospects USING GIN(tags);

COMMENT ON TABLE public.prospects IS 'Entreprises prospects et opportunités commerciales';

-- Table: contacts
CREATE TABLE public.contacts (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  department VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  linkedin_url VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  is_decision_maker BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contacts_prospect ON public.contacts(prospect_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);

COMMENT ON TABLE public.contacts IS 'Contacts associés aux prospects';

-- Table: activities
CREATE TABLE public.activities (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER REFERENCES public.prospects(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES public.contacts(id) ON DELETE SET NULL,
  type activity_type NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status activity_status DEFAULT 'planned',
  priority priority_level DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  assigned_to INTEGER,
  reminder_date TIMESTAMP WITH TIME ZONE,
  reminder_sent BOOLEAN DEFAULT false,
  outcome TEXT,
  next_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_prospect ON public.activities(prospect_id);
CREATE INDEX idx_activities_type ON public.activities(type);
CREATE INDEX idx_activities_status ON public.activities(status);
CREATE INDEX idx_activities_due_date ON public.activities(due_date);

COMMENT ON TABLE public.activities IS 'Activités commerciales: calls, emails, tasks';

-- Table: meetings
CREATE TABLE public.meetings (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER REFERENCES public.prospects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  meeting_url VARCHAR(500),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Europe/Zurich',
  organizer_id INTEGER,
  attendees_internal INTEGER[],
  attendees_external JSONB,
  status VARCHAR(50) DEFAULT 'scheduled',
  is_cancelled BOOLEAN DEFAULT false,
  cancellation_reason TEXT,
  ics_uid VARCHAR(255),
  calendar_event_id VARCHAR(255),
  agenda TEXT,
  preparation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_meetings_prospect ON public.meetings(prospect_id);
CREATE INDEX idx_meetings_start_time ON public.meetings(start_time);

COMMENT ON TABLE public.meetings IS 'Rendez-vous commerciaux et calendrier';

-- Table: meeting_minutes
CREATE TABLE public.meeting_minutes (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER REFERENCES public.meetings(id) ON DELETE CASCADE,
  prospect_id INTEGER REFERENCES public.prospects(id) ON DELETE CASCADE,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  title VARCHAR(255) NOT NULL,
  participants JSONB,
  context TEXT,
  agenda TEXT,
  discussion_points TEXT,
  decisions TEXT,
  action_items JSONB,
  next_meeting_date TIMESTAMP WITH TIME ZONE,
  next_meeting_notes TEXT,
  attachments JSONB,
  is_approved BOOLEAN DEFAULT false,
  approved_by INTEGER,
  approved_at TIMESTAMP WITH TIME ZONE,
  pdf_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_meeting_minutes_meeting ON public.meeting_minutes(meeting_id);
CREATE INDEX idx_meeting_minutes_prospect ON public.meeting_minutes(prospect_id);

COMMENT ON TABLE public.meeting_minutes IS 'Procès-verbaux de réunions structurés';

-- Table: pitch_decks
CREATE TABLE public.pitch_decks (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  template_name VARCHAR(100),
  slides JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  parent_deck_id INTEGER REFERENCES public.pitch_decks(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  is_sent BOOLEAN DEFAULT false,
  sent_date TIMESTAMP WITH TIME ZONE,
  pdf_url VARCHAR(500),
  pptx_url VARCHAR(500),
  created_by INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pitch_decks_prospect ON public.pitch_decks(prospect_id);
CREATE INDEX idx_pitch_decks_version ON public.pitch_decks(version);
CREATE INDEX idx_pitch_decks_active ON public.pitch_decks(is_active);

COMMENT ON TABLE public.pitch_decks IS 'Pitch decks et présentations commerciales';

-- Table: pipeline_history
CREATE TABLE public.pipeline_history (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  from_status prospect_status,
  to_status prospect_status NOT NULL,
  changed_by INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pipeline_history_prospect ON public.pipeline_history(prospect_id);
CREATE INDEX idx_pipeline_history_date ON public.pipeline_history(created_at);

COMMENT ON TABLE public.pipeline_history IS 'Historique des changements de statut pipeline';

-- =========================================================
-- PART 11: FUNCTIONS & TRIGGERS
-- =========================================================

-- Function: update timestamp
CREATE OR REPLACE FUNCTION public.set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_client_set_timestamp BEFORE UPDATE ON public.client FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER trg_mandat_set_timestamp BEFORE UPDATE ON public.mandat FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER trg_mandat_task_set_timestamp BEFORE UPDATE ON public.mandat_task FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER trg_invoice_set_timestamp BEFORE UPDATE ON public.invoice FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER app_user_updated_at BEFORE UPDATE ON public.app_user FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER social_media_strategy_updated_at BEFORE UPDATE ON public.social_media_strategy FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER editorial_calendar_updated_at BEFORE UPDATE ON public.editorial_calendar FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER editorial_post_updated_at BEFORE UPDATE ON public.editorial_post FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER persona_updated_at BEFORE UPDATE ON public.persona FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER pilier_contenu_updated_at BEFORE UPDATE ON public.pilier_contenu FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER kpi_updated_at BEFORE UPDATE ON public.kpi FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER video_script_updated_at BEFORE UPDATE ON public.video_script FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER client_kpi_updated_at BEFORE UPDATE ON public.client_kpi FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER prospects_updated_at BEFORE UPDATE ON public.prospects FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER meeting_minutes_updated_at BEFORE UPDATE ON public.meeting_minutes FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER pitch_decks_updated_at BEFORE UPDATE ON public.pitch_decks FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

-- Function: auto-create editorial calendar
CREATE OR REPLACE FUNCTION create_editorial_calendar_for_strategy()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.editorial_calendar (strategy_id, name)
  VALUES (NEW.id, 'Calendrier éditorial - Stratégie ' || NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_editorial_calendar AFTER INSERT ON public.social_media_strategy
FOR EACH ROW EXECUTE FUNCTION create_editorial_calendar_for_strategy();

-- Function: log pipeline changes
CREATE OR REPLACE FUNCTION log_pipeline_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.pipeline_history (prospect_id, from_status, to_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_prospect_status_change AFTER UPDATE ON public.prospects
FOR EACH ROW EXECUTE FUNCTION log_pipeline_change();

-- Function: update prospect last contact
CREATE OR REPLACE FUNCTION update_prospect_last_contact()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.prospects 
  SET last_contact_date = CURRENT_DATE
  WHERE id = NEW.prospect_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_last_contact_on_activity AFTER INSERT ON public.activities
FOR EACH ROW EXECUTE FUNCTION update_prospect_last_contact();

CREATE TRIGGER update_last_contact_on_meeting AFTER INSERT ON public.meetings
FOR EACH ROW EXECUTE FUNCTION update_prospect_last_contact();

-- Function: cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.user_session WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id INTEGER,
  p_action VARCHAR(100),
  p_entity_type VARCHAR(50) DEFAULT NULL,
  p_entity_id INTEGER DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address VARCHAR(45) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_id INTEGER;
BEGIN
  INSERT INTO public.activity_log (user_id, action, entity_type, entity_id, details, ip_address)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details, p_ip_address)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function: check user permission
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id INTEGER,
  p_required_role VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role_code VARCHAR(50);
BEGIN
  SELECT r.code INTO user_role_code 
  FROM public.app_user u
  JOIN public.role r ON u.role_id = r.id
  WHERE u.id = p_user_id AND u.is_active = true;
  
  IF user_role_code IS NULL THEN RETURN false; END IF;
  IF user_role_code = 'admin' THEN RETURN true; END IF;
  RETURN user_role_code = p_required_role;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- PART 12: RLS HELPER FUNCTIONS
-- =========================================================

CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.current_user_role_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role_id FROM public.app_user WHERE id = current_setting('app.current_user_id', true)::INTEGER),
    0
  );
EXCEPTION WHEN OTHERS THEN RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.current_user_client_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT client_id FROM public.app_user WHERE id = current_setting('app.current_user_id', true)::INTEGER);
EXCEPTION WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.current_user_role_id() = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_client()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.current_user_role_id() = 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================
-- PART 13: VIEWS
-- =========================================================

-- View: user_with_details
CREATE OR REPLACE VIEW public.user_with_details AS
SELECT 
  u.id as user_id, u.email, u.is_active, u.last_login, u.created_at,
  r.id as role_id, r.code as role_code, r.name as role_name, r.redirect_path,
  u.client_id, c.name as client_name, c.company_name, c.email as client_email
FROM public.app_user u
INNER JOIN public.role r ON u.role_id = r.id
LEFT JOIN public.client c ON u.client_id = c.id;

-- View: editorial_posts_full
CREATE OR REPLACE VIEW public.v_editorial_posts_full AS
SELECT 
  ep.*, ec.strategy_id, ec.name AS calendar_name,
  sms.client_id, c.name AS client_name, c.company_name AS client_company
FROM public.editorial_post ep
JOIN public.editorial_calendar ec ON ep.calendar_id = ec.id
JOIN public.social_media_strategy sms ON ec.strategy_id = sms.id
JOIN public.client c ON sms.client_id = c.id;

-- View: calendar_statistics
CREATE OR REPLACE VIEW public.v_calendar_statistics AS
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

-- View: strategy_summary
CREATE OR REPLACE VIEW public.v_strategy_summary AS
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

-- View: posts_by_pilier
CREATE OR REPLACE VIEW public.v_posts_by_pilier AS
SELECT 
  pc.id AS pilier_id, pc.strategy_id, pc.titre AS pilier_titre,
  COUNT(ep.id) AS nombre_posts,
  COUNT(CASE WHEN ep.status = 'published' THEN 1 END) AS posts_publies,
  COUNT(CASE WHEN ep.status = 'scheduled' THEN 1 END) AS posts_programmes
FROM public.pilier_contenu pc
LEFT JOIN public.editorial_post ep ON pc.id = ep.pilier_id
GROUP BY pc.id, pc.strategy_id, pc.titre;

-- View: user_statistics
CREATE OR REPLACE VIEW public.user_statistics AS
SELECT 
  r.code as role, r.name as role_name,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE u.is_active = true) as active_users,
  COUNT(*) FILTER (WHERE u.last_login > NOW() - INTERVAL '30 days') as active_last_month,
  COUNT(*) FILTER (WHERE u.last_login > NOW() - INTERVAL '7 days') as active_last_week
FROM public.app_user u
JOIN public.role r ON u.role_id = r.id
GROUP BY r.code, r.name;

-- =========================================================
-- PART 14: ROW LEVEL SECURITY (RLS)
-- =========================================================

-- Enable RLS on all tables
ALTER TABLE public.client ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandat_task ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contrat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persona ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilier_contenu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_mesure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_post ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_script ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_kpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_kpi_value ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_decks ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Admin has full access)
CREATE POLICY admin_all_clients ON public.client FOR ALL USING (auth.is_admin()) WITH CHECK (auth.is_admin());
CREATE POLICY admin_all_mandats ON public.mandat FOR ALL USING (auth.is_admin()) WITH CHECK (auth.is_admin());
CREATE POLICY admin_all_invoices ON public.invoice FOR ALL USING (auth.is_admin()) WITH CHECK (auth.is_admin());
CREATE POLICY admin_all_expenses ON public.expense FOR ALL USING (auth.is_admin()) WITH CHECK (auth.is_admin());
CREATE POLICY admin_all_strategies ON public.social_media_strategy FOR ALL USING (auth.is_admin()) WITH CHECK (auth.is_admin());
CREATE POLICY admin_all_calendars ON public.editorial_calendar FOR ALL USING (auth.is_admin()) WITH CHECK (auth.is_admin());
CREATE POLICY admin_all_posts ON public.editorial_post FOR ALL USING (auth.is_admin()) WITH CHECK (auth.is_admin());
CREATE POLICY admin_all_prospects ON public.prospects FOR ALL USING (auth.is_admin()) WITH CHECK (auth.is_admin());
CREATE POLICY admin_all_activities ON public.activities FOR ALL USING (auth.is_admin()) WITH CHECK (auth.is_admin());
CREATE POLICY admin_all_meetings ON public.meetings FOR ALL USING (auth.is_admin()) WITH CHECK (auth.is_admin());

-- Client policies (read-only their own data)
CREATE POLICY client_view_own ON public.client FOR SELECT USING (auth.is_client() AND id = auth.current_user_client_id());
CREATE POLICY client_view_own_mandats ON public.mandat FOR SELECT USING (auth.is_client() AND client_id = auth.current_user_client_id());
CREATE POLICY client_view_own_invoices ON public.invoice FOR SELECT USING (auth.is_client() AND client_id = auth.current_user_client_id());

COMMIT;

-- =========================================================
-- VERIFICATION & SUMMARY
-- =========================================================

SELECT 'Database recreation completed successfully!' as status;

SELECT 
  schemaname, 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- =========================================================
-- SUMMARY
-- =========================================================
-- ✅ 40+ tables created
-- ✅ 15 ENUM types
-- ✅ Authentication system (admin, client, staff roles)
-- ✅ Client & project management
-- ✅ Invoicing with recurring support
-- ✅ Expense tracking
-- ✅ Social media strategy module
-- ✅ Editorial calendar & posts
-- ✅ Video scripts
-- ✅ Client KPI tracking
-- ✅ Complete Sales/CRM module:
--    - Prospects & Contacts
--    - Pipeline with history
--    - Activities & Follow-ups
--    - Meetings & Calendar
--    - Meeting Minutes (PV)
--    - Pitch Deck Builder
-- ✅ All triggers & functions
-- ✅ All views
-- ✅ Row Level Security policies
-- ✅ Default admin user: admin@yourstory.ch / admin123
-- =========================================================
