-- =====================================================
-- SALES/CRM MODULE - DATABASE SCHEMA
-- =====================================================
-- Tables pour la gestion commerciale et acquisition clients
-- Date: 2025-01-03
-- =====================================================

-- =====================================================
-- CRÉATION DES TYPES ENUM
-- =====================================================

-- Statut du prospect dans le pipeline
CREATE TYPE IF NOT EXISTS prospect_status AS ENUM (
  'new',
  'qualified',
  'discovery',
  'proposal',
  'negotiation',
  'won',
  'lost'
);

-- Type d'activité
CREATE TYPE IF NOT EXISTS activity_type AS ENUM (
  'call',
  'email',
  'task',
  'meeting'
);

-- Statut d'une activité
CREATE TYPE IF NOT EXISTS activity_status AS ENUM (
  'planned',
  'completed',
  'cancelled'
);

-- Priorité
CREATE TYPE IF NOT EXISTS priority_level AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Source du lead
CREATE TYPE IF NOT EXISTS lead_source AS ENUM (
  'website',
  'referral',
  'linkedin',
  'cold_outreach',
  'event',
  'other'
);

-- =====================================================
-- TABLE: prospects
-- Entreprises prospects (leads)
-- =====================================================

CREATE TABLE IF NOT EXISTS prospects (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  location VARCHAR(255),
  country VARCHAR(100),
  
  -- Pipeline
  status prospect_status NOT NULL DEFAULT 'new',
  pipeline_stage VARCHAR(50) DEFAULT 'new',
  
  -- Qualification
  estimated_value DECIMAL(10,2),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  
  -- Metadata
  source lead_source,
  priority priority_level DEFAULT 'medium',
  tags TEXT[],
  owner_id INTEGER,
  
  -- Dates
  first_contact_date DATE,
  last_contact_date DATE,
  expected_close_date DATE,
  won_date DATE,
  lost_date DATE,
  lost_reason TEXT,
  
  -- Notes
  pain_points TEXT,
  objectives TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_owner ON prospects(owner_id);
CREATE INDEX idx_prospects_tags ON prospects USING GIN(tags);

COMMENT ON TABLE prospects IS 'Entreprises prospects et opportunités commerciales';

-- =====================================================
-- TABLE: contacts
-- Contacts liés aux prospects
-- =====================================================

CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  
  -- Informations personnelles
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  department VARCHAR(100),
  
  -- Coordonnées
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  linkedin_url VARCHAR(255),
  
  -- Metadata
  is_primary BOOLEAN DEFAULT false,
  is_decision_maker BOOLEAN DEFAULT false,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contacts_prospect ON contacts(prospect_id);
CREATE INDEX idx_contacts_email ON contacts(email);

COMMENT ON TABLE contacts IS 'Contacts associés aux prospects';

-- =====================================================
-- TABLE: activities
-- Activités et suivi (calls, emails, tasks, meetings)
-- =====================================================

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER REFERENCES prospects(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
  
  -- Type et détails
  type activity_type NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Statut et priorité
  status activity_status DEFAULT 'planned',
  priority priority_level DEFAULT 'medium',
  
  -- Dates
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  
  -- Assignation
  assigned_to INTEGER,
  
  -- Rappels
  reminder_date TIMESTAMP WITH TIME ZONE,
  reminder_sent BOOLEAN DEFAULT false,
  
  -- Résultat
  outcome TEXT,
  next_action TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_prospect ON activities(prospect_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_due_date ON activities(due_date);
CREATE INDEX idx_activities_assigned ON activities(assigned_to);

COMMENT ON TABLE activities IS 'Activités commerciales: calls, emails, tasks';

-- =====================================================
-- TABLE: meetings
-- Rendez-vous commerciaux
-- =====================================================

CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER REFERENCES prospects(id) ON DELETE CASCADE,
  
  -- Détails du meeting
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  meeting_url VARCHAR(500),
  
  -- Dates et durée
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Europe/Zurich',
  
  -- Participants
  organizer_id INTEGER,
  attendees_internal INTEGER[],
  attendees_external JSONB,
  
  -- Statut
  status VARCHAR(50) DEFAULT 'scheduled',
  is_cancelled BOOLEAN DEFAULT false,
  cancellation_reason TEXT,
  
  -- Export
  ics_uid VARCHAR(255),
  calendar_event_id VARCHAR(255),
  
  -- Notes pré-meeting
  agenda TEXT,
  preparation_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_meetings_prospect ON meetings(prospect_id);
CREATE INDEX idx_meetings_start_time ON meetings(start_time);
CREATE INDEX idx_meetings_organizer ON meetings(organizer_id);

COMMENT ON TABLE meetings IS 'Rendez-vous commerciaux et calendrier';

-- =====================================================
-- TABLE: meeting_minutes (PV)
-- Procès-verbaux de réunions
-- =====================================================

CREATE TABLE IF NOT EXISTS meeting_minutes (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
  prospect_id INTEGER REFERENCES prospects(id) ON DELETE CASCADE,
  
  -- Informations générales
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  title VARCHAR(255) NOT NULL,
  
  -- Participants
  participants JSONB,
  
  -- Contenu structuré
  context TEXT,
  agenda TEXT,
  discussion_points TEXT,
  decisions TEXT,
  
  -- Actions de suivi
  action_items JSONB,
  
  -- Prochain RDV
  next_meeting_date TIMESTAMP WITH TIME ZONE,
  next_meeting_notes TEXT,
  
  -- Fichiers
  attachments JSONB,
  
  -- Validation
  is_approved BOOLEAN DEFAULT false,
  approved_by INTEGER,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Export
  pdf_url VARCHAR(500),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_meeting_minutes_meeting ON meeting_minutes(meeting_id);
CREATE INDEX idx_meeting_minutes_prospect ON meeting_minutes(prospect_id);

COMMENT ON TABLE meeting_minutes IS 'Procès-verbaux de réunions structurés';

-- =====================================================
-- TABLE: pitch_decks
-- Pitch decks par prospect
-- =====================================================

CREATE TABLE IF NOT EXISTS pitch_decks (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  
  -- Informations générales
  title VARCHAR(255) NOT NULL,
  description TEXT,
  template_name VARCHAR(100),
  
  -- Contenu (JSON structure)
  slides JSONB NOT NULL,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_deck_id INTEGER REFERENCES pitch_decks(id) ON DELETE SET NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_sent BOOLEAN DEFAULT false,
  sent_date TIMESTAMP WITH TIME ZONE,
  
  -- Export
  pdf_url VARCHAR(500),
  pptx_url VARCHAR(500),
  
  -- Metadata
  created_by INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pitch_decks_prospect ON pitch_decks(prospect_id);
CREATE INDEX idx_pitch_decks_version ON pitch_decks(version);
CREATE INDEX idx_pitch_decks_active ON pitch_decks(is_active);

COMMENT ON TABLE pitch_decks IS 'Pitch decks et présentations commerciales';

-- =====================================================
-- TABLE: pipeline_history
-- Historique des changements de statut
-- =====================================================

CREATE TABLE IF NOT EXISTS pipeline_history (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  
  from_status prospect_status,
  to_status prospect_status NOT NULL,
  
  changed_by INTEGER,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pipeline_history_prospect ON pipeline_history(prospect_id);
CREATE INDEX idx_pipeline_history_date ON pipeline_history(created_at);

COMMENT ON TABLE pipeline_history IS 'Historique des changements de statut pipeline';

-- =====================================================
-- FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_minutes_updated_at BEFORE UPDATE ON meeting_minutes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pitch_decks_updated_at BEFORE UPDATE ON pitch_decks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un historique lors du changement de statut
CREATE OR REPLACE FUNCTION log_pipeline_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO pipeline_history (prospect_id, from_status, to_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_prospect_status_change AFTER UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION log_pipeline_change();

-- Fonction pour mettre à jour last_contact_date
CREATE OR REPLACE FUNCTION update_prospect_last_contact()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE prospects 
  SET last_contact_date = CURRENT_DATE
  WHERE id = NEW.prospect_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_last_contact_on_activity AFTER INSERT ON activities
  FOR EACH ROW EXECUTE FUNCTION update_prospect_last_contact();

CREATE TRIGGER update_last_contact_on_meeting AFTER INSERT ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_prospect_last_contact();

-- =====================================================
-- DONNÉES DE DÉMONSTRATION (OPTIONNEL)
-- =====================================================

-- Exemple de prospect
INSERT INTO prospects (company_name, website, industry, company_size, location, country, status, estimated_value, probability, source, priority, pain_points, objectives)
VALUES 
  ('TechCorp Solutions', 'https://techcorp.example.com', 'Technology', '50-100', 'Zurich', 'Suisse', 'qualified', 25000.00, 60, 'linkedin', 'high', 
   'Manque de visibilité sur les réseaux sociaux, difficulté à générer du contenu engageant', 
   'Développer leur présence sociale, générer 100 leads/mois via LinkedIn'),
  
  ('Innovation Labs', 'https://innovationlabs.example.com', 'Healthcare', '20-50', 'Geneva', 'Suisse', 'discovery', 18000.00, 40, 'referral', 'medium',
   'Besoin de structurer leur stratégie de contenu, aucune expertise interne',
   'Créer une stratégie de contenu complète, former leur équipe marketing');

-- Exemple de contact
INSERT INTO contacts (prospect_id, first_name, last_name, role, email, phone, linkedin_url, is_primary, is_decision_maker)
VALUES 
  (1, 'Sophie', 'Martin', 'Head of Marketing', 'sophie.martin@techcorp.example.com', '+41 44 123 45 67', 'https://linkedin.com/in/sophiemartin', true, true),
  (1, 'Jean', 'Dupont', 'CMO', 'jean.dupont@techcorp.example.com', '+41 44 123 45 68', 'https://linkedin.com/in/jeandupont', false, true);

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
