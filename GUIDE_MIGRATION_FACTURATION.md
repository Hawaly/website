# 🚀 Guide de Migration - Système de Facturation Optimisé

## 📋 Vue d'ensemble

Ce guide vous accompagne dans la migration complète de votre système de facturation pour activer les **factures récurrentes avec durée limitée**.

---

## ⚠️ IMPORTANT - À Lire Avant de Commencer

### Prérequis
- ✅ Accès administrateur à Supabase
- ✅ Sauvegarde de la base de données (RECOMMANDÉ)
- ✅ Environnement de test disponible (FORTEMENT RECOMMANDÉ)

### Durée estimée
- **Migration SQL** : 2-3 minutes
- **Tests de vérification** : 5 minutes
- **Total** : ~10 minutes

---

## 📝 ÉTAPE 1 : Sauvegarde de la Base de Données

### Option A : Via Supabase Dashboard

1. Accédez à votre projet Supabase
2. Allez dans **Settings** → **Database**
3. Cliquez sur **Backup Database**
4. Téléchargez le fichier de sauvegarde

### Option B : Via SQL (Recommandé pour les experts)

```sql
-- Créer une table de backup de la table invoice
CREATE TABLE invoice_backup_20250127 AS 
SELECT * FROM invoice;

-- Vérifier le nombre de lignes
SELECT COUNT(*) FROM invoice;
SELECT COUNT(*) FROM invoice_backup_20250127;
```

---

## 🗄️ ÉTAPE 2 : Exécuter la Migration SQL

### A. Accéder à l'éditeur SQL Supabase

1. Ouvrez votre projet Supabase : https://supabase.com/dashboard/project/[VOTRE_PROJECT_ID]
2. Dans le menu latéral, cliquez sur **SQL Editor**
3. Cliquez sur **New Query**

### B. Copier le script de migration

Ouvrez le fichier `migrations/add_recurring_invoices.sql` et copiez **tout son contenu**.

### C. Exécuter le script

1. Collez le script dans l'éditeur SQL
2. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)
3. Attendez le message de confirmation

### D. Vérifier le résultat

Vous devriez voir :

```
Success. No rows returned
```

Ou un message similaire indiquant que la migration s'est bien déroulée.

---

## 🔍 ÉTAPE 3 : Vérification Post-Migration

### Script de Vérification Automatique

Exécutez ce script SQL pour vérifier que tout est en place :

```sql
-- 1. Vérifier l'existence du type enum
SELECT EXISTS (
    SELECT 1 
    FROM pg_type 
    WHERE typname = 'invoice_recurrence'
) AS enum_exists;
-- Résultat attendu: true

-- 2. Vérifier les nouvelles colonnes
SELECT column_name, data_type, is_nullable, column_default
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
-- Résultat attendu: 8 lignes

-- 3. Vérifier les index
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'invoice'
  AND indexname IN (
    'idx_invoice_parent_invoice_id',
    'idx_invoice_next_generation_date',
    'idx_invoice_is_recurring'
  );
-- Résultat attendu: 3 lignes

-- 4. Vérifier les valeurs par défaut des factures existantes
SELECT 
  COUNT(*) as total_factures,
  COUNT(CASE WHEN is_recurring = 'oneshot' THEN 1 END) as factures_oneshot,
  COUNT(CASE WHEN occurrences_count = 0 THEN 1 END) as factures_count_zero
FROM invoice;
-- Toutes les factures existantes doivent avoir is_recurring='oneshot' et occurrences_count=0
```

### Résultats Attendus

1. **enum_exists** : `true`
2. **Colonnes** : 8 colonnes retournées avec les bons types
3. **Index** : 3 index créés
4. **Données** : Toutes les factures existantes doivent avoir `is_recurring='oneshot'` et `occurrences_count=0`

---

## ✅ ÉTAPE 4 : Test de Fonctionnalité

### Test 1 : Créer une Facture Récurrente Limitée

1. Accédez à votre application : `/factures/new`
2. Remplissez les informations de base
3. Dans la section **Facturation Récurrente** :
   - Type : **Mensuel**
   - Jour de génération : **1**
   - Durée : **Nombre de factures** → **12 mois**
   - Envoi auto : **Oui**
4. Créez la facture

