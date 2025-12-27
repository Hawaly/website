# Factures Récurrentes et Rapports Mensuels

## 📋 Vue d'ensemble

Ce module ajoute deux fonctionnalités majeures à votre application de gestion:

1. **Rapports Mensuels** : Visualisation détaillée des factures facturées et payées par mois
2. **Factures Récurrentes** : Gestion automatique des factures récurrentes (abonnements, contrats mensuels, etc.)

## 🗄️ Migration de la base de données

Avant d'utiliser ces fonctionnalités, vous devez exécuter la migration SQL:

```bash
# Dans votre interface Supabase SQL Editor, exécutez:
d:\urstory\agency\migrations\add_recurring_invoices.sql
```

Cette migration ajoute:
- Le type enum `invoice_recurrence` (oneshot, mensuel, trimestriel, annuel)
- Les colonnes nécessaires à la table `invoice`:
  - `is_recurring`: Type de récurrence
  - `recurrence_day`: Jour du mois pour la génération (1-31)
  - `parent_invoice_id`: Référence au modèle de facture
  - `next_generation_date`: Date de la prochaine génération
  - `auto_send`: Envoi automatique lors de la génération
- Les index pour optimiser les performances

## 📊 Rapports Mensuels

### Accès
Navigation: **Comptabilité** → **Rapports mensuels**
URL: `/rapports-mensuels`

### Fonctionnalités

1. **Sélection du mois**: Naviguez entre les mois avec les flèches ← →
2. **KPIs mensuels**:
   - **Facturées**: Total des factures émises ce mois
   - **Payées**: Total des factures payées ce mois
   - **Impayées**: Total des factures en attente
   - **Taux de paiement**: Pourcentage de factures payées

3. **Listes détaillées**:
   - Liste des factures payées avec liens directs
   - Liste des factures impayées pour suivi

### Code exemple

```typescript
import { getMonthlyStats } from '@/lib/invoiceReports';

// Obtenir les stats pour novembre 2024
const stats = await getMonthlyStats(2024, 10); // month: 0-11

console.log(stats.facturees.total); // Total facturé
console.log(stats.payees.total); // Total payé
console.log(stats.taux_paiement); // Taux en %
```

## 🔄 Factures Récurrentes

### Accès
Navigation: **Comptabilité** → **Factures récurrentes**
URL: `/factures-recurrentes`

### Créer une facture récurrente

1. Créez une facture normale via `/factures/new`
2. Cochez l'option "Facture récurrente"
3. Configurez:
   - **Type de récurrence**: Mensuel, Trimestriel, ou Annuel
   - **Jour de génération**: Jour du mois (1-31)
   - **Date de première génération**: Quand commencer
   - **Envoi automatique**: Envoyer automatiquement ou garder en brouillon

### Gestion

La page **Factures récurrentes** permet de:
- Voir toutes les factures récurrentes actives
- Consulter l'historique de génération
- Activer/Désactiver une récurrence
- Voir les factures à générer

### Génération automatique

#### Génération manuelle d'une facture

```bash
POST /api/invoices/recurring/generate
{
  "invoiceId": 123
}
```

#### Génération en batch (toutes les factures dues)

```bash
POST /api/invoices/recurring/batch-generate
```

Cette API:
- Identifie toutes les factures dont `next_generation_date` ≤ aujourd'hui
- Génère une nouvelle facture pour chacune
- Met à jour `next_generation_date` automatiquement
- Copie tous les items de la facture modèle

### Automatisation (recommandé)

Pour une génération automatique quotidienne, configurez un cron job:

**Exemple avec Vercel Cron:**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/invoices/recurring/batch-generate",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Exemple avec GitHub Actions:**

```yaml
# .github/workflows/generate-invoices.yml
name: Generate Recurring Invoices
on:
  schedule:
    - cron: '0 9 * * *'  # Tous les jours à 9h
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Generate invoices
        run: |
          curl -X POST https://votre-app.com/api/invoices/recurring/batch-generate
```

## 📚 Bibliothèque de fonctions

### `lib/invoiceReports.ts`

```typescript
// Statistiques mensuelles
const stats = await getMonthlyStats(2024, 11);

// Factures facturées sur un mois
const invoiced = await getInvoicedByMonth(2024, 11);

// Factures payées sur un mois
const paid = await getPaidByMonth(2024, 11);

// Stats multi-mois (pour graphiques)
const multiStats = await getMultiMonthStats(2024, 0, 12); // Toute l'année

// Factures récurrentes actives
const recurring = await getRecurringInvoices();

// Historique d'une facture récurrente
const history = await getRecurringInvoiceHistory(123);

// Générer une facture récurrente
const newInvoice = await generateRecurringInvoice(123);

// Calculer la prochaine date
const nextDate = calculateNextGenerationDate(
  new Date(), 
  'mensuel', 
  15  // 15 du mois
);
```

## 🎯 Cas d'usage

### 1. Abonnement mensuel

Client avec un contrat à CHF 1'500/mois:

1. Créez une facture de CHF 1'500
2. Configurez: Récurrence **Mensuel**, Jour **1**
3. Activez **Envoi automatique**
4. La facture sera générée et envoyée automatiquement le 1er de chaque mois

### 2. Reporting trimestriel

Facture de reporting à CHF 3'000 tous les 3 mois:

1. Créez la facture modèle
2. Configurez: Récurrence **Trimestriel**, Jour **15**
3. Les factures seront générées tous les 3 mois le 15

### 3. Analyse mensuelle des revenus

Visualiser les performances par mois:

1. Allez dans **Rapports mensuels**
2. Naviguez entre les mois
3. Consultez le taux de paiement et les montants
4. Identifiez les factures impayées pour relance

## 🔧 Maintenance

### Vérifier les factures à générer

```sql
SELECT * FROM invoice 
WHERE is_recurring != 'oneshot' 
  AND next_generation_date <= CURRENT_DATE
  AND parent_invoice_id IS NULL;
```

### Désactiver une facture récurrente

```sql
UPDATE invoice 
SET is_recurring = 'oneshot' 
WHERE id = 123;
```

### Voir l'historique de génération

```sql
SELECT * FROM invoice 
WHERE parent_invoice_id = 123 
ORDER BY issue_date DESC;
```

## ⚠️ Points importants

1. **Jour invalide**: Si vous choisissez le 31 pour un mois qui n'en a que 30, le système utilisera automatiquement le dernier jour du mois
2. **Statut des factures générées**: Par défaut en "brouillon", sauf si "Envoi automatique" est activé
3. **Modifications**: Modifier une facture récurrente ne modifie pas les factures déjà générées
4. **Suppression**: Supprimer une facture récurrente ne supprime pas son historique (sauf CASCADE)

## 🚀 Prochaines étapes recommandées

1. **Notifications**: Ajouter des emails automatiques lors de la génération
2. **Dashboard**: Intégrer les KPIs mensuels dans le dashboard principal
3. **Prévisions**: Utiliser les factures récurrentes pour prévoir le CA
4. **Relances**: Système de relance automatique pour factures impayées
5. **Webhooks**: Notifier un système externe lors de la génération

## 📞 Support

En cas de problème:
1. Vérifiez que la migration SQL a été exécutée
2. Consultez les logs de l'API `/api/invoices/recurring/*`
3. Vérifiez les index de la base de données
