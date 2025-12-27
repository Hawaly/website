-- Migration: Ajouter le support des factures récurrentes
-- Date: 2024-12-27

BEGIN;

-- 1. Créer le type enum pour la récurrence des factures
CREATE TYPE invoice_recurrence AS ENUM ('oneshot', 'mensuel', 'trimestriel', 'annuel');

-- 2. Ajouter les colonnes pour les factures récurrentes
ALTER TABLE public.invoice 
  ADD COLUMN IF NOT EXISTS is_recurring invoice_recurrence NOT NULL DEFAULT 'oneshot',
  ADD COLUMN IF NOT EXISTS recurrence_day INTEGER CHECK (recurrence_day >= 1 AND recurrence_day <= 31),
  ADD COLUMN IF NOT EXISTS parent_invoice_id BIGINT REFERENCES public.invoice(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS next_generation_date DATE,
  ADD COLUMN IF NOT EXISTS auto_send BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS max_occurrences INTEGER CHECK (max_occurrences > 0),
  ADD COLUMN IF NOT EXISTS occurrences_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS end_date DATE;

-- 3. Créer un index sur parent_invoice_id pour optimiser les requêtes d'historique
CREATE INDEX IF NOT EXISTS idx_invoice_parent_invoice_id ON public.invoice(parent_invoice_id);

-- 4. Créer un index sur next_generation_date pour optimiser les requêtes de génération
CREATE INDEX IF NOT EXISTS idx_invoice_next_generation_date ON public.invoice(next_generation_date) 
  WHERE is_recurring != 'oneshot';

-- 5. Créer un index sur is_recurring pour optimiser les requêtes de factures récurrentes
CREATE INDEX IF NOT EXISTS idx_invoice_is_recurring ON public.invoice(is_recurring) 
  WHERE is_recurring != 'oneshot';

-- 6. Ajouter un commentaire sur les colonnes
COMMENT ON COLUMN public.invoice.is_recurring IS 'Type de récurrence: oneshot (unique), mensuel, trimestriel, annuel';
COMMENT ON COLUMN public.invoice.recurrence_day IS 'Jour du mois (1-31) pour la génération automatique';
COMMENT ON COLUMN public.invoice.parent_invoice_id IS 'Référence à la facture modèle si cette facture a été générée automatiquement';
COMMENT ON COLUMN public.invoice.next_generation_date IS 'Prochaine date de génération automatique pour les factures récurrentes';
COMMENT ON COLUMN public.invoice.auto_send IS 'Envoi automatique lors de la génération (passe directement en statut envoyee)';
COMMENT ON COLUMN public.invoice.max_occurrences IS 'Nombre maximum de factures à générer (NULL = illimité)';
COMMENT ON COLUMN public.invoice.occurrences_count IS 'Nombre de factures déjà générées depuis le modèle';
COMMENT ON COLUMN public.invoice.end_date IS 'Date de fin de la récurrence (optionnel, complémentaire à max_occurrences)';

COMMIT;

-- Pour rollback:
-- BEGIN;
-- DROP INDEX IF EXISTS idx_invoice_is_recurring;
-- DROP INDEX IF EXISTS idx_invoice_next_generation_date;
-- DROP INDEX IF EXISTS idx_invoice_parent_invoice_id;
-- ALTER TABLE public.invoice 
--   DROP COLUMN IF EXISTS auto_send,
--   DROP COLUMN IF EXISTS next_generation_date,
--   DROP COLUMN IF EXISTS parent_invoice_id,
--   DROP COLUMN IF EXISTS recurrence_day,
--   DROP COLUMN IF EXISTS is_recurring;
-- DROP TYPE IF EXISTS invoice_recurrence;
-- COMMIT;
