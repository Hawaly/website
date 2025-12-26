# YourStory Admin

Application web interne pour gérer la comptabilité de l'agence marketing YourStory.

## 🚀 Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Base de données**: Supabase (PostgreSQL)
- **Client DB**: @supabase/supabase-js v2

## 📦 Installation et Configuration

### 1. Installation des dépendances

Les dépendances sont déjà installées, mais si vous clonez le projet :

```bash
npm install
```

### 2. Configuration Supabase

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Pour obtenir vos clés :
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. **Settings** > **API**
4. Copiez l'URL et la clé anon/public

Voir le fichier `ENV_SETUP.md` pour plus de détails.

## 🏃‍♂️ Démarrer le projet

### Premier démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Créer .env.local avec vos clés Supabase + JWT_SECRET
# Voir ENV_SETUP.md

# 3. Créer les buckets Storage (contracts, receipts)
# Voir SUPABASE_STORAGE_SETUP.md et STORAGE_RECEIPTS_SETUP.md

# 4. Créer un utilisateur admin
node scripts/hash-password.js admin123
# Puis mettre à jour le hash dans Supabase

# 5. Démarrer
npm run dev
```

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

**Login par défaut :** admin / admin123

### Mode production

```bash
npm run build
npm start
```

## 📁 Structure du projet

```
compta/
├── app/                           # App Router de Next.js
│   ├── (auth)/                   # Route group authentification
│   │   ├── layout.tsx           # Layout simple sans sidebar
│   │   └── login/page.tsx       # Page de connexion
│   ├── (dashboard)/              # Route group pages internes
│   │   ├── layout.tsx           # Layout avec sidebar
│   │   ├── dashboard/page.tsx   # Tableau de bord
│   │   ├── clients/page.tsx     # Gestion clients
│   │   ├── mandats/page.tsx     # Gestion mandats
│   │   ├── factures/page.tsx    # Gestion factures
│   │   ├── depenses/page.tsx    # Suivi dépenses
│   │   └── settings/page.tsx    # Paramètres
│   ├── layout.tsx                # Layout racine
│   ├── page.tsx                  # Redirige vers /dashboard
│   └── globals.css               # Styles globaux
├── components/                    # Composants réutilisables
│   └── layout/
│       ├── Sidebar.tsx           # Menu de navigation
│       └── Header.tsx            # En-tête avec recherche
├── lib/                          # Librairies et utilitaires
│   └── supabaseClient.ts         # Client Supabase configuré
├── public/                       # Assets statiques
└── ...
```

## 🎯 État actuel

### ✅ Étape 1 - Structure de base (Complétée)
- ✅ Client Supabase configuré
- ✅ Layout avec sidebar et header
- ✅ Navigation complète (9 pages)
- ✅ Design moderne avec Tailwind
- ✅ Route Groups Next.js 14

### ✅ Étape 2 - Authentification (Complétée)
- ✅ Login custom avec username/password
- ✅ JWT sécurisés dans cookies HttpOnly
- ✅ Protection des routes avec middleware
- ✅ Validation bcrypt des mots de passe
- ✅ Déconnexion fonctionnelle
- ✅ Gestion complète des erreurs

### ✅ Étape 3 - Module Clients (Complétée)
- ✅ Liste des clients avec recherche et filtres
- ✅ Création de nouveaux clients
- ✅ Modification des clients existants
- ✅ Suppression de clients
- ✅ Page de détails avec onglets
- ✅ Adresse et code postal
- ✅ Types TypeScript générés
- ✅ Design moderne et responsive

### ✅ Étape 4 - Module Mandats et Tâches (Complétée)
- ✅ CRUD complet des mandats
- ✅ Liste des mandats par client
- ✅ Vue globale de tous les mandats
- ✅ **Gestion Kanban des tâches** (3 colonnes)
- ✅ Changement rapide de statut des tâches
- ✅ Création/Modification de tâches inline
- ✅ Navigation client ↔ mandat fluide

### ✅ Étape 5 - Génération de Contrats PDF (Complétée)
- ✅ Génération de PDF avec pdf-lib
- ✅ Upload vers Supabase Storage
- ✅ Numérotation automatique (CTR-YYYY-NNNN)
- ✅ Template professionnel
- ✅ Lien optionnel avec mandats
- ✅ Téléchargement sécurisé (URLs signées)
- ✅ Liste et historique des contrats

### ✅ Étape 6 - Module Facturation (Complétée)
- ✅ Création de factures multi-lignes
- ✅ Calcul automatique HT/TVA/TTC
- ✅ Génération de PDF de facture
- ✅ Changement de statut (marquer payée)
- ✅ Stats et suivi des paiements
- ✅ Filtres par statut et période
- ✅ Numérotation auto (FAC-YYYY-NNNN)

### ✅ Étape 7 - Module Dépenses (Complétée)
- ✅ Liste des dépenses avec stats
- ✅ Création et catégorisation
- ✅ **Upload de justificatifs** (PDF/Images)
- ✅ Association client/mandat conditionnelle
- ✅ Gestion dépenses récurrentes
- ✅ Filtres par période, type, catégorie
- ✅ Intégration dans fiches client/mandat

### ✅ Étape 8 - Dashboard Comptable (Complétée)
- ✅ KPIs financiers (CA, Dépenses, Bénéfice, Marge)
- ✅ Stats du mois ET de l'année
- ✅ Sélecteur de période (mois/année)
- ✅ Top 5 clients par CA (barres de progression)
- ✅ Répartition dépenses par catégorie
- ✅ Factures en attente de paiement
- ✅ Dépenses récurrentes mensuelles
- ✅ Actions rapides

### 🚧 Améliorations futures possibles
- [ ] Graphiques avancés (Chart.js/Recharts)
- [ ] Rapports et export CSV/Excel
- [ ] Envoi factures par email
- [ ] Budgets et alertes
- [ ] Comparaison période N vs N-1

## 🛠️ Commandes disponibles

```bash
npm run dev          # Démarre le serveur de développement
npm run build        # Build pour la production
npm start            # Démarre le serveur de production
npm run lint         # Vérifie le code avec ESLint
```

## ✅ État actuel du projet

### Étape 0 - Setup initial
- ✅ Projet Next.js 14 créé avec TypeScript
- ✅ Tailwind CSS configuré
- ✅ Supabase client installé et configuré

### Étape 1 - Structure et navigation
- ✅ Layout avec sidebar et header
- ✅ 9 pages créées et fonctionnelles
- ✅ Navigation complète entre toutes les sections
- ✅ Design moderne et responsive
- ✅ Route Groups pour séparer auth et dashboard

### Étape 2 - Authentification
- ✅ Login/Logout fonctionnel
- ✅ JWT sécurisés (cookies HttpOnly)
- ✅ Middleware de protection des routes
- ✅ Validation bcrypt des passwords
- ✅ Gestion des erreurs et états de chargement

### Étape 3 - Module Clients
- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ Liste avec recherche et filtres
- ✅ Types TypeScript générés
- ✅ Page de détails avec onglets
- ✅ Design cohérent et responsive

## 📚 Documentation

### Général
- `README.md` - Ce fichier
- `ENV_SETUP.md` - Configuration des variables d'environnement

### Étape 1 - Structure
- `RECAP_FINAL.md` - Résumé de l'étape 1
- `STRUCTURE_ETAPE1.md` - Architecture détaillée
- `REFERENCE_FICHIERS.md` - Code complet des fichiers

### Étape 2 - Authentification
- `RECAP_ETAPE2_AUTH.md` - Résumé de l'étape 2
- `AUTH_SETUP.md` - Guide complet d'authentification
- `REFERENCE_AUTH_CODE.md` - Code complet de l'auth

### Étape 3 - Module Clients
- `RECAP_ETAPE3_CLIENTS.md` - Résumé de l'étape 3
- `QUICKSTART_CLIENTS.md` - Démarrage rapide clients

## 🌐 Pages disponibles

| Route | Description | État |
|-------|-------------|------|
| `/` | Redirection → `/dashboard` | ✅ |
| `/login` | Page de connexion | ✅ Structure |
| `/dashboard` | Tableau de bord | ✅ Structure |
| `/clients` | Gestion des clients | ✅ Structure |
| `/mandats` | Gestion des mandats | ✅ Structure |
| `/factures` | Gestion des factures | ✅ Structure |
| `/depenses` | Suivi des dépenses | ✅ Structure |
| `/settings` | Paramètres | ✅ Structure |

Le projet est prêt pour l'ajout des fonctionnalités !
