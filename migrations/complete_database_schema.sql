-- =====================================================
-- SCRIPT SQL COMPLET - BASE DE DONNÉES YOURSTORY
-- =====================================================
-- Ce script recrée toute la base de données depuis zéro
-- Date: 2025-12-28
-- =====================================================

-- Supprimer les tables existantes (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS kpi_mesure CASCADE;
DROP TABLE IF EXISTS kpi CASCADE;
DROP TABLE IF EXISTS editorial_post CASCADE;
DROP TABLE IF EXISTS editorial_calendar CASCADE;
DROP TABLE IF EXISTS pilier_contenu CASCADE;
DROP TABLE IF EXISTS persona CASCADE;
DROP TABLE IF EXISTS social_media_strategy CASCADE;
DROP TABLE IF EXISTS video_script CASCADE;
DROP TABLE IF EXISTS expense CASCADE;
DROP TABLE IF EXISTS expense_category CASCADE;
DROP TABLE IF EXISTS contract CASCADE;
DROP TABLE IF EXISTS invoice_item CASCADE;
DROP TABLE IF EXISTS invoice CASCADE;
DROP TABLE IF EXISTS mandat_task CASCADE;
DROP TABLE IF EXISTS mandat CASCADE;
DROP TABLE IF EXISTS client CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;

-- Supprimer les types ENUM existants
DROP TYPE IF EXISTS client_type CASCADE;
DROP TYPE IF EXISTS client_status CASCADE;
DROP TYPE IF EXISTS mandat_status CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS invoice_recurrence CASCADE;
DROP TYPE IF EXISTS expense_type CASCADE;
DROP TYPE IF EXISTS recurrence_type CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS task_type CASCADE;
DROP TYPE IF EXISTS strategy_status CASCADE;
DROP TYPE IF EXISTS post_status CASCADE;

-- =====================================================
-- CRÉATION DES TYPES ENUM
-- =====================================================

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

-- =====================================================
-- TABLE: company_settings
-- Paramètres de l'agence
-- =====================================================

CREATE TABLE company_settings (
  id SERIAL PRIMARY KEY,
  agency_name VARCHAR(255) NOT NULL DEFAULT 'YourStory',
  address TEXT,
  zip_code VARCHAR(20),
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Suisse',
  phone VARCHAR(50),
  email VARCHAR(255),
  tva_number VARCHAR(100),
  represented_by VARCHAR(255),
  iban VARCHAR(100),
  qr_iban VARCHAR(100)
);

COMMENT ON TABLE company_settings IS 'Paramètres globaux de l''agence YourStory';

-- Insérer les paramètres par défaut
INSERT INTO company_settings (agency_name, country) VALUES ('YourStory', 'Suisse');

-- =====================================================
-- TABLE: client
-- Gestion des clients
-- =====================================================

CREATE TABLE client (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type client_type NOT NULL DEFAULT 'oneshot',
  status client_status NOT NULL DEFAULT 'potentiel',
  email VARCHAR(255),
  phone VARCHAR(50),
  company_name VARCHAR(255),
  address TEXT,
  zip_code VARCHAR(20),
  locality VARCHAR(100),
  represented_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_client_status ON client(status);
CREATE INDEX idx_client_type ON client(type);
CREATE INDEX idx_client_name ON client(name);

COMMENT ON TABLE client IS 'Clients de l''agence';
COMMENT ON COLUMN client.type IS 'Type de client: oneshot ou mensuel';
COMMENT ON COLUMN client.status IS 'Statut du client: actif, pause, termine, potentiel';

-- =====================================================
-- TABLE: mandat
-- Gestion des mandats/projets
-- =====================================================

CREATE TABLE mandat (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES client(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  mandat_type VARCHAR(100),
  status mandat_status NOT NULL DEFAULT 'en_cours',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mandat_client_id ON mandat(client_id);
CREATE INDEX idx_mandat_status ON mandat(status);
CREATE INDEX idx_mandat_dates ON mandat(start_date, end_date);

COMMENT ON TABLE mandat IS 'Mandats/projets clients';
COMMENT ON COLUMN mandat.status IS 'Statut: en_cours, termine, annule';

-- =====================================================
-- TABLE: mandat_task
-- Tâches liées aux mandats
-- =====================================================

CREATE TABLE mandat_task (
  id SERIAL PRIMARY KEY,
  mandat_id INTEGER NOT NULL REFERENCES mandat(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  details TEXT,
  type task_type NOT NULL DEFAULT 'autre',
  status task_status NOT NULL DEFAULT 'a_faire',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_task_mandat_id ON mandat_task(mandat_id);
CREATE INDEX idx_task_status ON mandat_task(status);
CREATE INDEX idx_task_type ON mandat_task(type);
CREATE INDEX idx_task_due_date ON mandat_task(due_date);

COMMENT ON TABLE mandat_task IS 'Tâches associées aux mandats';
COMMENT ON COLUMN mandat_task.type IS 'Type: contenu, video, reunion, reporting, autre';
COMMENT ON COLUMN mandat_task.status IS 'Statut: a_faire, en_cours, terminee';

-- =====================================================
-- TABLE: invoice
-- Gestion des factures (avec récurrence)
-- =====================================================

CREATE TABLE invoice (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES client(id) ON DELETE CASCADE,
  mandat_id INTEGER REFERENCES mandat(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  issue_date DATE NOT NULL,
  due_date DATE,
  total_ht DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_tva DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_ttc DECIMAL(10,2) NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'brouillon',
  pdf_path TEXT,
  qr_additional_info TEXT,
  
  -- Champs pour les factures récurrentes
  is_recurring invoice_recurrence NOT NULL DEFAULT 'oneshot',
  recurrence_day INTEGER CHECK (recurrence_day >= 1 AND recurrence_day <= 31),
  parent_invoice_id INTEGER REFERENCES invoice(id) ON DELETE SET NULL,
  next_generation_date DATE,
  auto_send BOOLEAN DEFAULT FALSE,
  
  -- Gestion de la durée limitée
  max_occurrences INTEGER,
  occurrences_count INTEGER DEFAULT 0,
  end_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoice_client_id ON invoice(client_id);
CREATE INDEX idx_invoice_mandat_id ON invoice(mandat_id);
CREATE INDEX idx_invoice_status ON invoice(status);
CREATE INDEX idx_invoice_number ON invoice(invoice_number);
CREATE INDEX idx_invoice_issue_date ON invoice(issue_date DESC);
CREATE INDEX idx_invoice_recurring ON invoice(is_recurring) WHERE is_recurring != 'oneshot';
CREATE INDEX idx_invoice_next_generation ON invoice(next_generation_date) WHERE next_generation_date IS NOT NULL;

COMMENT ON TABLE invoice IS 'Factures clients avec support de récurrence';
COMMENT ON COLUMN invoice.is_recurring IS 'Type de récurrence: oneshot, mensuel, trimestriel, annuel';
COMMENT ON COLUMN invoice.recurrence_day IS 'Jour du mois (1-31) pour génération automatique';
COMMENT ON COLUMN invoice.parent_invoice_id IS 'Facture parente si générée automatiquement';

-- =====================================================
-- TABLE: invoice_item
-- Lignes de facture
-- =====================================================

CREATE TABLE invoice_item (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_invoice_item_invoice_id ON invoice_item(invoice_id);

COMMENT ON TABLE invoice_item IS 'Lignes de facture (produits/services)';

-- =====================================================
-- TABLE: contract
-- Contrats clients
-- =====================================================

CREATE TABLE contract (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES client(id) ON DELETE CASCADE,
  mandat_id INTEGER REFERENCES mandat(id) ON DELETE SET NULL,
  contrat_number VARCHAR(50) NOT NULL UNIQUE,
  file_path TEXT NOT NULL,
  signed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contract_client_id ON contract(client_id);
CREATE INDEX idx_contract_mandat_id ON contract(mandat_id);

COMMENT ON TABLE contract IS 'Contrats signés avec les clients';

-- =====================================================
-- TABLE: expense_category
-- Catégories de dépenses
-- =====================================================

CREATE TABLE expense_category (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  is_recurring BOOLEAN DEFAULT FALSE
);

COMMENT ON TABLE expense_category IS 'Catégories de dépenses prédéfinies';

-- Insérer des catégories par défaut
INSERT INTO expense_category (name, is_recurring) VALUES
  ('Logiciels & Abonnements', true),
  ('Matériel', false),
  ('Déplacements', false),
  ('Marketing', false),
  ('Freelances', false),
  ('Formation', false),
  ('Hébergement', true),
  ('Assurances', true),
  ('Bureau', true);

-- =====================================================
-- TABLE: expense
-- Gestion des dépenses
-- =====================================================

CREATE TABLE expense (
  id SERIAL PRIMARY KEY,
  type expense_type NOT NULL,
  mandat_id INTEGER REFERENCES mandat(id) ON DELETE SET NULL,
  client_id INTEGER REFERENCES client(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES expense_category(id) ON DELETE SET NULL,
  label VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  is_recurring recurrence_type NOT NULL DEFAULT 'oneshot',
  notes TEXT,
  receipt_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_expense_type ON expense(type);
CREATE INDEX idx_expense_mandat_id ON expense(mandat_id);
CREATE INDEX idx_expense_client_id ON expense(client_id);
CREATE INDEX idx_expense_category_id ON expense(category_id);
CREATE INDEX idx_expense_date ON expense(date DESC);

COMMENT ON TABLE expense IS 'Dépenses de l''agence';
COMMENT ON COLUMN expense.type IS 'Type: client_mandat ou yourstory';
COMMENT ON COLUMN expense.is_recurring IS 'Récurrence: oneshot ou mensuel';

-- =====================================================
-- TABLE: social_media_strategy
-- Stratégies social media
-- =====================================================

CREATE TABLE social_media_strategy (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES client(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  status strategy_status NOT NULL DEFAULT 'brouillon',
  
  -- 1. Contexte & objectifs business
  contexte_general TEXT,
  objectifs_business TEXT,
  objectifs_reseaux TEXT,
  
  -- 2. Audience & Personas
  cibles TEXT,
  plateformes TEXT[],
  
  -- 3. Positionnement & identité
  ton_voix TEXT,
  guidelines_visuelles TEXT,
  valeurs_messages TEXT,
  
  -- 5. Formats & rythme
  formats_envisages TEXT[],
  frequence_calendrier TEXT,
  workflow_roles TEXT,
  
  -- 6. Audit & concurrence
  audit_profils TEXT,
  benchmark_concurrents TEXT,
  
  -- 7. KPIs & suivi
  cadre_suivi TEXT,
  
  -- 8. Canaux & mix média (PESO)
  owned_media TEXT,
  shared_media TEXT,
  paid_media TEXT,
  earned_media TEXT,
  
  -- 9. Budget & ressources
  temps_humain TEXT,
  outils TEXT,
  budget_pub TEXT,
  
  -- 10. Planning & optimisation
  planning_global TEXT,
  processus_iteration TEXT,
  mise_a_jour TEXT,
  
  -- Métadonnées
  notes_internes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255)
);

CREATE INDEX idx_strategy_client_id ON social_media_strategy(client_id);
CREATE INDEX idx_strategy_status ON social_media_strategy(status);
CREATE INDEX idx_strategy_version ON social_media_strategy(version);

COMMENT ON TABLE social_media_strategy IS 'Stratégies social media complètes pour les clients';

-- =====================================================
-- TABLE: persona
-- Personas d'audience
-- =====================================================

CREATE TABLE persona (
  id SERIAL PRIMARY KEY,
  strategy_id INTEGER NOT NULL REFERENCES social_media_strategy(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  age_range VARCHAR(50),
  profession VARCHAR(255),
  besoins TEXT,
  problemes TEXT,
  attentes TEXT,
  comportements TEXT,
  canaux_preferes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_persona_strategy_id ON persona(strategy_id);

COMMENT ON TABLE persona IS 'Personas d''audience pour les stratégies';

-- =====================================================
-- TABLE: pilier_contenu
-- Piliers de contenu
-- =====================================================

CREATE TABLE pilier_contenu (
  id SERIAL PRIMARY KEY,
  strategy_id INTEGER NOT NULL REFERENCES social_media_strategy(id) ON DELETE CASCADE,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  exemples TEXT,
  pourcentage_cible INTEGER CHECK (pourcentage_cible >= 0 AND pourcentage_cible <= 100),
  ordre INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pilier_strategy_id ON pilier_contenu(strategy_id);
CREATE INDEX idx_pilier_ordre ON pilier_contenu(ordre);

COMMENT ON TABLE pilier_contenu IS 'Piliers de contenu pour les stratégies';
COMMENT ON COLUMN pilier_contenu.pourcentage_cible IS 'Pourcentage cible du contenu (0-100)';

-- =====================================================
-- TABLE: kpi
-- Indicateurs de performance
-- =====================================================

CREATE TABLE kpi (
  id SERIAL PRIMARY KEY,
  strategy_id INTEGER NOT NULL REFERENCES social_media_strategy(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  objectif TEXT,
  valeur_cible DECIMAL(10,2),
  unite VARCHAR(50),
  periodicite VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kpi_strategy_id ON kpi(strategy_id);

COMMENT ON TABLE kpi IS 'KPIs (indicateurs de performance) pour les stratégies';
COMMENT ON COLUMN kpi.unite IS 'Unité de mesure: followers, %, CHF, etc.';
COMMENT ON COLUMN kpi.periodicite IS 'Périodicité: mensuel, hebdomadaire, annuel';

-- =====================================================
-- TABLE: kpi_mesure
-- Mesures de KPIs dans le temps
-- =====================================================

CREATE TABLE kpi_mesure (
  id SERIAL PRIMARY KEY,
  kpi_id INTEGER NOT NULL REFERENCES kpi(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  valeur_mesuree DECIMAL(10,2) NOT NULL,
  commentaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kpi_mesure_kpi_id ON kpi_mesure(kpi_id);
CREATE INDEX idx_kpi_mesure_date ON kpi_mesure(date DESC);

COMMENT ON TABLE kpi_mesure IS 'Mesures historiques des KPIs';

-- =====================================================
-- TABLE: editorial_calendar
-- Calendriers éditoriaux
-- =====================================================

CREATE TABLE editorial_calendar (
  id SERIAL PRIMARY KEY,
  strategy_id INTEGER NOT NULL REFERENCES social_media_strategy(id) ON DELETE CASCADE,
  name VARCHAR(255),
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_calendar_strategy_id ON editorial_calendar(strategy_id);
CREATE INDEX idx_calendar_dates ON editorial_calendar(start_date, end_date);

COMMENT ON TABLE editorial_calendar IS 'Calendriers éditoriaux pour planifier les publications';

-- =====================================================
-- TABLE: editorial_post
-- Posts du calendrier éditorial
-- =====================================================

CREATE TABLE editorial_post (
  id SERIAL PRIMARY KEY,
  calendar_id INTEGER NOT NULL REFERENCES editorial_calendar(id) ON DELETE CASCADE,
  pilier_id INTEGER REFERENCES pilier_contenu(id) ON DELETE SET NULL,
  
  -- Informations du post
  publication_date DATE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  content_type VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Contenu
  caption TEXT,
  hashtags TEXT[],
  mentions TEXT[],
  media_urls TEXT[],
  
  -- Statut et suivi
  status post_status NOT NULL DEFAULT 'draft',
  scheduled_time TIME,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Métriques
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  
  -- Métadonnées
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255)
);

CREATE INDEX idx_post_calendar_id ON editorial_post(calendar_id);
CREATE INDEX idx_post_pilier_id ON editorial_post(pilier_id);
CREATE INDEX idx_post_publication_date ON editorial_post(publication_date);
CREATE INDEX idx_post_status ON editorial_post(status);
CREATE INDEX idx_post_platform ON editorial_post(platform);

COMMENT ON TABLE editorial_post IS 'Publications planifiées dans le calendrier éditorial';
COMMENT ON COLUMN editorial_post.status IS 'Statut: draft, scheduled, published, cancelled';

-- =====================================================
-- TABLE: video_script
-- Scripts vidéo avec éditeur riche
-- =====================================================

CREATE TABLE video_script (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  client_id INTEGER REFERENCES client(id) ON DELETE SET NULL,
  mandat_id INTEGER REFERENCES mandat(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_script_client_id ON video_script(client_id);
CREATE INDEX idx_video_script_mandat_id ON video_script(mandat_id);
CREATE INDEX idx_video_script_updated_at ON video_script(updated_at DESC);

COMMENT ON TABLE video_script IS 'Scripts vidéo avec éditeur de texte riche';
COMMENT ON COLUMN video_script.content IS 'Contenu HTML du script';

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

-- Afficher un message de succès
DO $$
BEGIN
  RAISE NOTICE 'Base de données YourStory créée avec succès!';
  RAISE NOTICE 'Tables créées: 17';
  RAISE NOTICE 'Types ENUM créés: 11';
END $$;
