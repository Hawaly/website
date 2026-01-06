-- Migration: Ajouter colonnes manquantes à la table invoice
-- Date: 2026-01-06
-- Description: Ajoute payment_date, end_date et autres champs de récurrence

-- 1. Ajouter la colonne payment_date
ALTER TABLE invoice 
ADD COLUMN IF NOT EXISTS payment_date DATE;

COMMENT ON COLUMN invoice.payment_date IS 'Date de paiement effectif de la facture. Utilisée pour calculer le CA réel du mois. NULL si non payée.';

-- 2. Ajouter la colonne end_date pour les factures récurrentes
ALTER TABLE invoice 
ADD COLUMN IF NOT EXISTS end_date DATE;

COMMENT ON COLUMN invoice.end_date IS 'Date de fin de la récurrence (optionnel). NULL = illimité.';

-- 3. Ajouter les autres colonnes de récurrence si elles n''existent pas
ALTER TABLE invoice 
ADD COLUMN IF NOT EXISTS is_recurring VARCHAR(50) DEFAULT 'non';

ALTER TABLE invoice 
ADD COLUMN IF NOT EXISTS recurrence_day INTEGER;

ALTER TABLE invoice 
ADD COLUMN IF NOT EXISTS parent_invoice_id INTEGER REFERENCES invoice(id);

ALTER TABLE invoice 
ADD COLUMN IF NOT EXISTS next_generation_date DATE;

ALTER TABLE invoice 
ADD COLUMN IF NOT EXISTS auto_send BOOLEAN DEFAULT false;

ALTER TABLE invoice 
ADD COLUMN IF NOT EXISTS max_occurrences INTEGER;

ALTER TABLE invoice 
ADD COLUMN IF NOT EXISTS occurrences_count INTEGER DEFAULT 0;

-- 4. Initialiser les factures déjà payées avec leur date d'émission (optionnel)
UPDATE invoice 
SET payment_date = issue_date 
WHERE status = 'payee' AND payment_date IS NULL;

-- Note: Lors du changement de statut vers 'payee', mettre à jour payment_date avec la date actuelle
