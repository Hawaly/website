-- ============================================
-- Script de Vérification Post-Migration
-- Système de Facturation Récurrente Optimisé
-- ============================================

-- 1. Vérifier l'existence du type enum
SELECT 
  'Type enum invoice_recurrence' as verification,
  EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'invoice_recurrence'
  ) AS status;

-- 2. Compter les nouvelles colonnes
SELECT 
  'Nouvelles colonnes ajoutées' as verification,
  COUNT(*) as status
FROM information_schema.columns
WHERE table_name = 'invoice' 
  AND column_name IN (
    'is_recurring', 
    'recurrence_day', 
    'parent_invoice_id', 
    'next_generation_date', 
    'auto_send',
    'max_occurrences',
    'occurrences_count',
    'end_date'
  );
-- Résultat attendu: 8

-- 3. Vérifier les index créés
SELECT 
  'Index créés' as verification,
  COUNT(*) as status
FROM pg_indexes
WHERE tablename = 'invoice'
  AND indexname IN (
    'idx_invoice_parent_invoice_id',
    'idx_invoice_next_generation_date',
    'idx_invoice_is_recurring'
  );
-- Résultat attendu: 3

-- 4. Vérifier les valeurs par défaut
SELECT 
  'Factures existantes migrées' as verification,
  CASE 
    WHEN COUNT(*) = COUNT(CASE WHEN is_recurring = 'oneshot' THEN 1 END)
      AND COUNT(*) = COUNT(CASE WHEN occurrences_count = 0 THEN 1 END)
    THEN true
    ELSE false
  END as status
FROM invoice;
-- Résultat attendu: true

-- 5. Afficher le détail des colonnes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'invoice' 
  AND column_name IN (
    'is_recurring', 
    'recurrence_day', 
    'parent_invoice_id', 
    'next_generation_date', 
    'auto_send',
    'max_occurrences',
    'occurrences_count',
    'end_date'
  )
ORDER BY column_name;

-- 6. Statistiques globales
SELECT 
  COUNT(*) as total_factures,
  COUNT(CASE WHEN is_recurring != 'oneshot' THEN 1 END) as factures_recurrentes,
  COUNT(CASE WHEN max_occurrences IS NOT NULL THEN 1 END) as avec_limite,
  COUNT(CASE WHEN occurrences_count > 0 THEN 1 END) as deja_generees
FROM invoice;

-- ============================================
-- Si tous les tests passent, la migration est réussie ✅
-- ============================================
