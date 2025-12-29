-- Migration: Créer la table video_script pour stocker les scripts vidéo
-- Date: 2025-12-28

CREATE TABLE IF NOT EXISTS video_script (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  client_id INTEGER REFERENCES client(id) ON DELETE SET NULL,
  mandat_id INTEGER REFERENCES mandat(id) ON DELETE SET NULL,
  editorial_post_id INTEGER REFERENCES editorial_post(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_video_script_client_id ON video_script(client_id);
CREATE INDEX IF NOT EXISTS idx_video_script_mandat_id ON video_script(mandat_id);
CREATE INDEX IF NOT EXISTS idx_video_script_editorial_post_id ON video_script(editorial_post_id);
CREATE INDEX IF NOT EXISTS idx_video_script_updated_at ON video_script(updated_at DESC);

-- Commentaires
COMMENT ON TABLE video_script IS 'Scripts vidéo avec éditeur de texte riche';
COMMENT ON COLUMN video_script.title IS 'Titre du script';
COMMENT ON COLUMN video_script.content IS 'Contenu HTML du script';
COMMENT ON COLUMN video_script.client_id IS 'Client associé (optionnel)';
COMMENT ON COLUMN video_script.mandat_id IS 'Mandat associé (optionnel)';
COMMENT ON COLUMN video_script.editorial_post_id IS 'Lien vers la vidéo planifiée dans le calendrier éditorial (optionnel)';
