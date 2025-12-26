-- Migration : Mise à jour des paramètres de l'agence YourStory
-- Date : 2025-11-25
-- Description : Met à jour l'adresse et le représentant de YourStory Agency

BEGIN;

-- Mettre à jour les informations de YourStory Agency
UPDATE public.company_settings
SET 
    agency_name = 'YourStory Agency',
    address = 'Rue de la Paix 15',  -- Modifiez selon votre vraie adresse
    zip_code = '2000',
    city = 'Neuchâtel',
    country = 'Suisse',
    phone = '+41 79 000 00 00',
    email = 'contact@yourstory.ch',
    tva_number = 'CHE-000.000.000'
WHERE id = 1;

-- Si aucune ligne n'existe, en créer une
INSERT INTO public.company_settings (
    id, agency_name, address, zip_code, city, country, phone, email, tva_number
)
SELECT 
    1, 'YourStory Agency', 'Rue de la Paix 15', '2000', 'Neuchâtel', 
    'Suisse', '+41 79 000 00 00', 'contact@yourstory.ch', 'CHE-000.000.000'
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings WHERE id = 1);

-- Ajouter une colonne pour le représentant si elle n'existe pas
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS represented_by TEXT;

-- Ajouter une colonne pour l'IBAN
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS iban TEXT;

-- Mettre à jour le représentant et l'IBAN
UPDATE public.company_settings
SET 
    represented_by = 'Mohamad Hawaley',
    iban = 'CH00 0000 0000 0000 0000 0'  -- Remplacez par votre vrai IBAN
WHERE id = 1;

COMMIT;

-- Vérifier les données
SELECT agency_name, represented_by, iban, email, phone FROM public.company_settings;

