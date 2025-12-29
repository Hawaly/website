-- Migration: Ajouter la liaison entre video_script et editorial_post
-- Date: 2025-12-29

-- Ajouter la colonne editorial_post_id à video_script
ALTER TABLE video_script 
ADD COLUMN IF NOT EXISTS editorial_post_id INTEGER REFERENCES editorial_post(id) ON DELETE SET NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_video_script_editorial_post_id ON video_script(editorial_post_id);

-- Commentaire
COMMENT ON COLUMN video_script.editorial_post_id IS 'Lien vers la vidéo planifiée dans le calendrier éditorial';

-- Note: Les scripts existants auront editorial_post_id = NULL, ce qui est valide
-- car ils peuvent avoir été créés avant la mise en place de cette liaison.
