-- Migration: Ajouter le champ qr_additional_info à la table invoice
-- Ce champ permet de personnaliser l'information supplémentaire dans le QR-bill

ALTER TABLE public.invoice
ADD COLUMN IF NOT EXISTS qr_additional_info TEXT;

-- Commentaire pour documenter le champ
COMMENT ON COLUMN public.invoice.qr_additional_info IS 'Information supplémentaire personnalisable pour le QR-bill (max 140 caractères selon specs SIX)';