### Vérification SQL

```sql
SELECT 
  invoice_number,
  is_recurring,
  recurrence_day,
  max_occurrences,
  occurrences_count,
  next_generation_date,
  auto_send
FROM invoice
WHERE is_recurring != 'oneshot'
ORDER BY created_at DESC
LIMIT 1;
```

**Résultat attendu :**
- `is_recurring` : `mensuel`
- `recurrence_day` : `1`
- `max_occurrences` : `12`
- `occurrences_count` : `0`
- `auto_send` : `true`

### Test 2 : Générer une Facture Récurrente

1. Accédez à `/factures-recurrentes`
2. Cliquez sur **Générer maintenant** sur votre facture de test
3. Vérifiez qu'une nouvelle facture est créée

### Vérification SQL

```sql
-- Vérifier que le compteur a été incrémenté
SELECT 
  invoice_number,
  occurrences_count,
  max_occurrences,
  next_generation_date
FROM invoice
WHERE is_recurring != 'oneshot'
ORDER BY created_at DESC
LIMIT 1;
```

**Résultat attendu :**
- `occurrences_count` : `1` (incrémenté)
- `next_generation_date` : Date future (1 mois plus tard)

---

## 🔧 ÉTAPE 5 : Configuration de l'API Automatique (Optionnel)

Pour générer automatiquement les factures récurrentes, configurez un CRON job :

### Option A : Vercel Cron Jobs

Créez `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/invoices/recurring/batch-generate",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Option B : GitHub Actions

Créez `.github/workflows/generate-invoices.yml` :

```yaml
name: Generate Recurring Invoices
on:
  schedule:
    - cron: '0 2 * * *'  # Tous les jours à 2h du matin
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Call API
        run: |
          curl -X POST https://votre-domaine.com/api/invoices/recurring/batch-generate
```

---

## 🎯 ÉTAPE 6 : Mise à Jour du Code (Si pas déjà fait)

Les fichiers suivants ont été modifiés/créés :

### Nouveaux Fichiers
- ✅ `src/components/RecurringInvoiceConfig.tsx`
- ✅ `lib/invoiceReports.ts` (fonctions utilitaires)
- ✅ `src/app/(dashboard)/factures-recurrentes/page.tsx`
- ✅ `src/app/api/invoices/recurring/generate/route.ts`
- ✅ `src/app/api/invoices/recurring/batch-generate/route.ts`

### Fichiers Modifiés
- ✅ `types/database.ts` (nouveaux champs Invoice)
- ✅ `src/app/(dashboard)/factures/new/page.tsx` (intégration RecurringInvoiceConfig)

### Vérification Git

```bash
git status
git diff types/database.ts
git diff src/app/\(dashboard\)/factures/new/page.tsx
```

---

## 📊 ÉTAPE 7 : Monitoring et Logs

### Requête de Monitoring

```sql
-- Vue d'ensemble des factures récurrentes
SELECT 
  COUNT(*) FILTER (WHERE is_recurring = 'mensuel') as mensuelles,
  COUNT(*) FILTER (WHERE is_recurring = 'trimestriel') as trimestrielles,
  COUNT(*) FILTER (WHERE is_recurring = 'annuel') as annuelles,
  COUNT(*) FILTER (WHERE is_recurring != 'oneshot' AND max_occurrences IS NULL) as illimitees,
  COUNT(*) FILTER (WHERE is_recurring != 'oneshot' AND occurrences_count >= max_occurrences) as terminees
FROM invoice;

-- Factures à générer aujourd'hui
SELECT 
  invoice_number,
  is_recurring,
  next_generation_date,
  occurrences_count,
  max_occurrences
FROM invoice
WHERE is_recurring != 'oneshot'
  AND next_generation_date <= CURRENT_DATE
ORDER BY next_generation_date;
```

---

## ⚠️ Rollback en Cas de Problème

Si vous rencontrez des problèmes, vous pouvez annuler la migration :

```sql
BEGIN;

-- Supprimer les index
DROP INDEX IF EXISTS idx_invoice_is_recurring;
DROP INDEX IF EXISTS idx_invoice_next_generation_date;
DROP INDEX IF EXISTS idx_invoice_parent_invoice_id;

