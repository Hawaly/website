# 🗺️ Roadmap - Migration Supabase Auth & RLS

## ✅ Phases Complétées

### Phase 1 : Préparation Base de Données (30 min)
**Status :** ✅ TERMINÉ

- [x] Colonne `auth_user_id` ajoutée dans `app_user`
- [x] Index et contraintes créés
- [x] Fonctions `public.is_admin()`, `public.is_client()`, etc. créées
- [x] Base de données prête pour JWT Supabase

**Script exécuté :** `migrations/20260104_supabase_auth_integration_fixed.sql`

---

### Phase 2 : Migration Backend API (15 min)
**Status :** ✅ TERMINÉ

- [x] `lib/supabaseAdmin.ts` créé
- [x] `SERVICE_ROLE_KEY` ajoutée dans `.env.local`
- [x] 11 API routes migrées vers `supabaseAdmin`
- [x] Backend bypass RLS (ready for future activation)

**Fichiers modifiés :**
- `src/app/api/sales/prospects/route.ts`
- `src/app/api/sales/prospects/[id]/route.ts`
- `src/app/api/sales/activities/route.ts`
- `src/app/api/sales/activities/[id]/route.ts`
- `src/app/api/sales/pitch-decks/route.ts`
- `src/app/api/sales/pitch-decks/[id]/route.ts`
- `src/app/api/sales/meetings/route.ts`
- `src/app/api/sales/meetings/[id]/route.ts`
- `src/app/api/sales/meetings/[id]/export-ics/route.ts`
- `src/app/api/sales/meeting-minutes/route.ts`
- `src/app/api/sales/meeting-minutes/[id]/route.ts`

---

## 🔄 Phases Restantes

### Phase 3 : Migration des Users vers Supabase Auth (1-2h)

**Objectif :** Créer des comptes Supabase Auth pour tous les users existants

**Prérequis :**
- ✅ Phase 1 et 2 complétées
- ✅ `SERVICE_ROLE_KEY` configurée

**Actions :**
1. Exécuter le script de migration automatique
2. Vérifier que tous les users ont un `auth_user_id`
3. Notifier les users de leur nouveau mot de passe temporaire

**Script à exécuter :**
```bash
npx tsx scripts/migrate-users-to-supabase-auth.ts
```

**Validation :**
```sql
-- Vérifier que tous les users ont un auth_user_id
SELECT 
  id, 
  email, 
  auth_user_id,
  CASE 
    WHEN auth_user_id IS NULL THEN '❌ À migrer'
    ELSE '✅ Migré'
  END as status
FROM app_user
ORDER BY auth_user_id NULLS FIRST;
```

