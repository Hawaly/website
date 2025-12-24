-- Migration : Ajout de localité et représentant pour les clients
-- Date : 2025-11-25
-- Description : Ajoute les colonnes locality (ville) et represented_by (représentant) à la table client

BEGIN;

-- Ajouter la colonne locality (ville/localité)
ALTER TABLE public.client 
ADD COLUMN IF NOT EXISTS locality TEXT;

-- Ajouter la colonne represented_by (représentant du client)
ALTER TABLE public.client 
ADD COLUMN IF NOT EXISTS represented_by TEXT;

COMMIT;

-- Vérifier que les colonnes ont été ajoutées
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'client'
AND column_name IN ('locality', 'represented_by');

