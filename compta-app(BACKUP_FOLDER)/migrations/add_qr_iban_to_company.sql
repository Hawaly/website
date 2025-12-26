-- Migration : Ajout du QR-IBAN pour les QR-bills suisses
-- Date : 2025-11-25
-- Description : Ajoute le champ qr_iban à company_settings pour générer les QR-bills

BEGIN;

-- Ajouter la colonne qr_iban
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS qr_iban TEXT;

-- Mettre à jour avec votre QR-IBAN
-- ⚠️ IMPORTANT : Un QR-IBAN commence par CH et contient un numéro d'identification spécial
-- Demandez-le à votre banque ou utilisez l'IBAN normal en attendant
UPDATE public.company_settings
SET qr_iban = 'CH44 3199 9123 0008 8901 2'  -- ⚠️ REMPLACEZ PAR VOTRE VRAI QR-IBAN
WHERE id = 1;

COMMIT;

-- Vérifier
SELECT agency_name, iban, qr_iban, represented_by FROM public.company_settings;


