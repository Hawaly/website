# 🔐 Guide de Migration vers Supabase Auth

## 📋 Vue d'ensemble

Ce guide explique comment migrer votre système d'authentification custom vers **Supabase Auth** tout en conservant votre schéma RBAC existant (`app_user`, `role`, `client_id`).

### ✅ Avantages de cette approche

- **Conservation du schéma** : Garde `app_user`, `role`, `client` intacts
- **RLS fonctionnel** : Policies basées sur JWT Supabase
- **Migration progressive** : Pas besoin de tout refaire d'un coup
- **Sécurité native** : Profite du système Auth de Supabase

---

## 🚀 Plan d'Implémentation

### **Phase 1 : Préparation Database** ✅ (30 min)

#### 1. Exécuter la migration d'intégration

Exécuter dans Supabase SQL Editor (copier/coller le contenu du fichier):

**Fichier:** `migrations/20260104_supabase_auth_integration_fixed.sql`

Cette migration :
- ✅ Ajoute `auth_user_id uuid` dans `app_user`
- ✅ Crée l'index et la FK vers `auth.users`
- ✅ Crée les fonctions `public.*` basées sur `auth.uid()`

#### 2. Vérifier les fonctions

Copier cette requête SQL (SANS les backticks markdown):

```
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('current_app_user_id', 'is_admin', 'is_client', 'current_user_client_id', 'is_authenticated');
```

**Résultat attendu:** 5+ fonctions dans le schéma `public`

---

### **Phase 2 : Migration Backend API** ⚙️ (2-3h)

#### 1. Créer client Supabase Admin

**Fichier: `lib/supabaseAdmin.ts`** (pour API routes)

```typescript
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}

// Client admin avec service_role (bypass RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

**Ajouter dans `.env.local`:**

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 2. Migrer les API routes

**Avant:**
```typescript
// src/app/api/sales/prospects/route.ts
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  const { data, error } = await supabase
    .from("prospects")
    .select("*");
  // ...
}
```

**Après:**
```typescript
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  // Admin bypasse RLS - accès total
  const { data, error } = await supabaseAdmin
    .from("prospects")
    .select("*");
  // ...
}
```

**⚠️ À migrer:**
- ✅ Toutes les routes dans `src/app/api/`
- ✅ Remplacer `supabase` par `supabaseAdmin`

---

### **Phase 3 : Créer Users Supabase** 👥 (Variable selon nombre d'users)

#### Option A : Script de migration automatique

**Créer: `scripts/migrate-users-to-supabase.ts`**

```typescript
import { supabaseAdmin } from '../lib/supabaseAdmin';

async function migrateUsers() {
  // 1. Récupérer tous les app_user existants
  const { data: appUsers, error } = await supabaseAdmin
    .from('app_user')
    .select('id, email, password_hash')
    .is('auth_user_id', null); // Seulement ceux non migrés

  if (error || !appUsers) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Found ${appUsers.length} users to migrate`);

  for (const user of appUsers) {
    try {
      // 2. Créer user dans Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: generateTemporaryPassword(), // Générer un mdp temporaire
        email_confirm: true // Auto-confirm
      });

      if (authError) {
        console.error(`Failed to create auth user for ${user.email}:`, authError);
        continue;
      }

      // 3. Lier app_user à auth.users
      const { error: updateError } = await supabaseAdmin
        .from('app_user')
        .update({ auth_user_id: authUser.user.id })
        .eq('id', user.id);

      if (updateError) {
        console.error(`Failed to link user ${user.email}:`, updateError);
      } else {
        console.log(`✅ Migrated: ${user.email}`);
      }

    } catch (err) {
      console.error(`Error processing ${user.email}:`, err);
    }
  }

  console.log('✅ Migration complete!');
}

function generateTemporaryPassword(): string {
  // Générer un mot de passe temporaire sécurisé
  return `Temp${Math.random().toString(36).slice(-8)}!`;
}

migrateUsers();
```

**Exécuter:**
```bash
npx tsx scripts/migrate-users-to-supabase.ts
```

#### Option B : Migration manuelle

Pour chaque utilisateur:

```sql
-- 1. Créer dans Supabase Auth (via Dashboard > Auth > Users)
-- Email: user@example.com, Password: temporary123

-- 2. Lier dans app_user
UPDATE public.app_user
SET auth_user_id = 'uuid-from-supabase-auth'
WHERE email = 'user@example.com';
```

---

### **Phase 4 : Migrer Auth UI** 🎨 (4-6h)

#### 1. Installer Supabase Auth Helpers

```bash
npm install @supabase/auth-helpers-nextjs
```

#### 2. Créer le client Supabase côté navigateur

**Fichier: `lib/supabase.ts`** (remplace `supabaseClient.ts`)

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();
```

#### 3. Créer page de login Supabase

**Fichier: `app/(auth)/login/page.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Login avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Récupérer le user app_user lié
      const { data: appUser, error: userError } = await supabase
        .from('app_user')
        .select('*, role:role_id(*)')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (userError) throw new Error('User not linked to app_user');

      // 3. Rediriger selon le rôle
      const redirectPath = appUser.role?.redirect_path || '/dashboard';
      router.push(redirectPath);
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded">{error}</div>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 border rounded"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 border rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
```

#### 4. Middleware pour protéger les routes

**Fichier: `middleware.ts`**

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Routes protégées
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/sales/:path*', '/clients/:path*'],
};
```

#### 5. Composant de session provider

**Fichier: `app/layout.tsx`** (root layout)

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function RootLayout({ children }) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.getSession();

  return (
    <html>
      <body>
        {/* Passer session aux composants si besoin */}
        {children}
      </body>
    </html>
  );
}
```

---

### **Phase 5 : Activer RLS** 🔒 (15 min)

**⚠️ NE PAS exécuter avant d'avoir migré Auth UI !**

```sql
-- Dans Supabase SQL Editor
\i migrations/20260104_enable_rls_with_supabase_auth.sql
```

Cette migration :
- ✅ Active RLS sur toutes les tables
- ✅ Crée policies admin (accès total)
- ✅ Crée policies client (accès aux données propres)
- ✅ Recrée les views avec `security_invoker = true`

---

### **Phase 6 : Tests** 🧪 (1-2h)

#### Tests critiques

```typescript
// 1. Login admin
// - Vérifier accès total à toutes les tables