-- Supprimer les colonnes
ALTER TABLE public.invoice 
  DROP COLUMN IF EXISTS end_date,
  DROP COLUMN IF EXISTS occurrences_count,
  DROP COLUMN IF EXISTS max_occurrences,
  DROP COLUMN IF EXISTS auto_send,
  DROP COLUMN IF EXISTS next_generation_date,
  DROP COLUMN IF EXISTS parent_invoice_id,
  DROP COLUMN IF EXISTS recurrence_day,
  DROP COLUMN IF EXISTS is_recurring;

-- Supprimer le type enum
DROP TYPE IF EXISTS invoice_recurrence;

COMMIT;
```

**⚠️ ATTENTION** : Cette opération supprimera toutes les données de récurrence. Assurez-vous d'avoir une sauvegarde !

---

## 📖 Documentation Utilisateur

### Créer une Facture Récurrente

1. Allez sur **Comptabilité** → **Factures** → **Nouvelle facture**
2. Remplissez les informations de base (client, montant, etc.)
3. Dans la section **Facturation Récurrente** :
   - **Type** : Choisir Mensuel, Trimestriel ou Annuel
   - **Jour de génération** : Jour du mois (1-31)
   - **Date de première génération** : Date de début
   - **Durée** :
     - **Illimité** : Génération continue
     - **Nombre de factures** : Ex: 12 pour 12 mois
     - **Date de fin** : Arrêt à une date précise
   - **Envoi automatique** : Les factures générées seront automatiquement envoyées

### Gérer les Factures Récurrentes

1. Allez sur **Comptabilité** → **Factures récurrentes**
2. Vous verrez :
   - Barre de progression (ex: 3/12 factures générées)
   - Statut (Actif, Terminé, Expiré)
   - Montant total prévu
   - Prochaine date de génération
3. Actions disponibles :
   - **Générer maintenant** : Forcer la génération immédiate
   - **Voir l'historique** : Liste des factures générées
   - **Modifier** : Changer la configuration

---

## 🆘 Dépannage

### Problème : "Column does not exist"

**Cause** : La migration n'a pas été exécutée correctement

**Solution** :
```sql
-- Vérifier l'existence des colonnes
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'invoice';

-- Ré-exécuter la migration si nécessaire
```

### Problème : "Type invoice_recurrence does not exist"

**Cause** : Le type enum n'a pas été créé

**Solution** :
```sql
-- Recréer le type
CREATE TYPE invoice_recurrence AS ENUM ('oneshot', 'mensuel', 'trimestriel', 'annuel');
```

### Problème : Les factures ne se génèrent pas automatiquement

**Cause** : Le CRON job n'est pas configuré

**Solution** :
1. Vérifier que l'API `/api/invoices/recurring/batch-generate` fonctionne
2. Tester manuellement : 
   ```bash
   curl -X POST https://votre-domaine.com/api/invoices/recurring/batch-generate
   ```
3. Configurer le CRON (voir Étape 5)

---

## ✅ Checklist Finale

- [ ] Sauvegarde de la base de données créée
- [ ] Migration SQL exécutée avec succès
- [ ] Script de vérification exécuté (tous les tests passent)
- [ ] Test de création de facture récurrente réussi
- [ ] Test de génération manuelle réussi
- [ ] Page `/factures-recurrentes` accessible
- [ ] Composant RecurringInvoiceConfig s'affiche dans `/factures/new`
- [ ] Documentation lue et comprise
- [ ] (Optionnel) CRON job configuré

---

## 📞 Support

En cas de problème :

1. Vérifiez les logs Supabase : **Logs** → **Postgres Logs**
2. Vérifiez les logs applicatifs dans la console navigateur
3. Consultez `FACTURES_RECURRENTES_README.md` pour plus de détails
4. Vérifiez que tous les fichiers ont bien été créés/modifiés

---

## 🎉 Félicitations !

Votre système de facturation optimisé est maintenant opérationnel ! Vous pouvez :

- ✅ Créer des factures récurrentes (mensuel, trimestriel, annuel)
- ✅ Limiter la durée (nombre de mois ou date de fin)
- ✅ Visualiser la progression en temps réel
- ✅ Gérer automatiquement l'arrêt des récurrences
- ✅ Suivre les historiques de génération

**Bon travail !** 🚀
