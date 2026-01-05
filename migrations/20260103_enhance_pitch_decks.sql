-- =====================================================
-- Migration: Amélioration de la table pitch_decks
-- Date: 2026-01-03
-- Description: Ajout de champs pour assets, métriques et optimisations
-- =====================================================

-- 1. Table pour les assets (images, fichiers)
CREATE TABLE IF NOT EXISTS pitch_deck_assets (
  id SERIAL PRIMARY KEY,
  pitch_deck_id INTEGER NOT NULL REFERENCES pitch_decks(id) ON DELETE CASCADE,
  
  -- Informations fichier
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- image/jpeg, image/png, etc.
  file_size INTEGER, -- en bytes
  file_url VARCHAR(500), -- URL Supabase Storage ou base64
  storage_path VARCHAR(500), -- chemin dans Supabase Storage
  
  -- Métadonnées image
  width INTEGER,
  height INTEGER,
  alt_text VARCHAR(255),
  
  -- Utilisation
  slide_index INTEGER, -- Dans quelle slide l'asset est utilisé
  element_id BIGINT, -- ID de l'élément qui utilise cet asset
  
  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pitch_deck_assets_deck ON pitch_deck_assets(pitch_deck_id);
CREATE INDEX idx_pitch_deck_assets_slide ON pitch_deck_assets(pitch_deck_id, slide_index);

COMMENT ON TABLE pitch_deck_assets IS 'Assets (images, fichiers) utilisés dans les pitch decks';

-- 2. Ajout de colonnes à pitch_decks pour métriques et cache
ALTER TABLE pitch_decks 
  ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS slide_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS tags TEXT[], -- Tags pour catégorisation
  ADD COLUMN IF NOT EXISTS shared_with INTEGER[]; -- IDs des users avec qui c'est partagé

-- 3. Commentaires sur les colonnes
COMMENT ON COLUMN pitch_decks.slides IS 'Structure JSONB complète des slides avec tous les éléments';
COMMENT ON COLUMN pitch_decks.thumbnail_url IS 'URL de la miniature/preview du pitch deck';
COMMENT ON COLUMN pitch_decks.slide_count IS 'Nombre total de slides (cache pour performance)';
COMMENT ON COLUMN pitch_decks.view_count IS 'Nombre de fois que le pitch deck a été consulté';
COMMENT ON COLUMN pitch_decks.tags IS 'Tags pour filtrage et recherche';

-- 4. Table pour les templates prédéfinis
CREATE TABLE IF NOT EXISTS pitch_deck_templates (
  id SERIAL PRIMARY KEY,
  
  -- Informations générales
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'business', 'social-media', 'product', 'marketing'
  
  -- Contenu
  slides_template JSONB NOT NULL,
  preview_image_url VARCHAR(500),
  
  -- Métadonnées
  is_official BOOLEAN DEFAULT false, -- Templates Urstory officiels
  is_public BOOLEAN DEFAULT true, -- Visible par tous ou privé
  usage_count INTEGER DEFAULT 0,
  created_by INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pitch_deck_templates_category ON pitch_deck_templates(category);
CREATE INDEX idx_pitch_deck_templates_official ON pitch_deck_templates(is_official);

COMMENT ON TABLE pitch_deck_templates IS 'Templates prédéfinis pour pitch decks';

-- 5. Table pour historique des versions (optionnel, pour undo/redo)
CREATE TABLE IF NOT EXISTS pitch_deck_versions (
  id SERIAL PRIMARY KEY,
  pitch_deck_id INTEGER NOT NULL REFERENCES pitch_decks(id) ON DELETE CASCADE,
  
  -- Snapshot complet
  slides_snapshot JSONB NOT NULL,
  version_number INTEGER NOT NULL,
  
  -- Métadonnées du changement
  change_description TEXT,
  changed_by INTEGER,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pitch_deck_versions_deck ON pitch_deck_versions(pitch_deck_id);
CREATE INDEX idx_pitch_deck_versions_number ON pitch_deck_versions(pitch_deck_id, version_number);

COMMENT ON TABLE pitch_deck_versions IS 'Historique des versions pour undo/redo et audit';

-- 6. Fonction pour mettre à jour slide_count automatiquement
CREATE OR REPLACE FUNCTION update_pitch_deck_slide_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Compte le nombre de slides dans le JSONB
  NEW.slide_count = COALESCE(jsonb_array_length(NEW.slides), 0);
  NEW.last_edited_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger pour slide_count
DROP TRIGGER IF EXISTS trigger_update_slide_count ON pitch_decks;
CREATE TRIGGER trigger_update_slide_count
  BEFORE INSERT OR UPDATE OF slides ON pitch_decks
  FOR EACH ROW
  EXECUTE FUNCTION update_pitch_deck_slide_count();

-- 8. Fonction pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Triggers pour updated_at sur toutes les tables
DROP TRIGGER IF EXISTS trigger_pitch_decks_updated_at ON pitch_decks;
CREATE TRIGGER trigger_pitch_decks_updated_at
  BEFORE UPDATE ON pitch_decks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_pitch_deck_assets_updated_at ON pitch_deck_assets;
CREATE TRIGGER trigger_pitch_deck_assets_updated_at
  BEFORE UPDATE ON pitch_deck_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_pitch_deck_templates_updated_at ON pitch_deck_templates;
CREATE TRIGGER trigger_pitch_deck_templates_updated_at
  BEFORE UPDATE ON pitch_deck_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Insertion de templates Urstory officiels
INSERT INTO pitch_deck_templates (name, description, category, is_official, slides_template, preview_image_url)
VALUES 
  (
    'Urstory Standard',
    'Présentation standard avec l''identité visuelle Urstory - 5 slides',
    'business',
    true,
    '[
      {
        "id": 1,
        "title": "Page de garde",
        "order": 1,
        "content": {
          "type": "cover",
          "elements": [
            {"id": 1, "type": "heading", "text": "Votre Titre Ici", "level": "h1", "color": "text-white", "align": "center"},
            {"id": 2, "type": "separator", "style": "solid", "color": "border-brand-orange", "thickness": "border-4"},
            {"id": 3, "type": "text", "text": "Sous-titre ou description", "fontSize": "text-xl", "color": "text-slate-300", "align": "center"},
            {"id": 4, "type": "badge", "text": "Powered by Urstory", "color": "bg-brand-orange", "textColor": "text-white"}
          ]
        }
      },
      {
        "id": 2,
        "title": "À propos",
        "order": 2,
        "content": {
          "type": "about",
          "elements": [
            {"id": 1, "type": "heading", "text": "Qui sommes-nous ?", "level": "h2", "color": "text-brand-orange", "align": "left"},
            {"id": 2, "type": "columns", "columnCount": 2, "columns": [
              {"content": "Urstory est une agence digitale spécialisée dans la création de contenu."},
              {"content": "Notre mission : transformer vos idées en histoires captivantes."}
            ]}
          ]
        }
      },
      {
        "id": 3,
        "title": "Services",
        "order": 3,
        "content": {
          "type": "services",
          "elements": [
            {"id": 1, "type": "heading", "text": "Nos Services", "level": "h2", "color": "text-brand-orange", "align": "center"},
            {"id": 2, "type": "featureGrid", "features": [
              {"icon": "Target", "title": "Stratégie", "description": "Stratégie digitale complète"},
              {"icon": "TrendingUp", "title": "Croissance", "description": "Augmentation de votre visibilité"},
              {"icon": "Workflow", "title": "Automatisation", "description": "Optimisation des processus"}
            ]}
          ]
        }
      },
      {
        "id": 4,
        "title": "Résultats",
        "order": 4,
        "content": {
          "type": "results",
          "elements": [
            {"id": 1, "type": "heading", "text": "Nos Résultats", "level": "h2", "color": "text-brand-orange", "align": "center"},
            {"id": 2, "type": "barChart", "title": "Croissance moyenne", "data": [
              {"name": "Q1", "value": 120},
              {"name": "Q2", "value": 180},
              {"name": "Q3", "value": 240},
              {"name": "Q4", "value": 320}
            ], "dataKey": "value", "color": "#f97316"}
          ]
        }
      },
      {
        "id": 5,
        "title": "Contact",
        "order": 5,
        "content": {
          "type": "contact",
          "elements": [
            {"id": 1, "type": "heading", "text": "Contactez-nous", "level": "h2", "color": "text-brand-orange", "align": "center"},
            {"id": 2, "type": "callout", "text": "Prêt à transformer votre présence digitale ?", "type": "info"},
            {"id": 3, "type": "text", "text": "www.urstory.ch\\ncontact@urstory.ch", "fontSize": "text-lg", "color": "text-slate-300", "align": "center"}
          ]
        }
      }
    ]'::jsonb,
    '/templates/urstory-standard-preview.jpg'
  ),
  (
    'Stratégie Social Media',
    'Template pour présentation de stratégie social media - 5 slides',
    'social-media',
    true,
    '[
      {
        "id": 1,
        "title": "Stratégie Social Media",
        "order": 1,
        "content": {
          "type": "cover",
          "elements": [
            {"id": 1, "type": "heading", "text": "Stratégie Social Media 2024", "level": "h1", "color": "text-white", "align": "center"},
            {"id": 2, "type": "separator", "style": "solid", "color": "border-brand-orange", "thickness": "border-4"},
            {"id": 3, "type": "badge", "text": "Par Urstory", "color": "bg-brand-orange"}
          ]
        }
      },
      {
        "id": 2,
        "title": "Analyse",
        "order": 2,
        "content": {
          "type": "analysis",
          "elements": [
            {"id": 1, "type": "heading", "text": "État des lieux", "level": "h2", "color": "text-brand-orange", "align": "left"},
            {"id": 2, "type": "comparison", "title": "", "items": [
              {"label": "Points forts", "features": ["Engagement actuel", "Community active", "Contenu de qualité"]},
              {"label": "Axes d''amélioration", "features": ["Fréquence de publication", "Diversification formats", "Analytics"]}
            ]}
          ]
        }
      },
      {
        "id": 3,
        "title": "Objectifs & KPIs",
        "order": 3,
        "content": {
          "type": "objectives",
          "elements": [
            {"id": 1, "type": "heading", "text": "Objectifs & KPIs", "level": "h2", "color": "text-brand-orange", "align": "center"},
            {"id": 2, "type": "metricCard", "value": "+150%", "label": "Croissance followers", "trend": "up", "color": "text-brand-orange"}
          ]
        }
      },
      {
        "id": 4,
        "title": "Plan d''action",
        "order": 4,
        "content": {
          "type": "action",
          "elements": [
            {"id": 1, "type": "heading", "text": "Plan d''Action", "level": "h2", "color": "text-brand-orange", "align": "left"},
            {"id": 2, "type": "process", "steps": [
              {"number": 1, "title": "Audit", "description": "Analyse complète"},
              {"number": 2, "title": "Stratégie", "description": "Définition des axes"},
              {"number": 3, "title": "Exécution", "description": "Mise en place"}
            ]}
          ]
        }
      },
      {
        "id": 5,
        "title": "Timeline",
        "order": 5,
        "content": {
          "type": "timeline",
          "elements": [
            {"id": 1, "type": "heading", "text": "Roadmap", "level": "h2", "color": "text-brand-orange", "align": "center"},
            {"id": 2, "type": "timeline", "items": [
              {"date": "Mois 1", "title": "Audit", "description": "Analyse et stratégie"},
              {"date": "Mois 2-3", "title": "Création", "description": "Production de contenu"},
              {"date": "Mois 4+", "title": "Optimisation", "description": "Amélioration continue"}
            ], "orientation": "vertical"}
          ]
        }
      }
    ]'::jsonb,
    '/templates/urstory-social-media-preview.jpg'
  )
ON CONFLICT DO NOTHING;

-- 11. Mise à jour des pitch decks existants pour calculer slide_count
UPDATE pitch_decks 
SET slide_count = COALESCE(jsonb_array_length(slides), 0)
WHERE slide_count IS NULL OR slide_count = 0;

-- 12. Index de performance pour recherche
CREATE INDEX IF NOT EXISTS idx_pitch_decks_tags ON pitch_decks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_template ON pitch_decks(template_name);

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

-- Pour vérifier que tout fonctionne :
-- SELECT * FROM pitch_deck_templates WHERE is_official = true;
-- SELECT id, title, slide_count, created_at FROM pitch_decks;
