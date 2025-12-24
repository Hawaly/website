-- Migration : Ajout des champs adresse et code postal à la table client
-- Date : 2024
-- Description : Ajoute les colonnes address et zip_code à la table client

BEGIN;

-- Ajouter la colonne address
ALTER TABLE public.client 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Ajouter la colonne zip_code
ALTER TABLE public.client 
ADD COLUMN IF NOT EXISTS zip_code TEXT;

COMMIT;

-- Vérifier que les colonnes ont été ajoutées
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'client'
AND column_name IN ('address', 'zip_code');