**Durée estimée :** 1-2h (selon nombre d'users)

---

### Phase 4 : Migration Auth UI (4-6h)

**Objectif :** Remplacer le système d'authentification custom par Supabase Auth

**Prérequis :**
- ✅ Phase 3 complétée (users migrés)
- ✅ Notification envoyée aux users

**Actions :**

#### 4.1 - Installer dépendances (5 min)
```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

#### 4.2 - Créer client Supabase browser (10 min)
- Créer `lib/supabase.ts` pour composants client
- Utilise JWT Supabase automatiquement

#### 4.3 - Créer page Login Supabase (1h)
- Nouvelle page `/login` avec `signInWithPassword`
- Redirection selon role après login
- Gestion erreurs

#### 4.4 - Créer Middleware (30 min)
- Protection routes `/dashboard`, `/sales`, etc.
- Vérification JWT Supabase
- Redirection vers `/login` si non authentifié

#### 4.5 - Remplacer ancien système auth (2h)
- Supprimer ancien login custom
- Mettre à jour composants utilisant auth
- Tester tous les flows

#### 4.6 - Tests complets (1h)
- Login admin → accès total
- Login client → accès restreint
- Logout → redirection login
- Routes protégées

**Fichiers à créer/modifier :**
- `lib/supabase.ts` (nouveau)
- `app/(auth)/login/page.tsx` (remplacer)
- `middleware.ts` (créer/modifier)
- `app/layout.tsx` (ajouter session provider)

**Durée estimée :** 4-6h

---

### Phase 5 : Activation RLS (15 min)

**Objectif :** Activer Row Level Security sur toutes les tables

⚠️ **CRITIQUE : À faire UNIQUEMENT après Phase 4 complète**

**Prérequis :**
- ✅ Phase 4 complétée et testée
- ✅ Tous les users peuvent se connecter via Supabase Auth
- ✅ Session JWT fonctionne correctement

**Actions :**
1. Backup complet de la base de données
2. Exécuter le script RLS
3. Tests intensifs
4. Rollback si problème

**Script à exécuter :**
```sql
-- Dans Supabase SQL Editor
-- Copier/coller: migrations/20260104_enable_rls_with_supabase_auth.sql
```

**Validation :**
```sql
-- Vérifier RLS activé
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname='public' 
ORDER BY tablename;

-- Vérifier policies créées
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd as operation
FROM pg_policies 
WHERE schemaname='public' 
ORDER BY tablename, policyname;
```

**Tests post-activation :**
1. Login admin → doit voir toutes les données
2. Login client → doit voir uniquement ses données
3. Requête non auth → doit retourner 0 résultats
4. API routes → doivent fonctionner (bypass RLS)

**Durée estimée :** 15 min

---

## 📅 Timeline Recommandée

### Option A : Sprint Court (1 semaine)
```
Lundi    : Phase 3 - Migration users (1-2h)
Mardi    : Phase 4.1-4.3 - Setup Auth UI (2h)
Mercredi : Phase 4.4-4.5 - Remplacer ancien système (3h)
Jeudi    : Phase 4.6 - Tests Auth UI (1h)
Vendredi : Phase 5 - Activation RLS (15 min) + Tests finaux
```

**Total : ~1 semaine** (6-8h de dev)

### Option B : Migration Progressive (1 mois)
```
Semaine 1 : Phase 3 - Migration users
Semaine 2 : Phase 4.1-4.3 - Setup Auth UI  
Semaine 3 : Phase 4.4-4.6 - Finaliser Auth UI
Semaine 4 : Phase 5 - Activation RLS
```

**Total : ~1 mois** (même temps de dev, mais étalé)

### Option C : Quand tu veux (flexible)
```
Maintenant : Rien (app fonctionne)
Plus tard  : Phases 3-5 quand prêt
```

---

## 🛠️ Scripts d'Automatisation Disponibles

### 1. Migration Users
```bash
npx tsx scripts/migrate-users-to-supabase-auth.ts
```
Crée automatiquement tous les users Supabase et lie `auth_user_id`.

### 2. Vérification Migration
```bash
npx tsx scripts/verify-migration-status.ts
```
Affiche un rapport détaillé de l'état de la migration.

### 3. Test RLS Policies
```bash
npx tsx scripts/test-rls-policies.ts
```
Teste que les policies RLS fonctionnent correctement.

### 4. Rollback RLS (urgence)
```bash
npx tsx scripts/rollback-rls.ts
```
Désactive RLS en cas de problème critique.

---

## 📋 Checklist Finale

### Avant d'Activer RLS

- [ ] Phase 3 : Tous les users ont `auth_user_id` rempli
- [ ] Phase 4 : Login Supabase fonctionne pour admin
- [ ] Phase 4 : Login Supabase fonctionne pour client
- [ ] Phase 4 : Middleware protège les routes correctement
- [ ] Phase 4 : Logout fonctionne
- [ ] Backup DB complet effectué
- [ ] Tests en environnement de staging (si possible)

### Après Activation RLS

- [ ] Login admin → accès total confirmé
- [ ] Login client → accès restreint confirmé
- [ ] Requête non auth → retourne 0 résultats
- [ ] API routes fonctionnent (prospects, activities, etc.)
- [ ] Aucune erreur "permission denied" dans logs
- [ ] Performance acceptable (pas de ralentissement)

---

## 🆘 Rollback Plan

Si problème après activation RLS :

### 1. Désactivation RLS immédiate
```sql
-- Désactiver RLS sur toutes les tables
DO $$
DECLARE
  t_name text;
BEGIN
  FOR t_name IN 
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', t_name);
  END LOOP;
END $$;
```

### 2. Restaurer backup
```bash
# Si désactivation RLS pas suffisante
pg_restore -d database backup.dump
```

### 3. Investiguer
- Vérifier logs Supabase
- Tester policies une par une
- Corriger et réactiver

---

## 📞 Support

**Documentation complète :** `SUPABASE_AUTH_MIGRATION_GUIDE.md`

**Scripts disponibles :** `/scripts/`

**Migrations SQL :** `/migrations/`

---

**Dernière mise à jour :** 2026-01-04  
**Version :** 1.0