// 2. Login client
// - Vérifier accès uniquement aux données du client
// - Tester: mandats, invoices, strategies, posts

// 3. Requêtes non authentifiées
// - Doivent retourner 0 résultats (RLS bloque)

// 4. API routes
// - Toutes les routes doivent utiliser supabaseAdmin
// - Vérifier pas de "permission denied"
```

---

## 🔧 Checklist de Migration

### Préparation

- [ ] Backup complet de la DB
- [ ] Tester en staging/dev first
- [ ] Documenter les users existants

### Database

- [ ] Exécuter `20260104_supabase_auth_integration.sql`
- [ ] Vérifier les fonctions auth.*
- [ ] Tester `SELECT auth.uid()` retourne NULL avant auth

### Backend

- [ ] Créer `lib/supabaseAdmin.ts`
- [ ] Ajouter `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`
- [ ] Migrer toutes les API routes vers `supabaseAdmin`
- [ ] Tester les API routes (doivent fonctionner)

### Users

- [ ] Créer script de migration users
- [ ] Exécuter migration (ou manuel)
- [ ] Vérifier `auth_user_id` rempli pour tous les users
- [ ] Envoyer emails avec nouveaux mots de passe

### Auth UI

- [ ] Créer `lib/supabase.ts` (client browser)
- [ ] Créer page `/login` avec Supabase Auth
- [ ] Créer page `/signup` si nécessaire
- [ ] Ajouter middleware pour routes protégées
- [ ] Implémenter logout
- [ ] Tester login/logout complet

### RLS

- [ ] **ATTENDRE** que Auth UI soit fonctionnelle
- [ ] Exécuter `20260104_enable_rls_with_supabase_auth.sql`
- [ ] Tester login admin → accès total
- [ ] Tester login client → accès restreint
- [ ] Vérifier logs Supabase (pas d'erreurs RLS)

### Frontend Components

- [ ] Migrer tous les `supabase.from()` côté client
- [ ] Remplacer par requêtes authentifiées
- [ ] Ou appeler les API routes

---

## ⚠️ Points d'Attention

### 1. Service Role Key = Super Admin

La `SUPABASE_SERVICE_ROLE_KEY` **bypass tous les RLS**. 

- ✅ À utiliser: API routes backend uniquement
- ❌ NE JAMAIS exposer côté client
- ❌ NE JAMAIS commit dans git

### 2. Migration progressive possible

Vous pouvez migrer par étapes :
1. Préparer DB + Backend API → **Ça ne casse rien**
2. Créer users Supabase progressivement
3. Activer RLS seulement quand Auth UI prête

### 3. Anciens users custom auth

Après migration, l'ancien système `current_setting('app.current_user_id')` **ne fonctionnera plus**.

Options:
- Tout migrer d'un coup (recommandé)
- Garder double auth temporairement (complexe)

---

## 🆘 Troubleshooting

### Erreur: "permission denied for table X"

**Cause:** RLS activé mais user pas authentifié via Supabase Auth

**Solution:**
```typescript
// Vérifier que le JWT est présent
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session); // Doit être non-null
```

### Erreur: "auth.uid() returns null"

**Cause:** Requête sans JWT Supabase

**Solution:**
- Frontend: utiliser `supabase` (avec JWT)
- Backend API: utiliser `supabaseAdmin` (bypass RLS)

### Erreur: "relation auth.users does not exist"

**Cause:** Supabase Auth pas activé dans le projet

**Solution:**
1. Dashboard Supabase → Authentication → Enable
2. Réexécuter migration

---

## 📊 Estimation Temps Total

| Phase | Durée | Complexité |
|-------|-------|-----------|
| DB Préparation | 30 min | ⭐ Facile |
| Backend API | 2-3h | ⭐⭐ Moyen |
| Migration Users | Variable | ⭐⭐ Moyen |
| Auth UI | 4-6h | ⭐⭐⭐ Complexe |
| Activer RLS | 15 min | ⭐ Facile |
| Tests | 1-2h | ⭐⭐ Moyen |
| **TOTAL** | **8-12h** | **⭐⭐⭐** |

---

## 🎯 Résultat Final

Après migration complète:

✅ **RLS actif** sur toutes les tables
✅ **Sécurité native** Supabase Auth
✅ **Schéma conservé** (`app_user`, `role`, `client`)
✅ **Policies fonctionnelles** (admin, client)
✅ **Linter Supabase satisfait** (pas de warnings)

---

## 📞 Support

Si problème pendant la migration, me notifier avec:
1. Phase en cours (DB, Backend, Auth UI, RLS)
2. Message d'erreur exact
3. Logs Supabase (si applicable)

---

**Dernière mise à jour:** 2026-01-04
